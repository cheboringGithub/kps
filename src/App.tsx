import { useEffect, useRef } from 'react'
import { useAppStore, type ActiveView } from './store/useAppStore'
import { Nav } from './components/Nav/Nav'
import { DayView } from './components/DayView/DayView'
import { Program } from './components/Program/Program'
import { Checklist } from './components/Checklist/Checklist'
import { Analysis } from './components/Analysis/Analysis'
import { fetchEntries } from './lib/supabase'
import s from './App.module.css'

export function App() {
  const { activeView, markDone, setActiveView } = useAppStore()

  useEffect(() => {
    fetchEntries(100).then(entries => {
      const remoteDays = new Set(entries.map(e => e.day_number))
      remoteDays.forEach(d => markDone(d))
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

  return (
    <div className={s.shell}>
      <Nav />
      {activeView === 'checklist' ? <Checklist />
        : activeView === 'analysis' ? <Analysis />
        : activeView === 'training' ? <Program />
        : <DayView />}
    </div>
  )
}
