# Smith Robertson Museum Collections Manager

A static GitHub Pages app for the Smith Robertson Museum and Cultural Center in downtown Jackson, Mississippi.

## Purpose

This version is designed for:

- museum staff
- student interns
- class visits
- community history projects

The workflow is intentionally simple while still supporting richer metadata for:

- African American history
- Jackson history
- Farish Street history
- school and neighborhood history
- oral histories and teaching collections

## What the app now includes

- A guided four-part cataloging workflow
- Smith Robertson-specific sample records
- Filters for type, status, historical theme, and neighborhood
- Metadata for historical significance, provenance, rights, sensitivity, and classroom use
- Student-friendly summaries for tours and lessons
- Suggested tags for common local history topics
- Local browser storage with JSON import and export

## GitHub-only design

This app is built to run entirely on GitHub Pages, so there is no server and no hosted database. It uses:

- `index.html` for structure
- `styles.css` for layout and visual design
- `app.js` for the catalog workflow and IndexedDB storage
- browser IndexedDB for local records

## Important limitation

Because the app is static and GitHub-hosted only, records are saved in the browser on the current computer. If multiple students or staff members use different devices, export and import backups to move the data.

## Local preview

Open [index.html](/Users/Birittany/Documents/SmithRobertson/index.html) in a browser, or run a simple local server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy to GitHub Pages

1. Push the repository to GitHub.
2. Open repository `Settings` -> `Pages`.
3. Set `Source` to `GitHub Actions`.
4. Keep the default branch on `main`.
5. Push a commit or use `Run workflow` in Actions if you need to redeploy.

The site will publish from the GitHub Actions workflow in `.github/workflows/deploy-pages.yml`.

## Good next upgrades

- Add image upload with client-side compression
- Add a printable object label and gallery card view
- Add separate public description and internal staff notes
- Add fields for exhibitions, loans, and conservation events
- Add CSV import/export for larger student projects
