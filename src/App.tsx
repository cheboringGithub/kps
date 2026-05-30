import { useAppStore } from './store/useAppStore'
import { Nav } from './components/Nav/Nav'
import { DayView } from './components/DayView/DayView'
import { Checklist } from './components/Checklist/Checklist'
import s from './App.module.css'

export function App() {
  const { mobileView, activeView } = useAppStore()

  return (
    <div className={[s.shell, mobileView === 'day' || activeView === 'checklist' ? s.showDay : ''].join(' ')}>
      <Nav />
      {activeView === 'checklist' ? <Checklist /> : <DayView />}
    </div>
  )
}
