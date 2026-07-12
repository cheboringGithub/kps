import { WORKOUTS } from '../../data/gym/workouts'
import { useGymStore } from '../../store/useGymStore'
import s from './GymProgram.module.css'

export function GymProgram() {
  const { currentWorkout, done, setCurrentWorkout } = useGymStore()
  let currentWeek: number | null = null

  const total = WORKOUTS.length
  const doneCount = done.size
  const remainingCount = total - doneCount
  const pct = Math.round((doneCount / total) * 100)

  return (
    <main className={s.main}>
      <div className={s.header}>
        <div className={s.eyebrow}>Программа зала · 30 дней / 10 тренировок</div>
        <h2 className={s.title}>Что делаем и когда</h2>
        <p className={s.sub}>3 тренировки в неделю, ротация A/B/C. Открой тренировку, чтобы увидеть упражнения.</p>
      </div>

      <div className={s.progressSection}>
        <div className={s.progressStats}>
          <div className={s.progressStat}>
            <div className={s.progressStatNum}>{doneCount}</div>
            <div className={s.progressStatLabel}>пройдено</div>
          </div>
          <div className={s.progressStat}>
            <div className={s.progressStatNum}>{remainingCount}</div>
            <div className={s.progressStatLabel}>осталось</div>
          </div>
          <div className={s.progressStat}>
            <div className={s.progressStatNum}>{pct}%</div>
            <div className={s.progressStatLabel}>программы</div>
          </div>
        </div>
        <div className={s.progressBar}>
          <div className={s.progressBarFill} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {WORKOUTS.map((w, i) => {
        const n = i + 1
        const isNewWeek = w.week !== currentWeek
        if (isNewWeek) currentWeek = w.week

        return (
          <div key={n}>
            {isNewWeek && (
              <div className={s.weekHeader}>
                <span className={s.weekName}>Неделя {w.week}</span>
              </div>
            )}
            <button
              className={[s.workoutRow, n === currentWorkout ? s.active : '', done.has(n) ? s.done : ''].join(' ')}
              onClick={() => setCurrentWorkout(n)}
            >
              <span className={s.workoutNum}>{String(n).padStart(2, '0')}</span>
              <div className={s.workoutInfo}>
                <div className={s.workoutTitle}>{w.short}</div>
              </div>
              <span className={s.workoutDot} />
            </button>
          </div>
        )
      })}
    </main>
  )
}
