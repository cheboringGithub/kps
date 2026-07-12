---
name: gym-analyze-results
description: Анализ прогресса силовой программы в зале. Использовать когда пользователь пишет /gym-analyze-results или просит проанализировать результаты тренировок в зале, посмотреть силовой прогресс.
---

# Анализ результатов тренировок в зале

## 1. Получить данные из Supabase

Выполни GET-запрос через bash:

```bash
curl -s "https://xfhduoighyjlxstvqhkc.supabase.co/rest/v1/gym_entries?order=created_at.asc&limit=100" \
  -H "apikey: sb_publishable_ICqU5UrY5_Cr7EQX5OotbA_E6kpv1VP" \
  -H "Authorization: Bearer sb_publishable_ICqU5UrY5_Cr7EQX5OotbA_E6kpv1VP"
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

## Общая картина
[2–3 предложения: что растёт, что стагнирует, есть ли риск по колену]

## Рекомендация
[ОДНО из трёх:]
- ✅ Программа работает по плану. Продолжай.
- ⚠️ Есть стагнация/перегруз в [упражнении/показателе]. Рекомендую запустить /gym-adjust-program.
- 🔴 Колено реагирует / выраженный перегруз. Необходима коррекция — запусти /gym-adjust-program.
```

Определи значение `recommendation`:
- `"ok"` — если рекомендация ✅
- `"warning"` — если ⚠️
- `"critical"` — если 🔴 (в том числе всегда при `knee_pain >= 2` в последних записях)

## 4. Сохранить анализ в Supabase

```bash
curl -s -X POST "https://xfhduoighyjlxstvqhkc.supabase.co/rest/v1/gym_analysis_reports" \
  -H "apikey: sb_publishable_ICqU5UrY5_Cr7EQX5OotbA_E6kpv1VP" \
  -H "Authorization: Bearer sb_publishable_ICqU5UrY5_Cr7EQX5OotbA_E6kpv1VP" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "report_date": "[YYYY-MM-DD]",
    "entries_count": N,
    "period_start": "[YYYY-MM-DD]",
    "period_end": "[YYYY-MM-DD]",
    "content": "[экранированный markdown]",
    "recommendation": "[ok|warning|critical]"
  }'
```

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
  recommendation text not null check (recommendation in ('ok', 'warning', 'critical'))
);
alter table public.gym_analysis_reports enable row level security;
create policy "anon read" on public.gym_analysis_reports for select using (true);
create policy "anon insert" on public.gym_analysis_reports for insert with check (true);
```

## 5. После сохранения

- Выведи в чат краткое резюме (3–5 предложений): главные находки и вывод
- Если рекомендация ⚠️ или 🔴 — явно скажи: **"Советую запустить /gym-adjust-program"** и объясни почему именно
- Если ✅ — скажи что делать дальше (продолжать текущую тренировку, когда следующий анализ)
