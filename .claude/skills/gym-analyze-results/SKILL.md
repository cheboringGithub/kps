---
name: gym-analyze-results
description: Анализ прогресса силовой программы в зале. Использовать когда пользователь пишет /gym-analyze-results или просит проанализировать результаты тренировок в зале, посмотреть силовой прогресс.
compatibility: Запускается в репозитории kps-pwa. Чтение и запись отчёта — через MCP-сервер supabase (mcp__supabase__execute_sql, apply_migration для DDL); фолбэк без MCP — curl + scripts/supabase-get.sh и scripts/supabase-insert.sh.
allowed-tools: mcp__supabase__execute_sql mcp__supabase__apply_migration Bash(scripts/supabase-get.sh:*) Bash(scripts/supabase-insert.sh:*) Read Write Agent
---

# Анализ результатов тренировок в зале

## 1. Получить данные из Supabase

Читай через **MCP-сервер supabase** — `mcp__supabase__execute_sql`:

```sql
select * from gym_entries order by created_at asc limit 100;
```

Если инструменты `mcp__supabase__*` недоступны (сервер не подключён в этой сессии) — то же через REST, ключ и URL внутри скрипта (`scripts/supabase-env.sh`):

```bash
scripts/supabase-get.sh gym_entries 'order=created_at.asc&limit=100'
```

Если записей нет — сообщи пользователю что данных ещё нет и предложи заполнить анкету в PWA (программа «Зал» → вкладка «Дневник»).

Прочитай `src/data/gym/exercises.ts` (каталог `GYM_EX`, для расшифровки `exercise_id` → название) и `src/data/gym/workouts.ts` (плановые вес/повторы по тренировкам, для сравнения с фактом).

## 2. Что анализировать

Каждая запись `gym_entries` содержит: `workout_number`, `rpe` (Легко/Норм/Тяжело/Предел), `knee_pain` (0–2), `sets` (jsonb-массив `{exercise_id, set_index, reps, weight_kg}`), `comment`.

### Колено — приоритет №1
- `knee_pain >= 2` в любой записи → это перевешивает всё остальное, сразу `critical`
- `knee_pain == 1` несколько записей подряд → `warning`, отметь это отдельно, даже если силовые показатели растут

### Прогрессия по каждому упражнению (`exercise_id`)
Сгруппируй подходы по `exercise_id` через записи в хронологическом порядке. Для каждого упражнения смотри тренд **веса** и **повторов** (не отдельные числа):
- Норма: вес и/или верхняя граница повторов растут от тренировки к тренировке (или хотя бы не падают) — соответствует double progression из `workouts.ts`
- Если один и тот же вес/повторы держится 3+ тренировки подряд **и** RPE в эти разы ≤ «Норм» → стагнация, нужна коррекция (недогруз)
- Если вес растёт, а RPE = «Предел» 2+ раза подряд → возможен перегруз, нужна коррекция (передозировка)
- Сравни факт с планом из `workouts.ts` — если пользователь стабильно не дотягивает до плановых цифр, это тоже сигнал для коррекции плана, а не факта

### RPE — тренд по тренировкам
- Норма: колеблется между «Норм» и «Тяжело»
- Если «Предел» 2+ тренировки подряд → перегруз, нужна разгрузка
- Если «Легко» несколько тренировок подряд по всем упражнениям → недогруз, есть запас для прогрессии

### Сверка программы с ограничениями — по решению

Сам анализ ничего не меняет, поэтому аудит здесь не обязателен. Вызывай `program-audit` перед формированием отчёта, если есть повод:

- в записях `knee_pain >= 1` — рост веса при этом выглядит как нормальный прогресс, поэтому смотри не только цифры, но и состав будущих тренировок
- блок менялся со времени последнего анализа (сверь дату последнего отчёта в `gym_analysis_reports` с коммитами в `workouts.ts`/`gym/exercises.ts`)
- пользователь просит проверить саму программу, а не только силовую динамику

Если запускал: 🔴 → `recommendation` не может быть `ok` (минимум `warning`; `critical`, если противопоказание в ближайшей незавершённой тренировке), находки идут в отчёт отдельным блоком с номерами тренировок. Исправление — работа `gym-adjust-program`/`gym-exercise-review`, не этого скилла. Если не запускал — так и напиши в блоке отчёта.

## 3. Сформировать текст анализа

Подготовь строку `content` в формате markdown:

```
# Анализ силовой программы · [дата]

**Записей:** N
**Период:** [первая дата] — [последняя дата]
**Тренировки:** [min workout_number] — [max workout_number]

---

## Колено
[тренд knee_pain по записям, конкретные цифры]

## Прогрессия по упражнениям
[для каждого упражнения с историей 2+ записей: тренд вес/повторы, факт vs план]

## RPE
[тренд + конкретные значения]

---

## Расхождения программы с ограничениями
[находки program-audit с номерами тренировок; «аудит чист»; или «аудит не запускался — нет повода»]

## Общая картина
[2–3 предложения: что растёт, что стагнирует, есть ли риск по колену]

## Рекомендация
[ОДНО из четырёх:]
- ✅ Программа работает по плану. Продолжай.
- ⚠️ Есть стагнация/перегруз в [упражнении/показателе]. Рекомендую запустить /gym-adjust-program.
- 🔴 Колено реагирует / выраженный перегруз. Необходима коррекция — запусти /gym-adjust-program.
- 🏁 Блок пройден полностью (все тренировки последней недели блока в `workouts.ts`). Рекомендую запустить /gym-plan-next-phase.
```

Определи значение `recommendation`:
- `"ok"` — если рекомендация ✅
- `"warning"` — если ⚠️
- `"critical"` — если 🔴 (в том числе всегда при `knee_pain >= 2` в последних записях)
- `"done"` — если 🏁 (последняя пройденная тренировка — последняя в блоке из `src/data/gym/workouts.ts`); проверяй это **до** остальных веток — если блок пройден, `gym-adjust-program` уже не подходящий следующий шаг

## 4. Сохранить анализ в Supabase

Через `mcp__supabase__execute_sql`. Markdown из раздела 3 оборачивай в dollar-quoting `$md$ … $md$` — тогда кавычки и переносы строк внутри отчёта не нужно экранировать:

```sql
insert into gym_analysis_reports
  (report_date, entries_count, period_start, period_end, content, recommendation)
values
  ('[YYYY-MM-DD]', N, '[YYYY-MM-DD]', '[YYYY-MM-DD]', $md$[markdown из раздела 3]$md$, '[ok|warning|critical|done]')
returning id, report_date;
```

Если MCP недоступен — напиши тело в JSON-файл через `Write` (те же поля) и вставь через REST:

```bash
scripts/supabase-insert.sh gym_analysis_reports /путь/к/report.json
```

Если insert падает с ошибкой check constraint на `recommendation` (таблица создана до появления значения `done`) — выполни `alter table public.gym_analysis_reports drop constraint gym_analysis_reports_recommendation_check, add constraint gym_analysis_reports_recommendation_check check (recommendation in ('ok','warning','critical','done'));` через `mcp__supabase__apply_migration` (это DDL — не через `execute_sql`), затем повтори insert.

Если таблица не найдена (ошибка PGRST205) — сообщи пользователю что нужно создать таблицу, и предложи выполнить это через Supabase MCP (`apply_migration`) или вручную в Supabase Dashboard с этим SQL:

```sql
create table public.gym_analysis_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  report_date date not null,
  entries_count int not null,
  period_start date not null,
  period_end date not null,
  content text not null,
  recommendation text not null check (recommendation in ('ok', 'warning', 'critical', 'done'))
);
alter table public.gym_analysis_reports enable row level security;
create policy "anon read" on public.gym_analysis_reports for select using (true);
create policy "anon insert" on public.gym_analysis_reports for insert with check (true);
```

## 5. После сохранения

- Выведи в чат краткое резюме (3–5 предложений): главные находки и вывод
- Если рекомендация ⚠️ или 🔴 — явно скажи: **"Советую запустить /gym-adjust-program"** и объясни почему именно
- Если 🏁 — явно скажи: **"Блок пройден, советую запустить /gym-plan-next-phase"** — этот скилл смотрит на весь пройденный блок целиком (весовую прогрессию по каждому упражнению) и проектирует следующий мезоцикл, а не точечно правит тренировки
- Если ✅ — скажи что делать дальше (продолжать текущую тренировку, когда следующий анализ)
