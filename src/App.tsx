import { useEffect } from 'react'
import { useAppStore } from './store/useAppStore'
import { Nav } from './components/Nav/Nav'
import { DayView } from './components/DayView/DayView'
import { Checklist } from './components/Checklist/Checklist'
import { Analysis } from './components/Analysis/Analysis'
import { fetchEntries } from './lib/supabase'
import s from './App.module.css'

export function App() {
  const { mobileView, activeView, done, toggleDone } = useAppStore()

  useEffect(() => {
    fetchEntries(100).then(entries => {
      const remoteDays = new Set(entries.map(e => e.day_number))
      remoteDays.forEach(d => { if (!done.has(d)) toggleDone(d) })
    }).catch(() => {})
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={[s.shell, mobileView === 'day' || activeView === 'checklist' || activeView === 'analysis' ? s.showDay : ''].join(' ')}>
      <Nav />
      {activeView === 'checklist' ? <Checklist /> : activeView === 'analysis' ? <Analysis /> : <DayView />}
    </div>
  )
}
