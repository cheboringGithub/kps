import { useAppStore } from './store/useAppStore'
import { Nav } from './components/Nav/Nav'
import { DayView } from './components/DayView/DayView'
import s from './App.module.css'

export function App() {
  const { mobileView } = useAppStore()

  return (
    <div className={[s.shell, mobileView === 'day' ? s.showDay : ''].join(' ')}>
      <Nav />
      <DayView />
    </div>
  )
}
