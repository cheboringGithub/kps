-- Живой лог подходов зала: строка на каждый подход, пишется сразу при вводе,
-- а не одним снимком при отправке чек-листа. Источник правды для истории
-- «прошлые заходы» в карточке упражнения.
create table if not exists public.gym_set_log (
  id uuid primary key default gen_random_uuid(),
  workout_number int not null,
  exercise_id text not null,
  set_index int not null,
  reps int,
  weight_kg numeric,
  performed_at date not null default (now() at time zone 'utc')::date,
  updated_at timestamptz not null default now(),
  unique (workout_number, exercise_id, set_index)
);

create index if not exists gym_set_log_exercise_idx
  on public.gym_set_log (exercise_id, workout_number desc);

alter table public.gym_set_log enable row level security;
create policy "anon read" on public.gym_set_log for select using (true);
create policy "anon insert" on public.gym_set_log for insert with check (true);
create policy "anon update" on public.gym_set_log for update using (true) with check (true);
create policy "anon delete" on public.gym_set_log for delete using (true);
