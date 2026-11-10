# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

First-time visitors, including people seeing The Eyes at an exhibition, who want to upload an image and understand the detector's result quickly.

## Product Purpose

The Eyes estimates whether an uploaded image's patterns suggest a real photograph or AI generation. Visitors should be able to choose an image, wait for analysis, and read the result without needing technical knowledge.

## Operating Context

The site is used on phones and desktop browsers and will be presented at an exhibition. The image analysis runs through the backend, so the experience depends on connectivity and server availability.

## Capabilities and Constraints

- Upload an image or try a sample; show the result with a visual spectrum and supporting measurements.
- Let visitors test the same image again or choose a new image.
- Keep detector status truthful and clear.
- A classification is an estimate based on image patterns, not proof of origin; avoid overstating certainty.

## Brand Commitments

Keep the name The Eyes and the existing yellow, black, and white identity while refining the established interface. Exhibition presentation should feel professional and easy to use.

## Evidence on Hand

The repository contains the existing React frontend, FastAPI backend, trained classifier, and README explaining the image analysis method. No verified claim of perfect detection accuracy is established.

## Product Principles

- Make image upload obvious on first view.
- Present the result in plain language before technical detail.
- Preserve trust through accurate status and measured claims.
- Keep the main task easy on a phone.
