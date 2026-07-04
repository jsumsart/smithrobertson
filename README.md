# Smith Robertson Collections

This repository now publishes a static public collections site from GitHub Pages.

## What is live

- [index.html](/Users/Birittany/Documents/SmithRobertson/index.html): the live digital gallery homepage
- [archive.html](/Users/Birittany/Documents/SmithRobertson/archive.html): the public archive view
- [catalog.js](/Users/Birittany/Documents/SmithRobertson/catalog.js): the single runtime for the public gallery and archive
- [styles.css](/Users/Birittany/Documents/SmithRobertson/styles.css): shared styling

## Source of truth

- [data/records.csv](/Users/Birittany/Documents/SmithRobertson/data/records.csv): the published collection data used by the site
- [data/public-records.json](/Users/Birittany/Documents/SmithRobertson/data/public-records.json): build-generated public data used for faster page loads
- [data-source-config.js](/Users/Birittany/Documents/SmithRobertson/data-source-config.js): branding, curated accessions, and the CSV path
- [data/google-sheets-template.csv](/Users/Birittany/Documents/SmithRobertson/data/google-sheets-template.csv): starter sheet template
- [public-images/thumbs](/Users/Birittany/Documents/SmithRobertson/public-images/thumbs): build-generated thumbnails used by the public pages

There is no active web login and no live backend editor right now.

## Current workflow

1. Take or export a new object photo.
2. Copy it into the collection with `node ./scripts/add-record-image.mjs /path/to/photo.png`.
3. Paste the printed `image_file` value into [data/records.csv](/Users/Birittany/Documents/SmithRobertson/data/records.csv) and update the row metadata.
4. Run `node ./scripts/validate-collection.mjs`.
5. Run `node ./scripts/generate-public-data.mjs`.
6. Commit and push to publish updates through GitHub Pages.

## Images

The image system is intentionally simple:

- every image lives under [public-images](/Users/Birittany/Documents/SmithRobertson/public-images)
- record-linked images now live under `public-images/records`
- the CSV uses the `image_file` column
- `image_file` should contain the path relative to `public-images`
- record-linked images use a simple sequential pattern such as `records/coll001.png`

Example:

- `image_file = records/coll001.png`
- the site loads `./public-images/records/coll001.png`

The public site only shows images for records that are both:

- marked `is_public = true`
- supplied with a valid `image_file`

## Build step

- The browser now prefers [data/public-records.json](/Users/Birittany/Documents/SmithRobertson/data/public-records.json) for faster loads.
- Regenerate that file and the public thumbnails any time [data/records.csv](/Users/Birittany/Documents/SmithRobertson/data/records.csv) changes by running `node ./scripts/generate-public-data.mjs`.
- If the JSON file is missing, the public site falls back to loading the CSV directly.

## Helper scripts

- `node ./scripts/add-record-image.mjs /path/to/photo.png`
  Copies a new image into `public-images/records` using the next available `coll###` filename and prints the exact `image_file` value for the CSV.
- `node ./scripts/validate-collection.mjs`
  Reports record counts, missing images, missing files, and unreferenced record images before you publish.

## Notes

- The old Supabase-based editor has been retired from the public site.
- The repository is being simplified toward a CollectionBuilder-style static architecture.
