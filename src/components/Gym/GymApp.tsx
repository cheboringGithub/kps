import { useEffect, useRef } from 'react'
import { useGymStore } from '../../store/useGymStore'
import { useAppStore } from '../../store/useAppStore'
import { applyPendingSets, fetchSetLog, flushNow, flushPendingSets } from '../../lib/gymSetLog'
import { GymNav } from './GymNav'
import { GymWorkoutView } from './GymWorkoutView'
import { GymProgram } from './GymProgram'
import { GymChecklist } from './GymChecklist'
import { GymAnalysis } from './GymAnalysis'
import s from '../../App.module.css'

export function GymApp() {
  const activeView = useGymStore((st) => st.activeView)
  const hydrateSetLog = useGymStore((st) => st.hydrateSetLog)
  const setActiveProgram = useAppStore((st) => st.setActiveProgram)

  // Подходы живут в gym_set_log — поднимаем их при входе в раздел и накрываем
  // тем, что ещё не успело уехать из очереди отправки.
  useEffect(() => {
    let cancelled = false
    fetchSetLog()
      .then(({ log, dates }) => {
        if (cancelled) return
        hydrateSetLog(applyPendingSets(log), dates)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [hydrateSetLog])

  // Дозапись всего, что не ушло: при возврате сети и при сворачивании вкладки.
  useEffect(() => {
    const retry = () => void flushPendingSets()
    const onHide = () => { if (document.visibilityState === 'hidden') flushNow() }
    window.addEventListener('online', retry)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      window.removeEventListener('online', retry)
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [])

  // Minimal history handling for the gym shell: one pushState on entry so the
  // Android back button exits to the program-select screen instead of closing
  // the app. Unlike the KPS shell we don't replicate a full per-tab history
  // stack here — first version of the gym program, kept intentionally simple.
  const pushedRef = useRef(false)
  useEffect(() => {
    if (!pushedRef.current) {
      pushedRef.current = true
      window.history.pushState({ gym: true }, '')
    }
    const onPopState = () => setActiveProgram(null)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [setActiveProgram])

  return (
    <div className={s.shell}>
      <GymNav />
      <div className={s.content}>
        {activeView === 'checklist' ? <GymChecklist />
          : activeView === 'analysis' ? <GymAnalysis />
          : activeView === 'program' ? <GymProgram />
          : <GymWorkoutView />}
      </div>
    </div>
  )
}
