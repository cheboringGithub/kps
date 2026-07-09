import { useState } from 'react'
import type { Exercise } from '../../data/types'
import { Timer } from '../Timer/Timer'
import { useAppStore } from '../../store/useAppStore'
import s from './ExerciseCard.module.css'

interface Props {
  index: number
  exercise: Exercise
  exKey: string
}

const TYPE_CLASS: Record<string, string> = {
  kps: s.kpsFocus,
  fix: s.secondary,
}

const TYPE_PILL: Record<string, { label: string; cls: string }> = {
  kps: { label: 'КПС', cls: s.pillKps },
  fix: { label: 'Коррекция', cls: s.pillFix },
}

export function ExerciseCard({ index, exercise, exKey }: Props) {
  const [open, setOpen] = useState(false)
  const pill = TYPE_PILL[exercise.type]

  const currentDay = useAppStore((st) => st.currentDay)
  const isDone = useAppStore((st) => st.exerciseDone[currentDay]?.includes(exKey) ?? false)
  const toggleExerciseDone = useAppStore((st) => st.toggleExerciseDone)
  const setExerciseDone = useAppStore((st) => st.setExerciseDone)

  return (
    <div className={[s.card, TYPE_CLASS[exercise.type] ?? '', isDone ? s.cardDone : ''].join(' ')}>
      <div className={s.head} onClick={() => setOpen((o) => !o)}>
        <span className={s.idx}>{String(index + 1).padStart(2, '0')}</span>
        <span className={s.name}>{exercise.name}</span>
        <div className={s.pills}>
          <span className={`${s.pill} ${s.pillTime}`}>{exercise.time}</span>
          {pill && <span className={`${s.pill} ${pill.cls}`}>{pill.label}</span>}
        </div>
        <button
          type="button"
          className={[s.doneToggle, isDone ? s.doneToggleActive : ''].join(' ')}
          onClick={(e) => { e.stopPropagation(); toggleExerciseDone(currentDay, exKey) }}
          aria-pressed={isDone}
          title={isDone ? 'Снять отметку выполнения' : 'Отметить выполненным'}
        >
          ✓
        </button>
        <span className={[s.chevron, open ? s.chevronOpen : ''].join(' ')}>▼</span>
      </div>

      {open && (
        <div className={s.body}>
          <div className={s.how} dangerouslySetInnerHTML={{ __html: exercise.how }} />
          {exercise.note && <div className={s.note}>⚠ {exercise.note}</div>}
          {exercise.repsOnly ? (
            <button
              type="button"
              className={[s.repsCompleteBtn, isDone ? s.repsCompleteBtnDone : ''].join(' ')}
              onClick={() => setExerciseDone(currentDay, exKey, !isDone)}
            >
              {isDone ? '✓ Выполнено' : '→ Отметить выполненным'}
            </button>
          ) : (
            <Timer
              timer={exercise.timer}
              totalRounds={exercise.timer.rounds}
              onComplete={() => setExerciseDone(currentDay, exKey, true)}
            />
          )}
        </div>
      )}
    </div>
  )
}
