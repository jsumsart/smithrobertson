# Google Sheets Workflow

This site now uses a very simple collections workflow:

1. Keep the master data in a spreadsheet.
2. Export it as CSV.
3. Replace [records.csv](/Users/Birittany/Documents/SmithRobertson/data/records.csv).
4. Keep the matching image files in [public-images](/Users/Birittany/Documents/SmithRobertson/public-images).
5. Push to GitHub Pages.

## Required image rule

The CSV does not store image files. It only stores the image path in the `image_file` column.

Example:

- CSV value: `untitled-37/20.png`
- Actual file: [public-images](/Users/Birittany/Documents/SmithRobertson/public-images) + `untitled-37/20.png`
- Site path: `./public-images/untitled-37/20.png`

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
