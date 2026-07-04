# Google Sheets Workflow

This site now uses a very simple collections workflow:

1. Keep the master data in a spreadsheet.
2. Add each new record image to [public-images](../public-images) using the next simple sequential filename, such as `coll160.png`.
3. Put that path in the CSV `image_file` column as `coll160.png`.
4. Replace [data/records.csv](../data/records.csv) if you exported from Google Sheets.
5. Run `node ./scripts/validate-collection.mjs`.
6. Run `node ./scripts/generate-public-data.mjs`.
7. Push to GitHub Pages.

If you want the repo to assign the next filename for you, run:

- `node ./scripts/add-record-image.mjs /path/to/photo.png`

## Required image rule

The CSV does not store image files. It only stores the image path in the `image_file` column.

Example:

- CSV value: `coll109.png`
- Actual file: [public-images](../public-images) + `coll109.png`
- Site path: `./public-images/coll109.png`
- Generated thumbnail path: `./public-thumbs/coll109.png`

## Required columns

At minimum, each row should include:

- `accession_number`
- `title`

For images, use:

- `image_file`

The included template at [data/google-sheets-template.csv](../data/google-sheets-template.csv) shows the recommended column set.

## Publishing rule

The public site uses [data/records.csv](../data/records.csv) as the source CSV and [data/public-records.json](../data/public-records.json) as the fast-loading published file.

That means:

- if a row is in the CSV, it is part of the dataset
- if `is_public = true`, it can appear on the public site
- if `image_file` matches a file under `public-images`, the image can render
- all record images should stay in the same single numbered run: `coll001`, `coll002`, `coll003`, and onward

There is no live database dependency in this workflow.
