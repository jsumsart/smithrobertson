# Smith Robertson Collections

This repository now publishes a static public collections site from GitHub Pages.

## What is live

- [index.html](./index.html): the live digital gallery homepage
- [archive.html](./archive.html): the public archive view
- [catalog.js](./catalog.js): the single runtime for the public gallery and archive
- [styles.css](./styles.css): shared styling

## Source of truth

- [data/records.csv](./data/records.csv): the CSV you replace when you update records
- [data/public-records.json](./data/public-records.json): build-generated public data used for faster page loads
- [data-source-config.js](./data-source-config.js): branding, curated accessions, and the CSV path
- [data/google-sheets-template.csv](./data/google-sheets-template.csv): starter sheet template
- [public-images](./public-images): the record image folder
- [public-thumbs](./public-thumbs): build-generated thumbnails used by the public pages

There is no active web login and no live backend editor right now.

## Current workflow

1. Take or export a new object photo.
2. Copy it into the collection with `node ./scripts/add-record-image.mjs /path/to/photo.png`.
3. Paste the printed `image_file` value into [data/records.csv](./data/records.csv) and update the row metadata.
4. Run `node ./scripts/validate-collection.mjs`.
5. Run `node ./scripts/generate-public-data.mjs`.
6. Commit and push to publish updates through GitHub Pages.

## Images

The image system is intentionally simple:

- every record image lives directly under [public-images](./public-images)
- the CSV uses the `image_file` column
- `image_file` should contain the path relative to `public-images`
- every record-linked image uses a simple sequential pattern such as `coll001.png`
- the next new image should always continue that sequence: `coll160`, `coll161`, and so on

Example:

- `image_file = coll001.png`
- the site loads `./public-images/coll001.png`
- the thumbnail build writes `./public-thumbs/coll001.png`

The public site only shows images for records that are both:

- marked `is_public = true`
- supplied with a valid `image_file`

## Build step

- The browser now prefers [data/public-records.json](./data/public-records.json) for faster loads.
- Regenerate that file and the public thumbnails any time [data/records.csv](./data/records.csv) changes by running `node ./scripts/generate-public-data.mjs`.
- If the JSON file is missing, the public site falls back to loading the CSV directly.

## Helper scripts

- `node ./scripts/add-record-image.mjs /path/to/photo.png`
  Copies a new image into `public-images` using the next available `coll###` filename and prints the exact `image_file` value for the CSV.
- `node ./scripts/validate-collection.mjs`
  Reports record counts, missing images, missing files, and unreferenced record images before you publish.

## Quick answer

If you are updating the live site by hand in GitHub:

1. Upload the next image into `public-images` using the next filename in sequence, such as `coll160.png`.
2. Update `data/records.csv` so the row uses `coll160.png` in `image_file`.
3. Regenerate `data/public-records.json`.
4. Commit and push both files.

## Notes

- The old Supabase-based editor has been retired from the public site.
- The repository is being simplified toward a CollectionBuilder-style static architecture.
