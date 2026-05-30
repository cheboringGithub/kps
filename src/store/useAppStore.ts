import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  currentDay: number
  done: Set<number>
  mobileView: 'list' | 'day'
  setCurrentDay: (day: number) => void
  toggleDone: (day: number) => void
  setMobileView: (view: 'list' | 'day') => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentDay: 1,
      done: new Set<number>(),
      mobileView: 'list',

      setCurrentDay: (day) =>
        set({ currentDay: day, mobileView: 'day' }),

      toggleDone: (day) =>
        set((state) => {
          const done = new Set(state.done)
          done.has(day) ? done.delete(day) : done.add(day)
          return { done }
        }),

      setMobileView: (view) => set({ mobileView: view }),
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
