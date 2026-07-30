import type { GymSet, GymSetLog } from '../store/useGymStore'

/** Один прошлый заход на упражнение: тренировка целиком, а не отдельный подход. */
export interface ExerciseHistoryEntry {
  workout: number
  /** ISO-дата из Supabase; у тренировок, записанных только локально, её нет. */
  date?: string
  sets: GymSet[]
}

/** Кардио-подход: скорость/подъём вместо веса и повторов. */
function isCardioSet(set: GymSet): boolean {
  return set.speedKmh != null || set.incline != null
}

function isEmptySet(set: GymSet): boolean {
  return set.reps == null && set.weightKg == null && set.speedKmh == null && set.incline == null
}

function hasData(sets: GymSet[] | undefined): sets is GymSet[] {
  return !!sets && sets.some((s) => !isEmptySet(s))
}

/** Обрезает пустой хвост — сеты, которые открыли, но не заполнили. */
function trim(sets: GymSet[]): GymSet[] {
  let end = sets.length
  while (end > 0 && isEmptySet(sets[end - 1])) end--
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

/** `20×10` для силового, `19 км/ч · ур. 4` для кардио; прочерк там, где поле пустое. */
export function formatSet(set: GymSet): string {
  if (isCardioSet(set)) {
    const speed = set.speedKmh != null ? `${set.speedKmh} км/ч` : '—'
    const incline = set.incline != null ? `ур. ${set.incline}` : '—'
    return `${speed} · ${incline}`
  }
  const w = set.weightKg != null ? String(set.weightKg) : '—'
  const r = set.reps != null ? String(set.reps) : '—'
  return `${w}×${r}`
}

/**
 * Лучший подход захода — по весу, при равенстве по повторам; у кардио — по
 * скорости, при равенстве по уровню подъёма. Для пилюли в шапке.
 */
export function bestSet(sets: GymSet[]): GymSet | null {
  return sets.reduce<GymSet | null>((best, s) => {
    if (isEmptySet(s)) return best
    if (!best) return s
    if (isCardioSet(s) || isCardioSet(best)) {
      const v = s.speedKmh ?? -1
      const bv = best.speedKmh ?? -1
      if (v !== bv) return v > bv ? s : best
      return (s.incline ?? -1) > (best.incline ?? -1) ? s : best
    }
    const w = s.weightKg ?? -1
    const bw = best.weightKg ?? -1
    if (w !== bw) return w > bw ? s : best
    return (s.reps ?? -1) > (best.reps ?? -1) ? s : best
  }, null)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
