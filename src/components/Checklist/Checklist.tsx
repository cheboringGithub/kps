import { useState, useEffect } from 'react'
import { saveEntryWithAnalysis, fetchEntries, ChecklistEntry } from '../../lib/supabase'
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

function backPainLabel(v: number) { return BACK_PAIN_OPTS.find(o => o.value === v)?.label ?? '—' }
function kpsLabel(v: number) { return KPS_OPTS.find(o => o.value === v)?.label ?? '—' }
function kneeLabel(v: number) { return KNEE_OPTS.find(o => o.value === v)?.label ?? '—' }

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

export function Checklist() {
  const { currentDay, done, toggleDone, setActiveView } = useAppStore()
  const [backPain, setBackPain] = useState<number | null>(null)
  const [kps, setKps] = useState<number | null>(null)
  const [knee, setKnee] = useState<number | null>(null)
  const [symmetry, setSymmetry] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [history, setHistory] = useState<ChecklistEntry[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    fetchEntries(5)
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoadingHistory(false))
  }, [status])

  const valid = backPain !== null && kps !== null && knee !== null && symmetry !== null

  async function handleSubmit() {
    if (!valid) return
    setStatus('saving')
    try {
      await saveEntryWithAnalysis({
        day_number: currentDay,
        back_pain: backPain!,
        kps_feeling: kps!,
        left_knee: knee!,
        sitting_symmetry: symmetry!,
        comment: comment.trim() || undefined,
      })
      if (!done.has(currentDay)) toggleDone(currentDay)
      setStatus('done')
      setTimeout(() => setActiveView('analysis'), 800)
    } catch {
      setStatus('error')
    }
  }

  return (
    <main className={s.main}>
      <button className={s.backBtn} onClick={() => setActiveView('training')} type="button">← Программа</button>

      <div className={s.header}>
        <div className={s.tag}>День {currentDay}</div>
        <h2 className={s.title}>Анкета после тренировки</h2>
        <p className={s.sub}>5 вопросов · ~1 минута</p>
      </div>

      <div className={s.form}>
        <div className={s.field}>
          <label className={s.label}>Поясница утром</label>
          <Chips options={BACK_PAIN_OPTS} value={backPain} onChange={setBackPain} />
        </div>

        <div className={s.field}>
          <label className={s.label}>Левый КПС — ощущение при тракции</label>
          <Chips options={KPS_OPTS} value={kps} onChange={setKps} />
        </div>

        <div className={s.field}>
          <label className={s.label}>Левое колено сегодня</label>
          <Chips options={KNEE_OPTS} value={knee} onChange={setKnee} />
        </div>

        <div className={s.field}>
          <label className={s.label}>Левая седалищная давит сильнее при сидении?</label>
          <Chips options={SYMMETRY_OPTS} value={symmetry} onChange={setSymmetry} />
        </div>

        <div className={s.field}>
          <label className={s.label}>Комментарий (необязательно)</label>
          <textarea
            className={s.textarea}
            placeholder="Что-то особенное, что заметил во время тренировки..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
          />
        </div>

        {status === 'done' && (
          <div className={s.success}>✓ Сохранено — открываю анализ...</div>
        )}
        {status === 'error' && (
          <div className={s.error}>Ошибка сохранения. Проверь интернет.</div>
        )}

        <button
          className={[s.submitBtn, !valid || status === 'saving' ? s.submitDisabled : ''].join(' ')}
          onClick={handleSubmit}
          disabled={!valid || status === 'saving'}
          type="button"
        >
          {status === 'saving' ? 'Сохраняю...' : '→ Сохранить и посмотреть анализ'}
        </button>
      </div>

      <div className={s.historySection}>
        <div className={s.historyTitle}>Последние записи</div>
        {loadingHistory ? (
          <div className={s.historyEmpty}>Загружаю...</div>
        ) : history.length === 0 ? (
          <div className={s.historyEmpty}>Записей пока нет</div>
        ) : (
          history.map(e => (
            <div key={e.id} className={s.entry}>
              <div className={s.entryMeta}>
                <span className={s.entryDay}>День {e.day_number}</span>
                <span className={s.entryDate}>{formatDate(e.created_at!)}</span>
              </div>
              <div className={s.entryRow}>
                <span className={s.entryKey}>Поясница</span>
                <span className={s.entryVal}>{backPainLabel(e.back_pain)}</span>
              </div>
              <div className={s.entryRow}>
                <span className={s.entryKey}>КПС</span>
                <span className={s.entryVal}>{kpsLabel(e.kps_feeling)}</span>
              </div>
              <div className={s.entryRow}>
                <span className={s.entryKey}>Колено</span>
                <span className={s.entryVal}>{kneeLabel(e.left_knee)}</span>
              </div>
              <div className={s.entryRow}>
                <span className={s.entryKey}>Симметрия</span>
                <span className={s.entryVal}>{e.sitting_symmetry}</span>
              </div>
              {e.comment && (
                <div className={s.entryRow}>
                  <span className={s.entryKey}>Комментарий</span>
                  <span className={s.entryVal}>{e.comment}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  )
}
