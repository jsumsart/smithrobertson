# Platform Migration Scaffold

This folder is the beginning of the next-generation museum platform.

## What it is

A `Next.js` scaffold that separates:

- public museum routes
- private dashboard routes
- server-side Supabase access
- future media and publishing modules

## Why it exists

The current static app proved the product direction, but it is not the right long-term shape for:

- protected private routes
- server-side pagination
- image derivative delivery
- exhibit publishing
- lower Supabase egress

## Current routes scaffolded

- `/`
- `/gallery`
- `/archive`
- `/login`
- `/dashboard`
- `/dashboard/records`
- `/dashboard/media`
- `/dashboard/taxonomies`
- `/dashboard/exhibits`
- `/dashboard/settings`

## What is real already

- Supabase server-client wiring
- dashboard auth gate pattern
- server-side record loading examples
- public and private layouts

## What still needs to happen

1. Install dependencies and run the app.
2. Add `.env.local` with Supabase URL and anon key.
3. Replace placeholder login behavior with live form actions.
4. Move existing public catalog logic into the new route structure.
5. Build server pagination, media derivatives, and true record detail routes.
