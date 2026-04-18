create extension if not exists "pgcrypto";

create table if not exists public.museum_records (
  id uuid primary key default gen_random_uuid(),
  accession_number text not null unique,
  title text not null,
  record_type text not null,
  status text not null,
  collection_name text,
  location text,
  historical_theme text,
  neighborhood text,
  time_period text,
  people text,
  donor text,
  object_date text,
  format_material text,
  condition text,
  rights_status text,
  sensitivity text,
  is_public boolean not null default false,
  photo_url text,
  photo_path text,
  photo_credit text,
  description text,
  significance text,
  provenance text,
  notes text,
  tags text[] default '{}',
  created_by uuid default auth.uid(),
  updated_by text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_settings (
  id text primary key default 'default',
  brand_name text not null default 'Smith Robertson Collections',
  museum_name text not null default 'Smith Robertson Museum And Cultural Center',
  manager_headline text not null default 'A shared collections database for Jackson history.',
  manager_intro text not null default 'Built for a real museum workflow: staff and students can log in, catalog the same records, upload object photos, and manage collections tied to African American history, Jackson history, and Farish Street.',
  public_catalog_title text not null default 'Browse published Smith Robertson records.',
  public_catalog_intro text not null default 'This view is for visitors, partners, and researchers. Only records marked for public display are shown here.',
  primary_color text not null default '#9f4728',
  accent_deep_color text not null default '#71311b',
  forest_color text not null default '#546c47',
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.record_type_definitions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null unique,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.taxonomy_groups (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  description text,
  public_visible boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.taxonomy_terms (
  id uuid primary key default gen_random_uuid(),
  group_slug text not null references public.taxonomy_groups(slug) on delete cascade,
  slug text not null,
  label text not null,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (group_slug, slug),
  unique (group_slug, label)
);

alter table public.museum_records add column if not exists is_public boolean not null default false;
alter table public.museum_records add column if not exists photo_path text;
alter table public.museum_records add column if not exists created_by uuid default auth.uid();
alter table public.site_settings add column if not exists brand_name text not null default 'Smith Robertson Collections';
alter table public.site_settings add column if not exists museum_name text not null default 'Smith Robertson Museum And Cultural Center';
alter table public.site_settings add column if not exists manager_headline text not null default 'A shared collections database for Jackson history.';
alter table public.site_settings add column if not exists manager_intro text not null default 'Built for a real museum workflow: staff and students can log in, catalog the same records, upload object photos, and manage collections tied to African American history, Jackson history, and Farish Street.';
alter table public.site_settings add column if not exists public_catalog_title text not null default 'Browse published Smith Robertson records.';
alter table public.site_settings add column if not exists public_catalog_intro text not null default 'This view is for visitors, partners, and researchers. Only records marked for public display are shown here.';
alter table public.site_settings add column if not exists primary_color text not null default '#9f4728';
alter table public.site_settings add column if not exists accent_deep_color text not null default '#71311b';
alter table public.site_settings add column if not exists forest_color text not null default '#546c47';
alter table public.site_settings add column if not exists updated_at timestamptz not null default timezone('utc', now());
alter table public.record_type_definitions add column if not exists enabled boolean not null default true;
alter table public.record_type_definitions add column if not exists sort_order integer not null default 0;
alter table public.record_type_definitions add column if not exists updated_at timestamptz not null default timezone('utc', now());
alter table public.taxonomy_groups add column if not exists description text;
alter table public.taxonomy_groups add column if not exists public_visible boolean not null default false;
alter table public.taxonomy_groups add column if not exists sort_order integer not null default 0;
alter table public.taxonomy_groups add column if not exists updated_at timestamptz not null default timezone('utc', now());
alter table public.taxonomy_terms add column if not exists enabled boolean not null default true;
alter table public.taxonomy_terms add column if not exists sort_order integer not null default 0;
alter table public.taxonomy_terms add column if not exists updated_at timestamptz not null default timezone('utc', now());

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.is_museum_staff()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'museum_role') = 'staff', false);
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
as $$
  select auth.role() = 'authenticated';
$$;

drop trigger if exists museum_records_set_updated_at on public.museum_records;
create trigger museum_records_set_updated_at
before update on public.museum_records
for each row
execute procedure public.set_updated_at();

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row
execute procedure public.set_updated_at();

drop trigger if exists record_type_definitions_set_updated_at on public.record_type_definitions;
create trigger record_type_definitions_set_updated_at
before update on public.record_type_definitions
for each row
execute procedure public.set_updated_at();

drop trigger if exists taxonomy_groups_set_updated_at on public.taxonomy_groups;
create trigger taxonomy_groups_set_updated_at
before update on public.taxonomy_groups
for each row
execute procedure public.set_updated_at();

drop trigger if exists taxonomy_terms_set_updated_at on public.taxonomy_terms;
create trigger taxonomy_terms_set_updated_at
before update on public.taxonomy_terms
for each row
execute procedure public.set_updated_at();

alter table public.museum_records enable row level security;
alter table public.site_settings enable row level security;
alter table public.record_type_definitions enable row level security;
alter table public.taxonomy_groups enable row level security;
alter table public.taxonomy_terms enable row level security;

drop policy if exists "public can read published museum records" on public.museum_records;
create policy "public can read published museum records"
on public.museum_records
for select
to anon
using (is_public = true);

drop policy if exists "authenticated users can read museum records" on public.museum_records;
create policy "authenticated users can read museum records"
on public.museum_records
for select
to authenticated
using (true);

drop policy if exists "authenticated users can insert museum records" on public.museum_records;
create policy "authenticated users can insert museum records"
on public.museum_records
for insert
to authenticated
with check (true);

drop policy if exists "authenticated users can update museum records" on public.museum_records;
create policy "authenticated users can update museum records"
on public.museum_records
for update
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated users can delete museum records" on public.museum_records;
drop policy if exists "museum staff can delete museum records" on public.museum_records;
create policy "authenticated users can delete museum records"
on public.museum_records
for delete
to authenticated
using (true);

drop policy if exists "public can read site settings" on public.site_settings;
create policy "public can read site settings"
on public.site_settings
for select
to anon
using (true);

drop policy if exists "authenticated users can read site settings" on public.site_settings;
create policy "authenticated users can read site settings"
on public.site_settings
for select
to authenticated
using (true);

drop policy if exists "authenticated users can upsert site settings" on public.site_settings;
create policy "platform admins can manage site settings"
on public.site_settings
for all
to authenticated
using ((select public.is_platform_admin()))
with check ((select public.is_platform_admin()));

drop policy if exists "public can read record type definitions" on public.record_type_definitions;
create policy "public can read record type definitions"
on public.record_type_definitions
for select
to anon
using (enabled = true);

drop policy if exists "authenticated users can read record type definitions" on public.record_type_definitions;
create policy "authenticated users can read record type definitions"
on public.record_type_definitions
for select
to authenticated
using (true);

drop policy if exists "authenticated users can manage record type definitions" on public.record_type_definitions;
create policy "platform admins can manage record type definitions"
on public.record_type_definitions
for all
to authenticated
using ((select public.is_platform_admin()))
with check ((select public.is_platform_admin()));

drop policy if exists "public can read taxonomy groups" on public.taxonomy_groups;
create policy "public can read taxonomy groups"
on public.taxonomy_groups
for select
to anon
using (public_visible = true);

drop policy if exists "authenticated users can read taxonomy groups" on public.taxonomy_groups;
create policy "authenticated users can read taxonomy groups"
on public.taxonomy_groups
for select
to authenticated
using (true);

drop policy if exists "platform admins can manage taxonomy groups" on public.taxonomy_groups;
create policy "platform admins can manage taxonomy groups"
on public.taxonomy_groups
for all
to authenticated
using ((select public.is_platform_admin()))
with check ((select public.is_platform_admin()));

drop policy if exists "public can read taxonomy terms" on public.taxonomy_terms;
create policy "public can read taxonomy terms"
on public.taxonomy_terms
for select
to anon
using (
  enabled = true
  and exists (
    select 1
    from public.taxonomy_groups
    where slug = taxonomy_terms.group_slug
      and public_visible = true
  )
);

drop policy if exists "authenticated users can read taxonomy terms" on public.taxonomy_terms;
create policy "authenticated users can read taxonomy terms"
on public.taxonomy_terms
for select
to authenticated
using (true);

drop policy if exists "platform admins can manage taxonomy terms" on public.taxonomy_terms;
create policy "platform admins can manage taxonomy terms"
on public.taxonomy_terms
for all
to authenticated
using ((select public.is_platform_admin()))
with check ((select public.is_platform_admin()));

insert into public.site_settings (id)
values ('default')
on conflict (id) do nothing;

insert into public.record_type_definitions (slug, label, enabled, sort_order)
values
  ('artifact', 'Artifact', true, 10),
  ('archive', 'Archive', true, 20),
  ('photograph', 'Photograph', true, 30),
  ('oral-history', 'Oral History', true, 40),
  ('newspaper-periodical', 'Newspaper / Periodical', true, 50),
  ('textile', 'Textile', true, 60),
  ('exhibit', 'Exhibit', true, 70)
on conflict (slug) do update
set label = excluded.label,
    enabled = excluded.enabled,
    sort_order = excluded.sort_order;

insert into public.taxonomy_groups (slug, label, description, public_visible, sort_order)
values
  ('status', 'Statuses', 'Workflow and storage status options for records.', false, 10),
  ('historical-theme', 'Themes', 'Themes used for filtering and interpretation.', true, 20),
  ('neighborhood', 'Places', 'Neighborhoods, campuses, or geographic contexts.', true, 30),
  ('rights-status', 'Rights', 'Usage and rights statements.', false, 40),
  ('condition', 'Condition', 'Condition and conservation states for records.', false, 45),
  ('sensitivity', 'Sensitivity', 'Internal/public sensitivity levels.', false, 50),
  ('suggested-tag', 'Suggested Tags', 'Reusable tags surfaced in the catalog UI.', false, 60)
on conflict (slug) do update
set label = excluded.label,
    description = excluded.description,
    public_visible = excluded.public_visible,
    sort_order = excluded.sort_order;

insert into public.taxonomy_terms (group_slug, slug, label, enabled, sort_order)
values
  ('status', 'in-storage', 'In Storage', true, 10),
  ('status', 'on-display', 'On Display', true, 20),
  ('status', 'digitized', 'Digitized', true, 30),
  ('status', 'needs-review', 'Needs Review', true, 40),
  ('status', 'in-research', 'In Research', true, 50),
  ('historical-theme', 'african-american-education', 'African American Education', true, 10),
  ('historical-theme', 'civil-rights', 'Civil Rights', true, 20),
  ('historical-theme', 'farish-street-business-district', 'Farish Street Business District', true, 30),
  ('historical-theme', 'faith-and-community-life', 'Faith And Community Life', true, 40),
  ('historical-theme', 'arts-and-culture', 'Arts And Culture', true, 50),
  ('historical-theme', 'civic-leadership', 'Civic Leadership', true, 60),
  ('historical-theme', 'family-and-neighborhood-life', 'Family And Neighborhood Life', true, 70),
  ('neighborhood', 'farish-street', 'Farish Street', true, 10),
  ('neighborhood', 'downtown-jackson', 'Downtown Jackson', true, 20),
  ('neighborhood', 'smith-robertson-campus', 'Smith Robertson Campus', true, 30),
  ('neighborhood', 'west-jackson', 'West Jackson', true, 40),
  ('neighborhood', 'belhaven', 'Belhaven', true, 50),
  ('neighborhood', 'statewide-mississippi', 'Statewide Mississippi', true, 60),
  ('rights-status', 'museum-use-only', 'Museum Use Only', true, 10),
  ('rights-status', 'educational-use-approved', 'Educational Use Approved', true, 20),
  ('rights-status', 'public-domain', 'Public Domain', true, 30),
  ('rights-status', 'rights-unknown', 'Rights Unknown', true, 40),
  ('condition', 'excellent', 'Excellent', true, 10),
  ('condition', 'stable', 'Stable', true, 20),
  ('condition', 'fragile', 'Fragile', true, 30),
  ('condition', 'needs-conservation', 'Needs Conservation', true, 40),
  ('sensitivity', 'open-access', 'Open Access', true, 10),
  ('sensitivity', 'review-before-public-display', 'Review Before Public Display', true, 20),
  ('sensitivity', 'restricted', 'Restricted', true, 30),
  ('suggested-tag', 'farish-street', 'Farish Street', true, 10),
  ('suggested-tag', 'jackson-history', 'Jackson history', true, 20),
  ('suggested-tag', 'african-american-education', 'African American education', true, 30),
  ('suggested-tag', 'civil-rights', 'civil rights', true, 40),
  ('suggested-tag', 'church-life', 'church life', true, 50),
  ('suggested-tag', 'business-history', 'business history', true, 60),
  ('suggested-tag', 'oral-history', 'oral history', true, 70),
  ('suggested-tag', 'textiles', 'textiles', true, 80)
on conflict (group_slug, slug) do update
set label = excluded.label,
    enabled = excluded.enabled,
    sort_order = excluded.sort_order;

insert into storage.buckets (id, name, public)
values ('museum-photos', 'museum-photos', false)
on conflict (id) do nothing;

update storage.buckets
set public = false
where id = 'museum-photos';

drop policy if exists "public can view museum photos" on storage.objects;
create policy "public can view museum photos"
on storage.objects
for select
to anon
using (bucket_id = 'museum-photos' and (storage.foldername(name))[1] = 'public');

drop policy if exists "authenticated users can view museum photos" on storage.objects;
create policy "authenticated users can view museum photos"
on storage.objects
for select
to authenticated
using (bucket_id = 'museum-photos');

drop policy if exists "authenticated users can upload museum photos" on storage.objects;
create policy "authenticated users can upload museum photos"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'museum-photos');

drop policy if exists "authenticated users can update museum photos" on storage.objects;
create policy "authenticated users can update museum photos"
on storage.objects
for update
to authenticated
using (bucket_id = 'museum-photos')
with check (bucket_id = 'museum-photos');

drop policy if exists "authenticated users can delete museum photos" on storage.objects;
create policy "authenticated users can delete museum photos"
on storage.objects
for delete
to authenticated
using (bucket_id = 'museum-photos');
