// Only navigation needs an offline fallback. API requests and uploads go to the backend.
self.addEventListener('fetch', event => {
  if (event.request.mode !== 'navigate' || event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).catch(() => new Response(
    '<!doctype html><html lang="en"><meta name="viewport" content="width=device-width, initial-scale=1"><title>The Eyes is offline</title><main style="font:1.15rem system-ui;max-width:32rem;margin:12vh auto;padding:1rem"><h1>The Eyes is offline</h1><p>Connect to the internet to analyze an image.</p><a href="/">Try again</a></main></html>',
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )));
});
