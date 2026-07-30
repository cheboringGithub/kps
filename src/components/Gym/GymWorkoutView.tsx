import { WORKOUTS } from '../../data/gym/workouts'
import { useGymStore } from '../../store/useGymStore'
import { GymExerciseCard } from './GymExerciseCard'
import s from './GymWorkoutView.module.css'

export function GymWorkoutView() {
  const { currentWorkout, done, setActiveView, syncState } = useGymStore()
  const workout = WORKOUTS[currentWorkout - 1]
  if (!workout) return null
  const isDone = done.has(currentWorkout)

  // Силовая часть — 60-90 минут; кардио-блок в конце добавляется к ним, а не
  // втискивается внутрь, поэтому время тренировки считаем с ним.
  const cardioMin = workout.exs.reduce((sum, wex) => sum + (wex.cardio?.minutes ?? 0), 0)
  const strengthCount = workout.exs.filter((wex) => !wex.cardio).length

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
        <div className={s.timeChip}><strong>{strengthCount}</strong> упражнений</div>
        <div className={s.timeChip}><strong>~{60 + cardioMin}–{90 + cardioMin} мин</strong> тренировка</div>
        {cardioMin > 0 && (
          <div className={s.timeChip}><strong>{cardioMin} мин</strong> велотренажёр в конце</div>
        )}
        {syncState !== 'idle' && (
          <div className={`${s.timeChip} ${s.syncChip}`}>
            {syncState === 'saving' ? '⟳ сохраняю подходы' : '● не отправлено — уйдёт при связи'}
          </div>
        )}
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
