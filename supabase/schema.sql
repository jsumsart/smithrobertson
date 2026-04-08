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

alter table public.museum_records add column if not exists is_public boolean not null default false;
alter table public.museum_records add column if not exists photo_path text;
alter table public.museum_records add column if not exists created_by uuid default auth.uid();

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

drop trigger if exists museum_records_set_updated_at on public.museum_records;
create trigger museum_records_set_updated_at
before update on public.museum_records
for each row
execute procedure public.set_updated_at();

alter table public.museum_records enable row level security;

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
create policy "museum staff can delete museum records"
on public.museum_records
for delete
to authenticated
using ((select public.is_museum_staff()));

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
