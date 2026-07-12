import { WORKOUTS } from '../../data/gym/workouts'
import { useGymStore, GYM_VIEW_ORDER, type GymActiveView } from '../../store/useGymStore'
import { useAppStore } from '../../store/useAppStore'
import s from './GymNav.module.css'

const LABELS: Record<GymActiveView, string> = {
  workout: 'Тренировка',
  program: 'Программа',
  checklist: 'Дневник',
  analysis: 'Анализ',
}

export function GymNav() {
  const { done, activeView, setActiveView } = useGymStore()
  const setActiveProgram = useAppStore((st) => st.setActiveProgram)
  const doneCount = done.size
  const pct = Math.round((doneCount / WORKOUTS.length) * 100)

  return (
    <aside className={s.sidebar}>
      <div className={s.brand}>
        <button type="button" className={s.brandBack} onClick={() => setActiveProgram(null)}>
          ← Программы
        </button>
        <div className={s.brandTag}>Зал · 30 дней / 10 тренировок</div>
        <h1 className={s.brandTitle}>Сила &<br /><em>Мобильность</em></h1>
        <p className={s.brandSub}>3 тренировки в неделю · 60–90 мин<br />Колено под защитой, таз в приоритете</p>
      </div>

      <div className={s.viewTabs}>
        {GYM_VIEW_ORDER.map(v => (
          <button
            key={v}
            className={[s.viewTab, v === activeView ? s.viewTabActive : ''].join(' ')}
            onClick={() => setActiveView(v)}
          >
            {LABELS[v]}
          </button>
        ))}
      </div>

      <div className={s.progress}>
        <div className={s.progressLabel}>
          Прогресс <span>{doneCount} / {WORKOUTS.length}</span>
        </div>
        <div className={s.progressTrack}>
          <div className={s.progressFill} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </aside>
  )
}
