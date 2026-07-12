import { WORKOUTS } from '../../data/gym/workouts'
import { useGymStore } from '../../store/useGymStore'
import { GymExerciseCard } from './GymExerciseCard'
import s from './GymWorkoutView.module.css'

export function GymWorkoutView() {
  const { currentWorkout, done, setActiveView } = useGymStore()
  const workout = WORKOUTS[currentWorkout - 1]
  if (!workout) return null
  const isDone = done.has(currentWorkout)

  return (
    <main className={s.main}>
      <button className={s.backBtn} onClick={() => setActiveView('program')}>
        ← Вся программа
      </button>

      <div className={s.header}>
        <div className={s.meta}>
          <div className={s.bigNum}>{String(currentWorkout).padStart(2, '0')}</div>
          <div>
            <div className={s.week}>Тренировка {currentWorkout} · Неделя {workout.week}</div>
            <div className={s.title}>{workout.title}</div>
          </div>
        </div>
        <p className={s.desc}>{workout.desc}</p>
      </div>

      <div className={s.timeStrip}>
        <div className={s.timeChip}><strong>{workout.exs.length}</strong> упражнений</div>
        <div className={s.timeChip}><strong>~{60}–90 мин</strong> тренировка</div>
      </div>

      {workout.exs.map((wex, i) => (
        <GymExerciseCard key={wex.id + i} index={i} workoutExercise={wex} />
      ))}

      <button
        className={[s.completeBtn, isDone ? s.completeBtnDone : ''].join(' ')}
        onClick={() => { if (!isDone) setActiveView('checklist') }}
        disabled={isDone}
      >
        {isDone ? '✓ Тренировка выполнена' : '→ Заполнить анкету'}
      </button>
    </main>
  )
}
