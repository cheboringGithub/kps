import { useState, useEffect, useCallback } from 'react'
import { saveEntryWithAnalysis, fetchEntriesByDay, ChecklistEntry } from '../../lib/supabase'
import { useAppStore } from '../../store/useAppStore'
import s from './Checklist.module.css'

const BACK_PAIN_OPTS = [
  { value: 0, label: 'Нет боли' },
  { value: 1, label: 'Лёгкий дискомфорт' },
  { value: 2, label: 'Умеренная боль' },
  { value: 3, label: 'Острая' },
]
const KPS_OPTS = [
  { value: 1, label: 'Зажат, не отпускает' },
  { value: 2, label: 'Чуть свободнее' },
  { value: 3, label: 'Заметно открылся' },
]
const KNEE_OPTS = [
  { value: 0, label: 'Не беспокоит' },
  { value: 1, label: 'Лёгкое натяжение' },
  { value: 2, label: 'Тянет ощутимо' },
]
const SYMMETRY_OPTS = [
  { value: 'да', label: 'Да, давит' },
  { value: 'чуть меньше', label: 'Чуть меньше' },
  { value: 'примерно ровно', label: 'Примерно ровно' },
]
const FOOT_OPTS = [
  { value: 'заваливается внутрь', label: 'Заваливается внутрь' },
  { value: 'чуть нейтральнее', label: 'Чуть нейтральнее' },
  { value: 'нейтраль держится', label: 'Нейтраль держится' },
]

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function backPainLabel(v: number) { return BACK_PAIN_OPTS.find(o => o.value === v)?.label ?? '—' }
function kpsLabel(v: number) { return KPS_OPTS.find(o => o.value === v)?.label ?? '—' }
function kneeLabel(v: number) { return KNEE_OPTS.find(o => o.value === v)?.label ?? '—' }
function footLabel(v: string) { return FOOT_OPTS.find(o => o.value === v)?.label ?? '—' }

function Chips<T extends number | string>({
  options, value, onChange,
}: {
  options: { value: T; label: string }[]
  value: T | null
  onChange: (v: T) => void
}) {
  return (
    <div className={s.chips}>
      {options.map(o => (
        <button
          key={String(o.value)}
          className={[s.chip, value === o.value ? s.chipActive : ''].join(' ')}
          onClick={() => onChange(o.value)}
          type="button"
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function resetForm() {
  return { backPain: null as number | null, kps: null as number | null, knee: null as number | null, symmetry: null as string | null, foot: null as string | null, comment: '' }
}

export function Checklist() {
  const { currentDay, setActiveView } = useAppStore()

  const [form, setForm] = useState(resetForm())
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [entries, setEntries] = useState<ChecklistEntry[]>([])
  const [loading, setLoading] = useState(true)

  const loadEntries = useCallback(() => {
    setLoading(true)
    fetchEntriesByDay(currentDay)
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [currentDay])

  useEffect(() => { loadEntries() }, [loadEntries])

  const valid = form.backPain !== null && form.kps !== null && form.knee !== null && form.symmetry !== null && form.foot !== null

  async function handleSubmit() {
    if (!valid) return
    setStatus('saving')
    try {
      await saveEntryWithAnalysis({
        day_number: currentDay,
        back_pain: form.backPain!,
        kps_feeling: form.kps!,
        left_knee: form.knee!,
        sitting_symmetry: form.symmetry!,
        foot_feeling: form.foot!,
        comment: form.comment.trim() || undefined,
      })
      setStatus('done')
      setForm(resetForm())
      loadEntries()
      setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <main className={s.main}>
      <button className={s.backBtn} onClick={() => setActiveView('training')} type="button">
        ← Программа
      </button>

      <div className={s.header}>
        <div className={s.tag}>День {currentDay}</div>
        <h2 className={s.title}>Дневник</h2>
        <p className={s.sub}>Можно добавлять несколько записей за день</p>
      </div>

      {/* Записи текущего дня */}
      <div className={s.entriesSection}>
        {loading ? (
          <div className={s.empty}>Загружаю...</div>
        ) : entries.length === 0 ? (
          <div className={s.empty}>Записей за день {currentDay} пока нет</div>
        ) : (
          entries.map((e, idx) => (
            <div key={e.id ?? idx} className={s.entry}>
              <div className={s.entryMeta}>
                <span className={s.entryNum}>Запись {entries.length - idx}</span>
                <span className={s.entryTime}>{e.created_at ? formatTime(e.created_at) : ''}</span>
              </div>
              <div className={s.entryGrid}>
                <span className={s.entryKey}>Поясница</span>
                <span className={s.entryVal}>{backPainLabel(e.back_pain)}</span>
                <span className={s.entryKey}>КПС</span>
                <span className={s.entryVal}>{kpsLabel(e.kps_feeling)}</span>
                <span className={s.entryKey}>Колено</span>
                <span className={s.entryVal}>{kneeLabel(e.left_knee)}</span>
                <span className={s.entryKey}>Симметрия</span>
                <span className={s.entryVal}>{e.sitting_symmetry}</span>
                {e.foot_feeling && <>
                  <span className={s.entryKey}>Стопа</span>
                  <span className={s.entryVal}>{footLabel(e.foot_feeling)}</span>
                </>}
              </div>
              {e.comment && <div className={s.entryComment}>💬 {e.comment}</div>}
            </div>
          ))
        )}
      </div>

      {/* Форма новой записи */}
      <div className={s.formTitle}>+ Новая запись</div>
      <div className={s.form}>
        <div className={s.field}>
          <label className={s.label}>Поясница утром</label>
          <Chips options={BACK_PAIN_OPTS} value={form.backPain} onChange={v => setForm(f => ({ ...f, backPain: v }))} />
        </div>

        <div className={s.field}>
          <label className={s.label}>Левый КПС — ощущение при тракции</label>
          <Chips options={KPS_OPTS} value={form.kps} onChange={v => setForm(f => ({ ...f, kps: v }))} />
        </div>

        <div className={s.field}>
          <label className={s.label}>Левое колено сегодня</label>
          <Chips options={KNEE_OPTS} value={form.knee} onChange={v => setForm(f => ({ ...f, knee: v }))} />
        </div>

        <div className={s.field}>
          <label className={s.label}>Левая седалищная давит сильнее при сидении?</label>
          <Chips options={SYMMETRY_OPTS} value={form.symmetry} onChange={v => setForm(f => ({ ...f, symmetry: v }))} />
        </div>

        <div className={s.field}>
          <label className={s.label}>Левая стопа при стойке</label>
          <Chips options={FOOT_OPTS} value={form.foot} onChange={v => setForm(f => ({ ...f, foot: v }))} />
        </div>

        <div className={s.field}>
          <label className={s.label}>Комментарий (необязательно)</label>
          <textarea
            className={s.textarea}
            placeholder="Что-то особенное, что заметил..."
            value={form.comment}
            onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
            rows={3}
          />
        </div>

        {status === 'done' && <div className={s.success}>✓ Запись сохранена</div>}
        {status === 'error' && <div className={s.error}>Ошибка сохранения. Проверь интернет.</div>}

        <div className={s.actions}>
          <button
            className={[s.submitBtn, !valid || status === 'saving' ? s.submitDisabled : ''].join(' ')}
            onClick={handleSubmit}
            disabled={!valid || status === 'saving'}
            type="button"
          >
            {status === 'saving' ? 'Сохраняю...' : '→ Сохранить запись'}
          </button>

          <button
            className={s.analysisBtn}
            onClick={() => setActiveView('analysis')}
            type="button"
          >
            Смотреть анализ →
          </button>
        </div>
      </div>
    </main>
  )
}
