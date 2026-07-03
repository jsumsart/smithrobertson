# Smith Robertson Collections

This repository now publishes a static public collections site from GitHub Pages.

## What is live

- [index.html](/Users/Birittany/Documents/SmithRobertson/index.html): the live digital gallery homepage
- [archive.html](/Users/Birittany/Documents/SmithRobertson/archive.html): the public archive view
- [catalog.js](/Users/Birittany/Documents/SmithRobertson/catalog.js): the single runtime for the public gallery and archive
- [styles.css](/Users/Birittany/Documents/SmithRobertson/styles.css): shared styling

## Source of truth

- [data/records.csv](/Users/Birittany/Documents/SmithRobertson/data/records.csv): the published collection data used by the site
- [data-source-config.js](/Users/Birittany/Documents/SmithRobertson/data-source-config.js): branding, curated accessions, and the CSV path
- [data/google-sheets-template.csv](/Users/Birittany/Documents/SmithRobertson/data/google-sheets-template.csv): starter sheet template

There is no active web login and no live backend editor right now.

## Current workflow

1. Edit collection data in the working spreadsheet.
2. Export a clean CSV.
3. Replace [data/records.csv](/Users/Birittany/Documents/SmithRobertson/data/records.csv).
4. Commit and push to publish updates through GitHub Pages.

## Images

Images are either:

- linked in the CSV through `photo_url`, or
- stored in this repository under [public-images](/Users/Birittany/Documents/SmithRobertson/public-images)

The public site only shows images for records that are both:

- marked `is_public = true`
- supplied with a valid image path or image URL

## Notes

- The old Supabase-based editor has been retired from the public site.
- The repository is being simplified toward a CollectionBuilder-style static architecture.
