# Google Sheets Workflow

This project now supports a CSV-first workflow so your records can live outside the website.

## Recommended setup

1. Create a Google Form for student entry.
2. Add a `File upload` question for the image.
3. Link the form responses to a Google Sheet.
4. Keep that Sheet as the source of truth for record metadata.
5. Download the Sheet as CSV when you want to import it into the dashboard.
6. Optionally publish the Sheet as CSV and place that URL in [data-source-config.js](/Users/Birittany/Documents/SmithRobertson/data-source-config.js) so the public archive/gallery can read directly from it.

## Important image note

CSV files do not contain binary image files. Instead, the CSV should include a `photo_url` column.

For the Google workflow, that means:

- students upload the image through the Google Form
- Google Drive stores the file
- the Sheet row contains the file link
- the website imports that link as `photo_url`

The app can normalize many Google Drive file URLs automatically, but the files still need to be shared in a way the public site can read if you want them visible on the public gallery/archive.

## Required columns

At minimum, the CSV should include:

- `accession_number`
- `title`

The included template at [google-sheets-template.csv](/Users/Birittany/Documents/SmithRobertson/data/google-sheets-template.csv) has the full recommended column set.

## Public site mode

If you place a published Sheet CSV URL in [data-source-config.js](/Users/Birittany/Documents/SmithRobertson/data-source-config.js):

- the public gallery and archive can load records without Supabase
- records persist in Google Sheets instead of the website
- images come from the `photo_url` column

## Dashboard mode

Without Supabase, the dashboard now works as a local CSV workspace:

- import CSV or JSON
- edit records in the browser
- export updated CSV or JSON

This is good for review and cleanup, but Google Sheets should be treated as the durable source of truth if you want records to survive browser resets.
