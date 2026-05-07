create extension if not exists "pgcrypto";

alter table public.museum_records
  add column if not exists organization_id uuid,
  add column if not exists primary_media_asset_id uuid,
  add column if not exists slug text,
  add column if not exists published_at timestamptz,
  add column if not exists archived_at timestamptz;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  record_id uuid references public.museum_records(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  label text,
  asset_kind text not null default 'image',
  original_path text,
  web_path text,
  thumbnail_path text,
  alt_text text,
  caption text,
  credit text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.public_pages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  slug text not null unique,
  title text not null,
  page_kind text not null default 'page',
  summary text,
  body jsonb not null default '[]'::jsonb,
  published boolean not null default false,
  published_at timestamptz,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.exhibits (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  slug text not null unique,
  title text not null,
  subtitle text,
  summary text,
  hero_media_asset_id uuid references public.media_assets(id) on delete set null,
  published boolean not null default false,
  starts_on date,
  ends_on date,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.exhibit_items (
  id uuid primary key default gen_random_uuid(),
  exhibit_id uuid not null references public.exhibits(id) on delete cascade,
  record_id uuid references public.museum_records(id) on delete cascade,
  media_asset_id uuid references public.media_assets(id) on delete set null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  actor_id uuid default auth.uid(),
  entity_table text not null,
  entity_id uuid,
  action text not null,
  summary text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists organizations_set_updated_at on public.organizations;
create trigger organizations_set_updated_at
before update on public.organizations
for each row
execute procedure public.set_updated_at();

drop trigger if exists media_assets_set_updated_at on public.media_assets;
create trigger media_assets_set_updated_at
before update on public.media_assets
for each row
execute procedure public.set_updated_at();

drop trigger if exists public_pages_set_updated_at on public.public_pages;
create trigger public_pages_set_updated_at
before update on public.public_pages
for each row
execute procedure public.set_updated_at();

drop trigger if exists exhibits_set_updated_at on public.exhibits;
create trigger exhibits_set_updated_at
before update on public.exhibits
for each row
execute procedure public.set_updated_at();

alter table public.organizations enable row level security;
alter table public.media_assets enable row level security;
alter table public.public_pages enable row level security;
alter table public.exhibits enable row level security;
alter table public.exhibit_items enable row level security;
alter table public.audit_log enable row level security;

drop policy if exists "authenticated users can read organizations" on public.organizations;
create policy "authenticated users can read organizations"
on public.organizations
for select
to authenticated
using (true);

drop policy if exists "authenticated users can manage organizations" on public.organizations;
create policy "authenticated users can manage organizations"
on public.organizations
for all
to authenticated
using ((select public.is_platform_admin()))
with check ((select public.is_platform_admin()));

drop policy if exists "authenticated users can read media assets" on public.media_assets;
create policy "authenticated users can read media assets"
on public.media_assets
for select
to authenticated
using (true);

drop policy if exists "authenticated users can manage media assets" on public.media_assets;
create policy "authenticated users can manage media assets"
on public.media_assets
for all
to authenticated
using (true)
with check (true);

drop policy if exists "public can read published pages" on public.public_pages;
create policy "public can read published pages"
on public.public_pages
for select
to anon
using (published = true);

drop policy if exists "authenticated users can read public pages" on public.public_pages;
create policy "authenticated users can read public pages"
on public.public_pages
for select
to authenticated
using (true);

drop policy if exists "authenticated users can manage public pages" on public.public_pages;
create policy "authenticated users can manage public pages"
on public.public_pages
for all
to authenticated
using ((select public.is_platform_admin()))
with check ((select public.is_platform_admin()));

drop policy if exists "public can read published exhibits" on public.exhibits;
create policy "public can read published exhibits"
on public.exhibits
for select
to anon
using (published = true);

drop policy if exists "authenticated users can read exhibits" on public.exhibits;
create policy "authenticated users can read exhibits"
on public.exhibits
for select
to authenticated
using (true);

drop policy if exists "authenticated users can manage exhibits" on public.exhibits;
create policy "authenticated users can manage exhibits"
on public.exhibits
for all
to authenticated
using ((select public.is_platform_admin()))
with check ((select public.is_platform_admin()));

drop policy if exists "public can read exhibit items for published exhibits" on public.exhibit_items;
create policy "public can read exhibit items for published exhibits"
on public.exhibit_items
for select
to anon
using (
  exists (
    select 1 from public.exhibits
    where exhibits.id = exhibit_items.exhibit_id
      and exhibits.published = true
  )
);

drop policy if exists "authenticated users can read exhibit items" on public.exhibit_items;
create policy "authenticated users can read exhibit items"
on public.exhibit_items
for select
to authenticated
using (true);

drop policy if exists "authenticated users can manage exhibit items" on public.exhibit_items;
create policy "authenticated users can manage exhibit items"
on public.exhibit_items
for all
to authenticated
using ((select public.is_platform_admin()))
with check ((select public.is_platform_admin()));

drop policy if exists "authenticated users can read audit log" on public.audit_log;
create policy "authenticated users can read audit log"
on public.audit_log
for select
to authenticated
using ((select public.is_platform_admin()));

drop policy if exists "authenticated users can insert audit log" on public.audit_log;
create policy "authenticated users can insert audit log"
on public.audit_log
for insert
to authenticated
with check (true);

insert into public.organizations (slug, name)
values ('smith-robertson', 'Smith Robertson Collections')
on conflict (slug) do nothing;
