import { DAYS, getDayDate } from '../../data/days'
import { PHASES } from '../../data/phases'
import { useAppStore } from '../../store/useAppStore'
import s from './Program.module.css'

export function Program() {
  const { currentDay, done, setCurrentDay } = useAppStore()
  let currentPhase: number | null = null

  const totalDays = DAYS.length
  const doneCount = done.size
  const remainingCount = totalDays - doneCount
  const pct = Math.round((doneCount / totalDays) * 100)

  // tick marks where one phase ends and the next begins, for orientation on the bar
  const phaseTicks: number[] = []
  {
    let seen = 0
    let lastPhase: number | null = null
    DAYS.forEach((day) => {
      if (lastPhase !== null && day.phase !== lastPhase) phaseTicks.push((seen / totalDays) * 100)
      lastPhase = day.phase
      seen++
    })
  }

  return (
    <main className={s.main}>
      <div className={s.header}>
        <div className={s.eyebrow}>Вся программа · 90 дней</div>
        <h2 className={s.title}>Что делаем и когда</h2>
        <p className={s.sub}>Каждый день — свой фокус. Открой день, чтобы увидеть упражнения.</p>
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
            <div className={s.progressStatLabel}>курса</div>
          </div>
        </div>
        <div className={s.progressBar}>
          <div className={s.progressBarFill} style={{ width: `${pct}%` }} />
          {phaseTicks.map((left) => (
            <div key={left} className={s.progressBarTick} style={{ left: `${left}%` }} />
          ))}
        </div>
      </div>

      {DAYS.map((day, i) => {
        const d = i + 1
        const isNewPhase = day.phase !== currentPhase
        if (isNewPhase) currentPhase = day.phase
        const phase = PHASES[day.phase]

        return (
          <div key={d}>
            {isNewPhase && (
              <div className={s.phaseHeader}>
                <span className={s.phaseIcon}>{phase.icon}</span>
                <div>
                  <div className={s.phaseName}>{phase.name}</div>
                  <div className={s.phaseTitle}>{phase.title}</div>
                </div>
              </div>
            )}
            <button
              className={[s.dayRow, d === currentDay ? s.active : '', done.has(d) ? s.done : ''].join(' ')}
              onClick={() => setCurrentDay(d)}
            >
              <span className={s.dayNum}>{String(d).padStart(2, '0')}</span>
              <div className={s.dayInfo}>
                <div className={s.dayTitle}>{day.short}</div>
                <div className={s.dayDate}>{getDayDate(d)}</div>
              </div>
              <span className={s.dayDot} />
            </button>
          </div>
        )
      })}
    </main>
  )
}
