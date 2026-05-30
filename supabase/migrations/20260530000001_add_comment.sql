alter table public.checklist_entries
  add column if not exists comment text;
