import { DAYS } from '../../data/days'
import { PHASES } from '../../data/phases'
import { useAppStore } from '../../store/useAppStore'
import s from './Nav.module.css'

export function Nav() {
  const { currentDay, done, setCurrentDay, activeView, setActiveView } = useAppStore()
  const doneCount = done.size
  const pct = Math.round((doneCount / 30) * 100)

  let currentPhase: number | null = null

  return (
    <aside className={s.sidebar}>
      <div className={s.brand}>
        <div className={s.brandTag}>Курс · 30 дней</div>
        <h1 className={s.brandTitle}>КПС &<br /><em>Подвижность</em></h1>
        <p className={s.brandSub}>Старт: пятница, 29 мая<br />Только ноги и таз · ~30 мин/день</p>
      </div>

      <div className={s.viewTabs}>
        <button
          className={[s.viewTab, activeView === 'training' ? s.viewTabActive : ''].join(' ')}
          onClick={() => setActiveView('training')}
        >
          Программа
        </button>
        <button
          className={[s.viewTab, activeView === 'checklist' ? s.viewTabActive : ''].join(' ')}
          onClick={() => setActiveView('checklist')}
        >
          Дневник
        </button>
      </div>

      {activeView === 'training' && (
        <nav className={s.weekNav}>
          {DAYS.map((day, i) => {
            const d = i + 1
            const isNewPhase = day.phase !== currentPhase
            if (isNewPhase) currentPhase = day.phase
            const phase = PHASES[day.phase]

            return (
              <div key={d}>
                {isNewPhase && (
                  <div className={s.weekSection}>
                    <div className={s.weekLabel}>{phase.name}</div>
                  </div>
                )}
                <button
                  className={[s.dayBtn, d === currentDay ? s.active : '', done.has(d) ? s.done : ''].join(' ')}
                  onClick={() => setCurrentDay(d)}
                >
                  <span className={s.dayNum}>д{d}</span>
                  <span className={s.dayTitle}>{day.short}</span>
                  <span className={s.dayDot} />
                </button>
              </div>
            )
          })}
        </nav>
      )}

      <div className={s.progress}>
        <div className={s.progressLabel}>
          Прогресс <span>{doneCount} / 30</span>
        </div>
        <div className={s.progressTrack}>
          <div className={s.progressFill} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </aside>
  )
}
