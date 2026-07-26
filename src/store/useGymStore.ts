import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { onSyncStateChange, queueSetWrite, type SyncState } from '../lib/gymSetLog'

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
  /** Зеркало таблицы gym_set_log — наполняется из базы при входе в раздел зала. */
  setLog: GymSetLog
  /** Тренировка → дата, когда её записывали (max performed_at по строкам лога). */
  workoutDates: Record<number, string>
  /** Загрузился ли лог из базы: до этого поля ввода пустые не потому, что их не заполняли. */
  logLoaded: boolean
  /** Состояние отправки подходов: сохраняем / есть неотправленное. */
  syncState: SyncState
  hydrateSetLog: (log: GymSetLog, dates: Record<number, string>) => void
  setSyncState: (state: SyncState) => void
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
      workoutDates: {},
      logLoaded: false,
      syncState: 'idle',

      hydrateSetLog: (log, dates) => set({ setLog: log, workoutDates: dates, logLoaded: true }),

      setSyncState: (syncState) => set({ syncState }),

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
          queueSetWrite(workout, exerciseId, setIndex, nextSets[setIndex])
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
      // setLog здесь намеренно нет: подходы живут в gym_set_log, локально
      // остаётся только указатель на текущую тренировку и отметки о завершении.
      partialize: (state) => ({
        currentWorkout: state.currentWorkout,
        done: [...state.done],
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as object),
        done: new Set((persisted as { done?: number[] }).done ?? []),
      }),
    },
  ),
)

// Очередь отправки живёт в lib и ничего не знает о сторе — связываем их здесь.
onSyncStateChange((state) => useGymStore.setState({ syncState: state }))
