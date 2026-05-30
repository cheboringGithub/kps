---
name: analyze-results
description: Анализ прогресса реабилитации КПС. Использовать когда пользователь пишет /analyze-results или просит проанализировать результаты тренировок, посмотреть прогресс, оценить динамику.
---

# Анализ результатов тренировок

## 1. Получить данные из Supabase

Выполни GET-запрос через bash:

```bash
curl -s "https://xfhduoighyjlxstvqhkc.supabase.co/rest/v1/checklist_entries?order=created_at.asc&limit=100" \
  -H "apikey: sb_publishable_ICqU5UrY5_Cr7EQX5OotbA_E6kpv1VP" \
  -H "Authorization: Bearer sb_publishable_ICqU5UrY5_Cr7EQX5OotbA_E6kpv1VP"
```

Если записей нет — сообщи пользователю что данных ещё нет и предложи заполнить анкету в PWA (вкладка «Дневник»).

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

## Общая картина
[2–3 предложения: что работает, что застряло, какой паттерн виден]

## Рекомендация
[ОДНО из трёх:]
- ✅ Программа работает по плану. Продолжай.
- ⚠️ Есть стагнация в [показателе]. Рекомендую запустить /adjust-program.
- 🔴 Ухудшение в [показателе]. Необходима коррекция — запусти /adjust-program.
```

Определи значение `recommendation`:
- `"ok"` — если рекомендация ✅
- `"warning"` — если ⚠️
- `"critical"` — если 🔴

## 4. Сохранить анализ в Supabase

```bash
curl -s -X POST "https://xfhduoighyjlxstvqhkc.supabase.co/rest/v1/analysis_reports" \
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
  recommendation text not null check (recommendation in ('ok', 'warning', 'critical'))
);
alter table public.analysis_reports enable row level security;
create policy "anon read" on public.analysis_reports for select using (true);
create policy "anon insert" on public.analysis_reports for insert with check (true);
```

## 5. После сохранения

- Выведи в чат краткое резюме (3–5 предложений): главные находки и вывод
- Если рекомендация ⚠️ или 🔴 — явно скажи: **"Советую запустить /adjust-program"** и объясни почему именно
- Если ✅ — скажи что делать дальше (продолжать текущий день, когда следующий анализ)
