import { DAYS } from '../../data/days'
import { useAppStore } from '../../store/useAppStore'
import s from './Nav.module.css'

export function Nav() {
  const { done, activeView, setActiveView } = useAppStore()
  const doneCount = done.size
  const pct = Math.round((doneCount / DAYS.length) * 100)

  return (
    <aside className={s.sidebar}>
      <div className={s.brand}>
        <div className={s.brandTag}>Курс · 90 дней</div>
        <h1 className={s.brandTitle}>КПС &<br /><em>Подвижность</em></h1>
        <p className={s.brandSub}>Старт: пятница, 29 мая<br />Таз + верх + кор · до 60 мин/день</p>
      </div>

      <div className={s.viewTabs}>
        <button
          className={[s.viewTab, activeView === 'today' ? s.viewTabActive : ''].join(' ')}
          onClick={() => setActiveView('today')}
        >
          Следующая тренировка
        </button>
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
        <button
          className={[s.viewTab, activeView === 'analysis' ? s.viewTabActive : ''].join(' ')}
          onClick={() => setActiveView('analysis')}
        >
          Анализ
        </button>
      </div>

      <div className={s.progress}>
        <div className={s.progressLabel}>
          Прогресс <span>{doneCount} / {DAYS.length}</span>
        </div>
        <div className={s.progressTrack}>
          <div className={s.progressFill} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </aside>
  )
}
