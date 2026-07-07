import { DAYS, getDayDate } from '../../data/days'
import { EX } from '../../data/exercises'
import { PHASES } from '../../data/phases'
import { useAppStore } from '../../store/useAppStore'
import { ExerciseCard } from '../ExerciseCard/ExerciseCard'
import s from './DayView.module.css'

export function DayView() {
  const { currentDay, done, setActiveView } = useAppStore()
  const day = DAYS[currentDay - 1]
  if (!day) return null
  const phase = PHASES[day.phase]
  const isDone = done.has(currentDay)
  const totalMin = day.exs.reduce((sum, key) => sum + (parseInt(EX[key]?.time) || 0), 0)

  return (
    <main className={s.main}>
      <button className={s.backBtn} onClick={() => setActiveView('training')}>
        ← Вся программа
      </button>

      <div className={s.dayHeader}>
        <div className={s.dayMeta}>
          <div className={s.dayBigNum}>{String(currentDay).padStart(2, '0')}</div>
          <div>
            <div className={s.dayDate}>{getDayDate(currentDay)}</div>
            <div className={s.dayTitle} dangerouslySetInnerHTML={{ __html: day.title.replace('—', '—<em>') + '</em>' }} />
          </div>
        </div>
        <div className={s.dayFocus}>
          <strong>{phase.icon} {phase.name.split('·')[1]?.trim()}</strong>
        </div>
        <p className={s.dayDesc}>{day.desc}</p>
      </div>

      <div className={s.phaseBanner}>
        <div className={s.phaseIcon}>{phase.icon}</div>
        <div>
          <div className={s.phaseName}>{phase.name}</div>
          <div className={s.phaseDesc}>{phase.desc}</div>
        </div>
      </div>

      <div className={s.timeStrip}>
        <div className={s.timeChip}><strong>~{totalMin} мин</strong> общее время</div>
        <div className={s.timeChip}><strong>{day.exs.length}</strong> упражнений</div>
      </div>

      {day.exs.map((key, i) => {
        const ex = EX[key]
        if (!ex) return null
        return <ExerciseCard key={key + i} index={i} exercise={ex} />
      })}

      <button
        className={[s.completeBtn, isDone ? s.completeBtnDone : ''].join(' ')}
        onClick={() => { if (!isDone) setActiveView('checklist') }}
        disabled={isDone}
      >
        {isDone ? '✓ День выполнен' : '→ Заполнить анкету'}
      </button>
    </main>
  )
}
