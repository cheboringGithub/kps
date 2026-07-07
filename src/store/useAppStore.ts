import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ActiveView = 'today' | 'training' | 'checklist' | 'analysis'

interface AppState {
  currentDay: number
  done: Set<number>
  activeView: ActiveView
  setCurrentDay: (day: number) => void
  toggleDone: (day: number) => void
  setActiveView: (view: ActiveView) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentDay: 1,
      done: new Set<number>(),
      activeView: 'today',

      setCurrentDay: (day) =>
        set({ currentDay: day, activeView: 'today' }),

      toggleDone: (day) =>
        set((state) => {
          const done = new Set(state.done)
          done.has(day) ? done.delete(day) : done.add(day)
          return { done }
        }),

      setActiveView: (view) => set({ activeView: view }),
    }),
    {
      name: 'kps-store',
      partialize: (state) => ({ currentDay: state.currentDay, done: [...state.done] }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as object),
        done: new Set((persisted as { done?: number[] }).done ?? []),
      }),
    },
  ),
)
