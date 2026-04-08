# Smith Robertson Museum Collections Database

A GitHub Pages frontend for a shared Smith Robertson Museum collections database backed by Supabase.

## What changed

This app is now structured for a real web database:

- shared records instead of browser-only storage
- user login with Supabase Auth
- a museum records table in Supabase Postgres
- direct image uploads to Supabase Storage
- a first-class `Textile` record type
- a simpler cataloging workflow focused on collections work rather than student lesson-writing
- a separate public read-only catalog page for published records

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
- [supabase-client.js](/Users/Birittany/Documents/SmithRobertson/supabase-client.js): shared browser client helper
- [supabase-config.js](/Users/Birittany/Documents/SmithRobertson/supabase-config.js): your local project URL and anon key
- [supabase-config.example.js](/Users/Birittany/Documents/SmithRobertson/supabase-config.example.js): template for config
- [supabase/schema.sql](/Users/Birittany/Documents/SmithRobertson/supabase/schema.sql): SQL for the shared records table and policies

## Supabase setup

1. Create a Supabase project.
2. In Supabase SQL Editor, run [schema.sql](/Users/Birittany/Documents/SmithRobertson/supabase/schema.sql).
3. In Supabase Auth, enable email/password sign-in.
4. Copy your Supabase anon key from the project settings. The project URL is already prefilled for this connected project.
5. Put the anon key in [supabase-config.js](/Users/Birittany/Documents/SmithRobertson/supabase-config.js).
6. Push the updated site to GitHub Pages.

The SQL file also creates the public `museum-photos` storage bucket and the storage policies used by the upload flow.

## Important note about config

The Supabase anon key is safe to use in the frontend. It is meant for browser clients and is protected by your Row Level Security policies.

Do not put a `service_role` key in this repo or in frontend code.

## Current limitations

- all authenticated users currently share the same edit permissions
- there is not yet an admin approval workflow beyond the public visibility toggle
- bulk CSV import is not implemented yet

## Best next upgrades

- staff/admin roles and approval workflow
- bulk CSV import
- dedicated people, places, and exhibitions tables
