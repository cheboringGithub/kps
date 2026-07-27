---
name: analyze-results
description: Анализ прогресса реабилитации КПС. Использовать когда пользователь пишет /analyze-results или просит проанализировать результаты тренировок, посмотреть прогресс, оценить динамику.
compatibility: Запускается в репозитории kps-pwa. Чтение и запись отчёта — через MCP-сервер supabase (mcp__supabase__execute_sql, apply_migration для DDL); фолбэк без MCP — curl + scripts/supabase-get.sh и scripts/supabase-insert.sh.
allowed-tools: mcp__supabase__execute_sql mcp__supabase__apply_migration Bash(scripts/supabase-get.sh:*) Bash(scripts/supabase-insert.sh:*) Read Write Agent
---

# Анализ результатов тренировок

## 1. Получить данные из Supabase

Читай через **MCP-сервер supabase** — `mcp__supabase__execute_sql`:

```sql
select * from checklist_entries order by created_at asc limit 100;
```

Если инструменты `mcp__supabase__*` недоступны (сервер не подключён в этой сессии) — то же через REST, ключ и URL внутри скрипта (`scripts/supabase-env.sh`):

```bash
scripts/supabase-get.sh checklist_entries 'order=created_at.asc&limit=100'
```

Если записей нет — сообщи пользователю что данных ещё нет и предложи заполнить анкету в PWA (вкладка «Дневник»).

Прочитай `src/data/days.ts`, чтобы знать последний день последней фазы — понадобится в разделе 3 для проверки завершения курса.

## 2. Что анализировать

Для каждого показателя смотри **тренд** (улучшение / стагнация / ухудшение), а не отдельные значения.

### Поясница утром (`back_pain`, 0–3)
- Норма прогресса: снижение на 1 балл за 1–2 недели
- Если 2–3 держится >5 записей подряд → программа слишком нагружает КПС, нужна коррекция
- Если 0–1 стабильно → КПС адаптируется хорошо

### Левый КПС в тракции (`kps_feeling`, 1–3)
- Норма: рост с 1 до 2–3 за 2 недели
- Если застрял на 1 >7 записей → тракция не доходит, нужно больше декомпрессии или смена угла (90/90, голубь)
- Если 3 стабильно → можно прогрессировать на ПНФ-технику

### Левое колено (`left_knee`, 0–2)
- Норма: 0–1, снижение к концу фазы 2
- Если 2 держится → ИТ-тяж не разгружается, нужна коррекция боковой цепи
- Если 0 стабильно → компенсация уходит

### Симметрия при сидении (`sitting_symmetry`)
- Значения: 'да' / 'чуть меньше' / 'примерно ровно'
- Норма: переход 'да' → 'чуть меньше' за 2 недели, 'примерно ровно' к концу фазы 2–3
- Если 'да' держится >10 записей → перекос не уходит, нужна коррекция асимметричной нагрузки

### Сверка программы с ограничениями — по решению

Сам анализ ничего не меняет, поэтому аудит здесь не обязателен. Вызывай `program-audit` перед формированием отчёта, если есть повод:

- в записях `left_knee >= 1` или растёт `back_pain` — данные намекают, что программа грузит то, что грузить нельзя, и стоит посмотреть состав будущих дней, а не только тренд
- программа менялась со времени последнего анализа (сверь дату последнего отчёта в `analysis_reports` с последними коммитами в `days.ts`/`exercises.ts`)
- пользователь просит проверить саму программу, а не только динамику

Если запускал: 🔴 → `recommendation` не может быть `ok` (минимум `warning`; `critical`, если противопоказание попадает в ближайшие 7 дней), находки идут в отчёт отдельным блоком с номерами дней. Исправление — работа `adjust-program`/`exercise-review`, не этого скилла. Если не запускал — так и напиши в блоке отчёта.

## 3. Сформировать текст анализа

Подготовь строку `content` в формате markdown:

```
# Анализ прогресса · [дата]

**Записей:** N  
**Период:** [первая дата] — [последняя дата]  
**Пройдено дней программы:** [min day] — [max day]

---

## Поясница утром
[тренд + конкретные цифры]

## Левый КПС
[тренд + конкретные цифры]

## Левое колено
[тренд + конкретные цифры]

## Симметрия таза
[тренд + переходы между значениями]

---

## Расхождения программы с ограничениями
[находки program-audit с номерами дней; «аудит чист»; или «аудит не запускался — нет повода»]

## Общая картина
[2–3 предложения: что работает, что застряло, какой паттерн виден]

## Рекомендация
[ОДНО из четырёх:]
- ✅ Программа работает по плану. Продолжай.
- ⚠️ Есть стагнация в [показателе]. Рекомендую запустить /adjust-program.
- 🔴 Ухудшение в [показателе]. Необходима коррекция — запусти /adjust-program.
- 🏁 Курс пройден полностью (max day программы). Рекомендую запустить /plan-next-phase.
```

Определи значение `recommendation`:
- `"ok"` — если рекомендация ✅
- `"warning"` — если ⚠️
- `"critical"` — если 🔴
- `"done"` — если 🏁 (max day в записях достиг последнего дня последней фазы в `days.ts`); это проверяй **до** остальных веток — если курс пройден, `adjust-program` уже не подходящий следующий шаг, даже если по пути были стагнации

## 4. Сохранить анализ в Supabase

Через `mcp__supabase__execute_sql`. Markdown из раздела 3 оборачивай в dollar-quoting `$md$ … $md$` — тогда кавычки и переносы строк внутри отчёта не нужно экранировать:

```sql
insert into analysis_reports
  (report_date, entries_count, period_start, period_end, content, recommendation)
values
  ('[YYYY-MM-DD]', N, '[YYYY-MM-DD]', '[YYYY-MM-DD]', $md$[markdown из раздела 3]$md$, '[ok|warning|critical|done]')
returning id, report_date;
```

Если MCP недоступен — напиши тело в JSON-файл через `Write` (те же поля) и вставь через REST:

```bash
scripts/supabase-insert.sh analysis_reports /путь/к/report.json
```

Если insert падает с ошибкой check constraint на `recommendation` (таблица создана до появления значения `done`) — выполни `alter table public.analysis_reports drop constraint analysis_reports_recommendation_check, add constraint analysis_reports_recommendation_check check (recommendation in ('ok','warning','critical','done'));` через `mcp__supabase__apply_migration` (это DDL — не через `execute_sql`), затем повтори insert.

Если таблица не найдена (ошибка PGRST205) — сообщи пользователю что нужно создать таблицу в Supabase Dashboard, и выведи SQL:

```sql
create table public.analysis_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  report_date date not null,
  entries_count int not null,
  period_start date not null,
  period_end date not null,
  content text not null,
  recommendation text not null check (recommendation in ('ok', 'warning', 'critical', 'done'))
);
alter table public.analysis_reports enable row level security;
create policy "anon read" on public.analysis_reports for select using (true);
create policy "anon insert" on public.analysis_reports for insert with check (true);
```

## 5. После сохранения

- Выведи в чат краткое резюме (3–5 предложений): главные находки и вывод
- Если рекомендация ⚠️ или 🔴 — явно скажи: **"Советую запустить /adjust-program"** и объясни почему именно
- Если 🏁 — явно скажи: **"Курс пройден, советую запустить /plan-next-phase"** — это отдельный скилл, который смотрит на весь пройденный курс целиком и проектирует следующую фазу, а не точечно правит дни
- Если ✅ — скажи что делать дальше (продолжать текущий день, когда следующий анализ)
