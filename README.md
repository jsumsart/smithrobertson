# Smith Robertson Museum Collections Manager

A lightweight museum database app designed to run entirely as a static site on GitHub Pages.

## What it does

- Creates and edits museum records for artifacts, archives, collections, and exhibits
- Stores data locally in the browser with IndexedDB
- Filters records by keyword, type, and status
- Exports the full database as JSON for backups
- Imports JSON backups back into the app
- Works without a server or external database

## Why this works well on GitHub

GitHub Pages only hosts static files, so this project avoids any backend dependency. The app uses:

- `index.html` for structure
- `styles.css` for styling
- `app.js` for the database logic and UI
- Browser IndexedDB for local data storage

This means the museum can publish the app from a GitHub repository and use it in a browser without paying for a separate hosting stack.

## Important limitation

Because this app is GitHub-hosted only, each browser keeps its own local copy of the records. If staff use multiple computers, they should export and import backups to move data between devices.

If you later want shared multi-user data, we can evolve this into a version that uses Supabase, Firebase, or a small API while keeping the same interface.

## Local preview

Open `index.html` in a browser, or serve the folder with a static server.

Example:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy to GitHub Pages

1. Create a new GitHub repository.
2. Add these files to the repository root.
3. Push the repository to GitHub.
4. Make sure your default branch is named `main`, or update `.github/workflows/deploy-pages.yml` to match your branch name.
5. In GitHub, open `Settings` -> `Pages`.
6. Under `Build and deployment`, set the source to `GitHub Actions`.
7. Push to `main` and GitHub will publish the app automatically.

After GitHub Pages finishes publishing, the museum app will be available at the repository's Pages URL.

## Suggested next improvements

- Add image attachments with file compression
- Add a printable catalog detail view
- Separate staff-only archive notes from public-facing descriptions
- Add loan tracking and conservation history
- Add role-based editing if you move beyond GitHub-only hosting
