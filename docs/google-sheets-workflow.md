# Google Sheets Workflow

This site now uses a very simple collections workflow:

1. Keep the master data in a spreadsheet.
2. Add each new record image to [public-images/records](/Users/Birittany/Documents/SmithRobertson/public-images/records) using the next simple sequential filename, such as `coll109.png`.
3. Put that path in the CSV `image_file` column as `records/coll109.png`.
4. Replace [records.csv](/Users/Birittany/Documents/SmithRobertson/data/records.csv) if you exported from Google Sheets.
5. Run `node ./scripts/validate-collection.mjs`.
6. Run `node ./scripts/generate-public-data.mjs`.
7. Push to GitHub Pages.

If you want the repo to assign the next filename for you, run:

- `node ./scripts/add-record-image.mjs /path/to/photo.png`

## Required image rule

The CSV does not store image files. It only stores the image path in the `image_file` column.

Example:

- CSV value: `records/coll109.png`
- Actual file: [public-images](/Users/Birittany/Documents/SmithRobertson/public-images) + `records/coll109.png`
- Site path: `./public-images/records/coll109.png`

## Required columns

At minimum, each row should include:

- `accession_number`
- `title`

For images, use:

- `image_file`

The included template at [google-sheets-template.csv](/Users/Birittany/Documents/SmithRobertson/data/google-sheets-template.csv) shows the recommended column set.

## Publishing rule

The public site reads directly from [records.csv](/Users/Birittany/Documents/SmithRobertson/data/records.csv).

That means:

- if a row is in the CSV, it is part of the dataset
- if `is_public = true`, it can appear on the public site
- if `image_file` matches a file under `public-images`, the image can render

There is no live database dependency in this workflow.
