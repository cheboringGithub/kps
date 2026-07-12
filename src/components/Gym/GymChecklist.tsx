import { useState } from 'react'
import { saveGymEntryWithAnalysis, type GymRpe, type GymSetLogEntry } from '../../lib/gymSupabase'
import { useGymStore } from '../../store/useGymStore'
import { WORKOUTS } from '../../data/gym/workouts'
import s from './GymChecklist.module.css'

const RPE_OPTS: { value: GymRpe; label: string }[] = [
  { value: 'Легко', label: 'Легко' },
  { value: 'Норм', label: 'Норм' },
  { value: 'Тяжело', label: 'Тяжело' },
  { value: 'Предел', label: 'Предел' },
]
const KNEE_OPTS = [
  { value: 0, label: 'Не беспокоит' },
  { value: 1, label: 'Лёгкое натяжение' },
  { value: 2, label: 'Тянет ощутимо' },
]

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
  return { rpe: null as GymRpe | null, knee: null as number | null, comment: '' }
}

export function GymChecklist() {
  const { currentWorkout, done, setActiveView, setCurrentWorkout, markDone, setLog } = useGymStore()

  const [form, setForm] = useState(resetForm())
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')

  const valid = form.rpe !== null && form.knee !== null

  async function handleSubmit() {
    if (!valid) return
    setStatus('saving')
    try {
      const forWorkout = setLog[currentWorkout] ?? {}
      const sets: GymSetLogEntry[] = Object.entries(forWorkout).flatMap(([exerciseId, exSets]) =>
        exSets
          .map((set, i) => ({ exercise_id: exerciseId, set_index: i, reps: set.reps, weight_kg: set.weightKg }))
          .filter(s => s.reps !== null || s.weight_kg !== null),
      )

      await saveGymEntryWithAnalysis({
        workout_number: currentWorkout,
        rpe: form.rpe!,
        knee_pain: form.knee!,
        sets,
        comment: form.comment.trim() || undefined,
      })
      setStatus('done')
      setForm(resetForm())
      const wasDone = done.has(currentWorkout)
      markDone(currentWorkout)
      if (!wasDone && currentWorkout < WORKOUTS.length) {
        setCurrentWorkout(currentWorkout + 1)
      }
      setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <main className={s.main}>
      <button className={s.backBtn} onClick={() => setActiveView('workout')} type="button">
        ← Тренировка
      </button>

      <div className={s.header}>
        <div className={s.tag}>Тренировка {currentWorkout}</div>
        <h2 className={s.title}>Дневник зала</h2>
        <p className={s.sub}>Вес и повторы по каждому подходу уже введены в карточках упражнений — здесь только самочувствие</p>
      </div>

      <div className={s.form}>
        <div className={s.field}>
          <label className={s.label}>RPE — субъективная тяжесть тренировки</label>
          <Chips options={RPE_OPTS} value={form.rpe} onChange={v => setForm(f => ({ ...f, rpe: v }))} />
        </div>

        <div className={s.field}>
          <label className={s.label}>Левое колено сегодня</label>
          <Chips options={KNEE_OPTS} value={form.knee} onChange={v => setForm(f => ({ ...f, knee: v }))} />
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

        {status === 'done' && <div className={s.success}>✓ Тренировка сохранена</div>}
        {status === 'error' && <div className={s.error}>Ошибка сохранения. Проверь интернет.</div>}

        <div className={s.actions}>
          <button
            className={[s.submitBtn, !valid || status === 'saving' ? s.submitDisabled : ''].join(' ')}
            onClick={handleSubmit}
            disabled={!valid || status === 'saving'}
            type="button"
          >
            {status === 'saving' ? 'Сохраняю...' : '→ Сохранить тренировку'}
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
