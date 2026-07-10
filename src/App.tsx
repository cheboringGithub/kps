import { useEffect, useRef } from 'react'
import { useAppStore, type ActiveView } from './store/useAppStore'
import { Nav } from './components/Nav/Nav'
import { DayView } from './components/DayView/DayView'
import { Program } from './components/Program/Program'
import { Checklist } from './components/Checklist/Checklist'
import { Analysis } from './components/Analysis/Analysis'
import { fetchEntries } from './lib/supabase'
import { DAYS } from './data/days'
import s from './App.module.css'

const VIEW_ORDER: ActiveView[] = ['today', 'training', 'checklist', 'analysis']
const SWIPE_THRESHOLD = 60

export function App() {
  const { activeView, markDone, advanceCurrentDayTo, setActiveView } = useAppStore()

  useEffect(() => {
    fetchEntries(100).then(entries => {
      const remoteDays = entries.map(e => e.day_number)
      remoteDays.forEach(d => markDone(d))
      // On a fresh device/browser the local "current day" pointer starts at 1 —
      // catch it up to remote progress so this tab shows the next undone workout
      // instead of getting stuck on an already-completed day.
      if (remoteDays.length > 0) {
        advanceCurrentDayTo(Math.min(Math.max(...remoteDays) + 1, DAYS.length))
      }
    }).catch(() => {})
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  // Push a history entry per view switch so the Android system back button
  // steps back through in-app screens (e.g. out of an in-progress Дневник
  // form) instead of immediately closing/reloading the app and losing it.
  const mountedRef = useRef(false)
  const fromPopRef = useRef(false)

  useEffect(() => {
    window.history.replaceState({ activeView }, '')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return }
    if (fromPopRef.current) { fromPopRef.current = false; return }
    window.history.pushState({ activeView }, '')
  }, [activeView])

  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      fromPopRef.current = true
      setActiveView((e.state?.activeView as ActiveView) ?? 'today')
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [setActiveView])

  // Swipe left/right between tabs on mobile (matches the .shell mobile breakpoint).
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const onTouchStart = (e: React.TouchEvent) => {
    if (!window.matchMedia('(max-width: 700px)').matches) { touchStartRef.current = null; return }
    const t = e.touches[0]
    touchStartRef.current = { x: t.clientX, y: t.clientY }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current
    touchStartRef.current = null
    if (!start) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return

    const currentIndex = VIEW_ORDER.indexOf(activeView)
    const nextIndex = dx < 0 ? currentIndex + 1 : currentIndex - 1
    if (nextIndex < 0 || nextIndex >= VIEW_ORDER.length) return
    setActiveView(VIEW_ORDER[nextIndex])
  }

  return (
    <div className={s.shell}>
      <Nav />
      <div className={s.content} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {activeView === 'checklist' ? <Checklist />
          : activeView === 'analysis' ? <Analysis />
          : activeView === 'training' ? <Program />
          : <DayView />}
      </div>
    </div>
  )
}
