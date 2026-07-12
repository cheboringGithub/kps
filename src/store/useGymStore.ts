import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type GymActiveView = 'workout' | 'program' | 'checklist' | 'analysis'

export const GYM_VIEW_ORDER: GymActiveView[] = ['workout', 'program', 'checklist', 'analysis']

export interface GymSet {
  reps: number | null
  weightKg: number | null
}

// тренировка → упражнение → массив подходов (индекс = номер подхода)
export type GymSetLog = Record<number, Record<string, GymSet[]>>

interface GymState {
  currentWorkout: number
  done: Set<number>
  activeView: GymActiveView
  setLog: GymSetLog
  setCurrentWorkout: (workout: number) => void
  advanceCurrentWorkoutTo: (workout: number) => void
  toggleDone: (workout: number) => void
  markDone: (workout: number) => void
  setActiveView: (view: GymActiveView) => void
  setSetValue: (
    workout: number,
    exerciseId: string,
    setIndex: number,
    field: keyof GymSet,
    value: number | null,
  ) => void
}

function padSets(sets: GymSet[], length: number): GymSet[] {
  if (sets.length >= length) return sets
  return [...sets, ...Array.from({ length: length - sets.length }, () => ({ reps: null, weightKg: null }))]
}

export const useGymStore = create<GymState>()(
  persist(
    (set) => ({
      currentWorkout: 1,
      done: new Set<number>(),
      activeView: 'workout',
      setLog: {},

      setCurrentWorkout: (workout) => set({ currentWorkout: workout, activeView: 'workout' }),

      advanceCurrentWorkoutTo: (workout) =>
        set((state) => (workout > state.currentWorkout ? { currentWorkout: workout } : state)),

      toggleDone: (workout) =>
        set((state) => {
          const done = new Set(state.done)
          done.has(workout) ? done.delete(workout) : done.add(workout)
          return { done }
        }),

      markDone: (workout) =>
        set((state) => {
          if (state.done.has(workout)) return state
          const done = new Set(state.done)
          done.add(workout)
          return { done }
        }),

      setActiveView: (view) => set({ activeView: view }),

      setSetValue: (workout, exerciseId, setIndex, field, value) =>
        set((state) => {
          const forWorkout = state.setLog[workout] ?? {}
          const forExercise = padSets(forWorkout[exerciseId] ?? [], setIndex + 1)
          const nextSets = forExercise.map((s, i) => (i === setIndex ? { ...s, [field]: value } : s))
          return {
            setLog: {
              ...state.setLog,
              [workout]: { ...forWorkout, [exerciseId]: nextSets },
            },
          }
        }),
    }),
    {
      name: 'gym-store',
      partialize: (state) => ({
        currentWorkout: state.currentWorkout,
        done: [...state.done],
        setLog: state.setLog,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as object),
        done: new Set((persisted as { done?: number[] }).done ?? []),
        setLog: (persisted as { setLog?: GymSetLog }).setLog ?? {},
      }),
    },
  ),
)
