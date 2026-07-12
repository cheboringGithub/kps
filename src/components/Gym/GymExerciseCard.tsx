import { useState } from 'react'
import type { WorkoutExercise } from '../../data/gym/types'
import { GYM_EX } from '../../data/gym/exercises'
import { useGymStore } from '../../store/useGymStore'
import s from './GymExerciseCard.module.css'

interface Props {
  index: number
  workoutExercise: WorkoutExercise
}

export function GymExerciseCard({ index, workoutExercise }: Props) {
  const [open, setOpen] = useState(false)
  const exercise = GYM_EX[workoutExercise.id]

  const currentWorkout = useGymStore((st) => st.currentWorkout)
  const loggedSets = useGymStore((st) => st.setLog[currentWorkout]?.[workoutExercise.id])
  const setSetValue = useGymStore((st) => st.setSetValue)

  if (!exercise) return null

  const isDone = Array.from({ length: workoutExercise.sets }).every(
    (_, i) => loggedSets?.[i]?.reps != null,
  )

  return (
    <div className={[s.card, isDone ? s.cardDone : ''].join(' ')}>
      <div className={s.head} onClick={() => setOpen((o) => !o)}>
        <span className={s.idx}>{String(index + 1).padStart(2, '0')}</span>
        <span className={s.name}>{exercise.name}</span>
        <div className={s.pills}>
          <span className={`${s.pill} ${s.pillSets}`}>{workoutExercise.sets}×{workoutExercise.reps}</span>
        </div>
        <span className={[s.doneMark, isDone ? s.doneMarkActive : ''].join(' ')}>✓</span>
        <span className={[s.chevron, open ? s.chevronOpen : ''].join(' ')}>▼</span>
      </div>

      {open && (
        <div className={s.body}>
          <div className={s.equipment}>{exercise.equipment}</div>
          <div className={s.how}>{exercise.how}</div>
          {exercise.note && <div className={s.note}>⚠ {exercise.note}</div>}

          <div className={s.setsHeader}>
            <span className={s.setsHeaderNum}>Сет</span>
            <span className={s.setsHeaderField}>Вес, кг</span>
            <span className={s.setsHeaderField}>Повторы</span>
          </div>
          {Array.from({ length: workoutExercise.sets }).map((_, i) => {
            const set = loggedSets?.[i]
            return (
              <div key={i} className={s.setRow}>
                <span className={s.setNum}>{i + 1}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  className={s.setInput}
                  placeholder={workoutExercise.weight}
                  value={set?.weightKg ?? ''}
                  onChange={(e) => setSetValue(
                    currentWorkout, workoutExercise.id, i, 'weightKg',
                    e.target.value === '' ? null : Number(e.target.value),
                  )}
                />
                <input
                  type="number"
                  inputMode="numeric"
                  className={s.setInput}
                  placeholder={workoutExercise.reps}
                  value={set?.reps ?? ''}
                  onChange={(e) => setSetValue(
                    currentWorkout, workoutExercise.id, i, 'reps',
                    e.target.value === '' ? null : Number(e.target.value),
                  )}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
