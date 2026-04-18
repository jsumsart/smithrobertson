# Smith Robertson Museum Collections Database

A GitHub Pages frontend for a shared Smith Robertson Museum collections database backed by Supabase.

## What changed

This app is now structured for a real web database:

- shared records instead of browser-only storage
- user login with Supabase Auth
- a museum records table in Supabase Postgres
- direct image uploads to Supabase Storage
- first-class `Textile` and `Newspaper / Periodical` record types
- a simpler cataloging workflow focused on collections work rather than student lesson-writing
- a separate public read-only catalog page for published records
- admin-managed site settings and configurable record types
- admin-managed taxonomies for statuses, themes, places, rights, condition, sensitivity, and suggested tags

## Hosting model

- `GitHub Pages` hosts the frontend
- `Supabase` provides the database, login, and future image storage

That means the site can still be deployed from GitHub, but the shared data is stored in Supabase rather than the browser.

## Files to know

- [index.html](/Users/Birittany/Documents/SmithRobertson/index.html): UI structure
- [styles.css](/Users/Birittany/Documents/SmithRobertson/styles.css): visual design
- [app.js](/Users/Birittany/Documents/SmithRobertson/app.js): Supabase auth + shared catalog logic
- [catalog.html](/Users/Birittany/Documents/SmithRobertson/catalog.html): public read-only catalog page
- [catalog.js](/Users/Birittany/Documents/SmithRobertson/catalog.js): public catalog loading and filtering
- [platform-config.js](/Users/Birittany/Documents/SmithRobertson/platform-config.js): shared defaults and theme helpers
- [supabase-client.js](/Users/Birittany/Documents/SmithRobertson/supabase-client.js): shared browser client helper
- [supabase-config.js](/Users/Birittany/Documents/SmithRobertson/supabase-config.js): your local project URL and anon key
- [supabase-config.example.js](/Users/Birittany/Documents/SmithRobertson/supabase-config.example.js): template for config
- [supabase/schema.sql](/Users/Birittany/Documents/SmithRobertson/supabase/schema.sql): SQL for records, site settings, record type definitions, taxonomies, and policies

## Supabase setup

1. Create a Supabase project.
2. In Supabase SQL Editor, run [schema.sql](/Users/Birittany/Documents/SmithRobertson/supabase/schema.sql).
3. In Supabase Auth, enable email/password sign-in.
4. Copy your Supabase anon key from the project settings. The project URL is already prefilled for this connected project.
5. Put the anon key in [supabase-config.js](/Users/Birittany/Documents/SmithRobertson/supabase-config.js).
6. Push the updated site to GitHub Pages.

The SQL file also creates the public `museum-photos` storage bucket and the storage policies used by the upload flow.
It now also creates `site_settings`, `record_type_definitions`, `taxonomy_groups`, and `taxonomy_terms`, which power the admin-controlled branding and metadata system.

## Admin access

- users can catalog records with a normal authenticated account
- while the platform is still being built, any authenticated user can access platform settings
- record-wide destructive tools can still be separated further with museum staff metadata

This is a temporary build-mode shortcut. Before broader rollout, restore a true admin role for platform settings and taxonomy management.

## Important note about config

The Supabase anon key is safe to use in the frontend. It is meant for browser clients and is protected by your Row Level Security policies.

Do not put a `service_role` key in this repo or in frontend code.

## Current limitations

- record editing is shared, but full workflow roles like `editor` and `reviewer` are not implemented yet
- the whitelabel model is still single-site rather than true multi-organization tenancy
- custom metadata groups are currently focused on the core catalog fields already in the app
- bulk CSV import is not implemented yet

## Best next upgrades

- editor/reviewer/admin workflow and approvals
- bulk CSV import
- dedicated people, places, and exhibitions tables
