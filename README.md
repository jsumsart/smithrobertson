# Smith Robertson Collections

This project is now moving away from Supabase and toward a GitHub-published CSV workflow built around Google Sheets and Google Forms.

## Recommended operating model

- `Google Form` for student record entry
- `Google Sheet` as the editing source
- `CSV import/export` in the dashboard for review and cleanup
- `data/records.csv` in this repo as the published source

That means records do not depend on Supabase staying active, and the published collection now lives in GitHub with the site itself.

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

- [data-source-config.js](/Users/Birittany/Documents/SmithRobertson/data-source-config.js): configure Google Sheet / Form URLs and the repo CSV source
- [data-source-config.example.js](/Users/Birittany/Documents/SmithRobertson/data-source-config.example.js): example config
- [google-sheets-template.csv](/Users/Birittany/Documents/SmithRobertson/data/google-sheets-template.csv): starter CSV template
- [records.csv](/Users/Birittany/Documents/SmithRobertson/data/records.csv): rebuilt master collection CSV now served by the site
- [recovery-summary.md](/Users/Birittany/Documents/SmithRobertson/docs/recovery-summary.md): what was recovered into the repo
- [google-sheets-workflow.md](/Users/Birittany/Documents/SmithRobertson/docs/google-sheets-workflow.md): workflow notes

## How to use it now

1. Students use the Google Form and staff review the Google Sheet.
2. Export the Sheet as CSV.
3. Replace [records.csv](/Users/Birittany/Documents/SmithRobertson/data/records.csv) in the repo with the new export.
4. Commit and push the repo update so GitHub Pages publishes the new collection.
5. Use the dashboard when you want to review, clean up, or export the current repo copy.

## Important image note

The CSV does not carry image binaries. Instead, it carries image links in `photo_url`, or it can point at image files preserved in this repo.

The intended pattern is:

- students upload images through Google Forms, or staff preserve images directly in the repo
- Google Drive can store the files during intake
- the linked Google Sheet captures the file links
- the published repo CSV reads either those links or repo-hosted image paths

This avoids the Supabase storage-egress problem that hit the earlier build and makes the published collection self-contained in GitHub wherever possible.

## Supabase status

Supabase support still exists in the codebase as a fallback path, but it is no longer the recommended operating model for this museum workflow.

The project is now being optimized around:

- durable records in Google Sheets
- lightweight CSV handoff
- external image links instead of bucket-hosted media
