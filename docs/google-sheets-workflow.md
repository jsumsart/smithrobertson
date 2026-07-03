# Google Sheets Workflow

This project now supports a CSV-first workflow so your records can live outside the website.

## Recommended setup

1. Create a Google Form for student entry.
2. Add a `File upload` question for the image.
3. Link the form responses to a Google Sheet.
4. Keep that Sheet as the source of truth for record metadata.
5. Download the Sheet as CSV when you want to import it into the dashboard.
6. Export the Sheet as CSV and replace [records.csv](/Users/Birittany/Documents/SmithRobertson/data/records.csv) in the repo when you are ready to publish changes.

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

If you keep [records.csv](/Users/Birittany/Documents/SmithRobertson/data/records.csv) updated in the repo:

- the public gallery and archive can load records without Supabase
- the published site reads from the repo copy of the CSV
- images come from local repo paths or external links in the `photo_url` column

## Dashboard mode

Without Supabase, the dashboard now works as a local CSV workspace:

- import CSV or JSON
- edit records in the browser
- export updated CSV or JSON

This is good for review and cleanup, but Google Sheets should be treated as the durable source of truth if you want records to survive browser resets.
