import { useState, useEffect } from 'react'
import { insertEntry, fetchEntries, ChecklistEntry } from '../../lib/supabase'
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
  const [day, setDay] = useState<number>(1)
  const [backPain, setBackPain] = useState<number | null>(null)
  const [kps, setKps] = useState<number | null>(null)
  const [knee, setKnee] = useState<number | null>(null)
  const [symmetry, setSymmetry] = useState<string | null>(null)
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
      await insertEntry({
        day_number: day,
        back_pain: backPain!,
        kps_feeling: kps!,
        left_knee: knee!,
        sitting_symmetry: symmetry!,
      })
      setStatus('done')
      setBackPain(null)
      setKps(null)
      setKnee(null)
      setSymmetry(null)
    } catch {
      setStatus('error')
    }
  }

  return (
    <main className={s.main}>
      <div className={s.header}>
        <div className={s.tag}>Дневник тренировок</div>
        <h2 className={s.title}>Анкета после тренировки</h2>
        <p className={s.sub}>5 вопросов · ~1 минута</p>
      </div>

      <div className={s.form}>
        <div className={s.field}>
          <label className={s.label}>День программы</label>
          <div className={s.dayRow}>
            <button className={s.stepper} onClick={() => setDay(d => Math.max(1, d - 1))} type="button">−</button>
            <span className={s.dayNum}>{day}</span>
            <button className={s.stepper} onClick={() => setDay(d => Math.min(30, d + 1))} type="button">+</button>
          </div>
        </div>

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

        {status === 'done' && (
          <div className={s.success}>✓ Сохранено</div>
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
          {status === 'saving' ? 'Сохраняю...' : '→ Сохранить запись'}
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
            </div>
          ))
        )}
      </div>
    </main>
  )
}
