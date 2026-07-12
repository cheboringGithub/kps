import { useEffect, useState } from 'react'
import { DAYS } from '../../data/days'
import { useAppStore, VIEW_ORDER, type ActiveView } from '../../store/useAppStore'
import s from './Nav.module.css'

const LABELS: Record<ActiveView, string> = {
  today: 'Следующая тренировка',
  training: 'Программа',
  checklist: 'Дневник',
  analysis: 'Анализ',
}

export function Nav() {
  const { done, activeView, setActiveView, setActiveProgram } = useAppStore()
  const [expanded, setExpanded] = useState(false)
  const doneCount = done.size
  const pct = Math.round((doneCount / DAYS.length) * 100)

  // Collapse back to the compact single-tab view any time the active view
  // changes — whether by picking a tab, swiping, or a checklist-submit advance.
  useEffect(() => { setExpanded(false) }, [activeView])

  return (
    <aside className={s.sidebar}>
      <div className={s.brand}>
        <button type="button" className={s.brandBack} onClick={() => setActiveProgram(null)}>
          ← Программы
        </button>
        <div className={s.brandTag}>Курс · 90 дней</div>
        <h1 className={s.brandTitle}>КПС &<br /><em>Подвижность</em></h1>
        <p className={s.brandSub}>Старт: пятница, 29 мая<br />Таз + верх + кор · до 60 мин/день</p>
      </div>

      <div className={[s.viewTabs, expanded ? s.viewTabsOpen : ''].join(' ')}>
        {VIEW_ORDER.map(v => (
          <button
            key={v}
            className={[s.viewTab, v === activeView ? s.viewTabActive : ''].join(' ')}
            onClick={() => setActiveView(v)}
          >
            {LABELS[v]}
          </button>
        ))}
      </div>

      <button
        type="button"
        className={s.swipeHint}
        onClick={() => setExpanded(e => !e)}
        aria-label={expanded ? 'Свернуть список вкладок' : 'Показать все вкладки'}
      >
        <span className={s.swipeChevron}>‹</span>
        {VIEW_ORDER.map(v => (
          <span key={v} className={[s.swipeDot, v === activeView ? s.swipeDotActive : ''].join(' ')} />
        ))}
        <span className={s.swipeChevron}>›</span>
        <span className={s.expandArrow}>{expanded ? '▴' : '▾'}</span>
      </button>

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
