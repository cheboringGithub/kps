import type { GymSet, GymSetLog } from '../store/useGymStore'

/** Один прошлый заход на упражнение: тренировка целиком, а не отдельный подход. */
export interface ExerciseHistoryEntry {
  workout: number
  /** ISO-дата из Supabase; у тренировок, записанных только локально, её нет. */
  date?: string
  sets: GymSet[]
}

function hasData(sets: GymSet[] | undefined): sets is GymSet[] {
  return !!sets && sets.some((s) => s.reps != null || s.weightKg != null)
}

/** Обрезает пустой хвост — сеты, которые открыли, но не заполнили. */
function trim(sets: GymSet[]): GymSet[] {
  let end = sets.length
  while (end > 0 && sets[end - 1].reps == null && sets[end - 1].weightKg == null) end--
  return sets.slice(0, end)
}

/**
 * Последние `limit` тренировок, где это упражнение реально записывали, от
 * свежих к старым. Источник один — лог из gym_set_log, поднятый в стор.
 */
export function getExerciseHistory(
  log: GymSetLog,
  dates: Record<number, string>,
  exerciseId: string,
  beforeWorkout: number,
  limit = 3,
): ExerciseHistoryEntry[] {
  const out: ExerciseHistoryEntry[] = []
  const workouts = Object.keys(log).map(Number).sort((a, b) => b - a)

  for (const workout of workouts) {
    if (workout >= beforeWorkout) continue
    const sets = log[workout]?.[exerciseId]
    if (!hasData(sets)) continue

    out.push({ workout, date: dates[workout], sets: trim(sets) })
    if (out.length === limit) break
  }
  return out
}

/** `20×10`; прочерк там, где поле оставили пустым. */
export function formatSet(set: GymSet): string {
  const w = set.weightKg != null ? String(set.weightKg) : '—'
  const r = set.reps != null ? String(set.reps) : '—'
  return `${w}×${r}`
}

/** Лучший подход захода — по весу, при равенстве по повторам. Для пилюли в шапке. */
export function bestSet(sets: GymSet[]): GymSet | null {
  return sets.reduce<GymSet | null>((best, s) => {
    if (s.reps == null && s.weightKg == null) return best
    if (!best) return s
    const w = s.weightKg ?? -1
    const bw = best.weightKg ?? -1
    if (w !== bw) return w > bw ? s : best
    return (s.reps ?? -1) > (best.reps ?? -1) ? s : best
  }, null)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
