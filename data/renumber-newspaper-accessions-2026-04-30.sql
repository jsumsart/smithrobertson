begin;

do $$
begin
  if exists (
    select 1
    from public.museum_records
    where accession_number in (
      'SRM-2026-055', 'SRM-2026-056', 'SRM-2026-057', 'SRM-2026-058', 'SRM-2026-059',
      'SRM-2026-060', 'SRM-2026-061', 'SRM-2026-062', 'SRM-2026-063', 'SRM-2026-064',
      'SRM-2026-065', 'SRM-2026-066', 'SRM-2026-067', 'SRM-2026-068', 'SRM-2026-069',
      'SRM-2026-070', 'SRM-2026-071', 'SRM-2026-072', 'SRM-2026-073', 'SRM-2026-074'
    )
  ) then
    raise exception 'Renumber halted: one or more plain accession numbers SRM-2026-055 through SRM-2026-074 already exist.';
  end if;
end $$;

update public.museum_records
set accession_number = replace(accession_number, 'SRM-NP-2026-', 'SRM-2026-')
where accession_number in (
  'SRM-NP-2026-055', 'SRM-NP-2026-056', 'SRM-NP-2026-057', 'SRM-NP-2026-058', 'SRM-NP-2026-059',
  'SRM-NP-2026-060', 'SRM-NP-2026-061', 'SRM-NP-2026-062', 'SRM-NP-2026-063', 'SRM-NP-2026-064',
  'SRM-NP-2026-065', 'SRM-NP-2026-066', 'SRM-NP-2026-067', 'SRM-NP-2026-068', 'SRM-NP-2026-069',
  'SRM-NP-2026-070', 'SRM-NP-2026-071', 'SRM-NP-2026-072', 'SRM-NP-2026-073', 'SRM-NP-2026-074'
);

commit;
