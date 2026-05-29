# Smith Robertson Collections

This project is now moving away from Supabase and toward a CSV-first workflow built around Google Sheets and Google Forms.

## Recommended operating model

- `Google Form` for student record entry
- `Google Sheet` as the source of truth
- `CSV import/export` in the dashboard for review and cleanup
- `Published CSV URL` for the public gallery and archive

That means records can live outside the website and do not disappear just because the site sits idle.

## Current architecture

### Public site

- [catalog.html](/Users/Birittany/Documents/SmithRobertson/catalog.html): digital gallery
- [archive.html](/Users/Birittany/Documents/SmithRobertson/archive.html): search-first archive
- [catalog.js](/Users/Birittany/Documents/SmithRobertson/catalog.js): loads either a published CSV source or Supabase if still configured

### Dashboard

- [index.html](/Users/Birittany/Documents/SmithRobertson/index.html): records workspace
- [app.js](/Users/Birittany/Documents/SmithRobertson/app.js): CSV import/export, local editing, and optional Supabase support
- [login.html](/Users/Birittany/Documents/SmithRobertson/login.html): access page that now points users into the CSV / Google workflow when Supabase is not active

### Configuration

- [data-source-config.js](/Users/Birittany/Documents/SmithRobertson/data-source-config.js): configure Google Sheet / Form URLs and the published CSV source
- [data-source-config.example.js](/Users/Birittany/Documents/SmithRobertson/data-source-config.example.js): example config
- [google-sheets-template.csv](/Users/Birittany/Documents/SmithRobertson/data/google-sheets-template.csv): starter CSV template
- [google-sheets-workflow.md](/Users/Birittany/Documents/SmithRobertson/docs/google-sheets-workflow.md): workflow notes

## How to use it now

1. Put your Google Sheet URL and Google Form URL into [data-source-config.js](/Users/Birittany/Documents/SmithRobertson/data-source-config.js).
2. If you want the public site to read directly from the Sheet, publish the Sheet as CSV and place that URL in `publishedCsvUrl`.
3. Students can use the Google Form for entry.
4. Staff can download CSV from the Sheet and import it into the dashboard for review.
5. Staff can export CSV back out after cleanup.

## Important image note

The CSV does not carry image binaries. Instead, it carries image links in `photo_url`.

The intended pattern is:

- students upload images through Google Forms
- Google Drive stores the files
- the linked Google Sheet captures the file links
- the app reads those links from the CSV

This keeps image storage outside Supabase and avoids the storage-egress problem that hit the earlier build.

## Supabase status

Supabase support still exists in the codebase as a fallback path, but it is no longer the recommended operating model for this museum workflow.

The project is now being optimized around:

- durable records in Google Sheets
- lightweight CSV handoff
- external image links instead of bucket-hosted media
