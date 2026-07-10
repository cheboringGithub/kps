import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ActiveView = 'today' | 'training' | 'checklist' | 'analysis'

interface AppState {
  currentDay: number
  done: Set<number>
  activeView: ActiveView
  exerciseDone: Record<number, string[]>
  setCurrentDay: (day: number) => void
  advanceCurrentDayTo: (day: number) => void
  toggleDone: (day: number) => void
  markDone: (day: number) => void
  setActiveView: (view: ActiveView) => void
  toggleExerciseDone: (day: number, key: string) => void
  setExerciseDone: (day: number, key: string, isDone: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentDay: 1,
      done: new Set<number>(),
      activeView: 'today',
      exerciseDone: {},

      setCurrentDay: (day) =>
        set({ currentDay: day, activeView: 'today' }),

      // Catches up the pointer to remote progress (e.g. entries synced from another
      // device) without forcing a tab switch — unlike setCurrentDay, this only moves
      // the pointer forward, never back, and never touches activeView.
      advanceCurrentDayTo: (day) =>
        set((state) => (day > state.currentDay ? { currentDay: day } : state)),

      toggleDone: (day) =>
        set((state) => {
          const done = new Set(state.done)
          done.has(day) ? done.delete(day) : done.add(day)
          return { done }
        }),

      markDone: (day) =>
        set((state) => {
          if (state.done.has(day)) return state
          const done = new Set(state.done)
          done.add(day)
          return { done }
        }),

      setActiveView: (view) => set({ activeView: view }),

      toggleExerciseDone: (day, key) =>
        set((state) => {
          const forDay = state.exerciseDone[day] ?? []
          const nextForDay = forDay.includes(key) ? forDay.filter((k) => k !== key) : [...forDay, key]
          return { exerciseDone: { ...state.exerciseDone, [day]: nextForDay } }
        }),

      setExerciseDone: (day, key, isDone) =>
        set((state) => {
          const forDay = state.exerciseDone[day] ?? []
          const has = forDay.includes(key)
          if (isDone === has) return state
          const nextForDay = isDone ? [...forDay, key] : forDay.filter((k) => k !== key)
          return { exerciseDone: { ...state.exerciseDone, [day]: nextForDay } }
        }),
    }),
    {
      name: 'kps-store',
      partialize: (state) => ({ currentDay: state.currentDay, done: [...state.done], exerciseDone: state.exerciseDone }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as object),
        done: new Set((persisted as { done?: number[] }).done ?? []),
        exerciseDone: (persisted as { exerciseDone?: Record<number, string[]> }).exerciseDone ?? {},
      }),
    },
  ),
)
