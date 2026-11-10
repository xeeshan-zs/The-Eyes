"""Download the four data shards of the public real/generated scene dataset."""

import hashlib
import json
from http.client import IncompleteRead
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import time
from urllib.error import URLError
from urllib.request import Request, urlopen


REPO = "julienlucas/midjourney-dalle-sd-dataset"
REVISION = "800a266"
DEST = Path(__file__).resolve().parents[1] / "data-set" / "public-scenes"
CHUNK = 8 * 1024 * 1024


def read_range(url, start, size):
    end = min(start + CHUNK, size) - 1
    req = Request(f"{url}?part={start}", headers={"Range": f"bytes={start}-{end}"})
    for attempt in range(4):
        try:
            with urlopen(req, timeout=120) as response:
                if response.headers.get("Content-Range") != f"bytes {start}-{end}/{size}":
                    raise ValueError("Server returned a different range than requested")
                data = response.read(end - start + 2)
            if len(data) != end - start + 1:
                raise IncompleteRead(data)
            return data
        except (URLError, TimeoutError, ConnectionError, IncompleteRead):
            if attempt == 3:
                raise
            time.sleep(2 ** attempt)


def download(item):
    target = DEST / Path(item["path"]).name
    expected, size = item["lfs"]["oid"], item["size"]
    if target.is_file():
        with target.open("rb") as handle:
            if hashlib.file_digest(handle, "sha256").hexdigest() == expected:
                return
    url = f"https://huggingface.co/datasets/{REPO}/resolve/{REVISION}/{item['path']}"
    partial = target.with_suffix(".partial")
    offset = partial.stat().st_size if partial.exists() else 0
    print(f"Downloading {target.name}: {offset / 1e6:.0f}/{size / 1e6:.0f} MB", flush=True)
    with partial.open("ab") as handle, ThreadPoolExecutor(max_workers=4) as pool:
        while offset < size:
            starts = range(offset, min(size, offset + 4 * CHUNK), CHUNK)
            chunks = pool.map(lambda start: read_range(url, start, size), starts)
            for chunk in chunks:
                handle.write(chunk)
                offset += len(chunk)
            print(f"{target.name}: {offset * 100 / size:.0f}%", flush=True)
    with partial.open("rb") as handle:
        if hashlib.file_digest(handle, "sha256").hexdigest() != expected:
            raise ValueError(f"Bad checksum: {partial}. Remove the incomplete file before retrying.")
    partial.replace(target)
    print(f"Verified {target.name}", flush=True)


def main():
    DEST.mkdir(parents=True, exist_ok=True)
    api = f"https://huggingface.co/api/datasets/{REPO}/tree/{REVISION}/data"
    with urlopen(api, timeout=30) as response:
        files = [item for item in json.load(response) if item["path"].endswith(".parquet")]
    if len(files) != 4:
        raise RuntimeError("Expected three training shards and one test shard.")
    for item in files:
        download(item)


if __name__ == "__main__":
    main()
