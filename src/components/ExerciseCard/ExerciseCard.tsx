import { useState } from 'react'
import type { Exercise } from '../../data/types'
import { Timer } from '../Timer/Timer'
import s from './ExerciseCard.module.css'

interface Props {
  index: number
  exercise: Exercise
}

const TYPE_CLASS: Record<string, string> = {
  kps: s.kpsFocus,
  fix: s.secondary,
}

const TYPE_PILL: Record<string, { label: string; cls: string }> = {
  kps: { label: 'КПС', cls: s.pillKps },
  fix: { label: 'Коррекция', cls: s.pillFix },
}

export function ExerciseCard({ index, exercise }: Props) {
  const [open, setOpen] = useState(false)
  const pill = TYPE_PILL[exercise.type]

  return (
    <div className={[s.card, TYPE_CLASS[exercise.type] ?? ''].join(' ')}>
      <div className={s.head} onClick={() => setOpen((o) => !o)}>
        <span className={s.idx}>{String(index + 1).padStart(2, '0')}</span>
        <span className={s.name}>{exercise.name}</span>
        <div className={s.pills}>
          <span className={`${s.pill} ${s.pillTime}`}>{exercise.time}</span>
          {pill && <span className={`${s.pill} ${pill.cls}`}>{pill.label}</span>}
        </div>
        <span className={[s.chevron, open ? s.chevronOpen : ''].join(' ')}>▼</span>
      </div>

      {open && (
        <div className={s.body}>
          <div className={s.how} dangerouslySetInnerHTML={{ __html: exercise.how }} />
          {exercise.note && <div className={s.note}>⚠ {exercise.note}</div>}
          <Timer timer={exercise.timer} totalRounds={exercise.timer.rounds} />
        </div>
      )}
    </div>
  )
}
