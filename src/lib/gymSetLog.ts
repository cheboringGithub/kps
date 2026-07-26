import { req } from './supabase'
import type { GymSet, GymSetLog } from '../store/useGymStore'

export interface GymSetLogRow {
  workout_number: number
  exercise_id: string
  set_index: number
  reps: number | null
  weight_kg: number | null
  performed_at?: string
}

export type SyncState = 'idle' | 'saving' | 'pending'

/**
 * Подход пишется в базу сразу при вводе, но в зале связь рвётся, поэтому между
 * инпутом и Supabase стоит очередь: неотправленное копится в localStorage и
 * доезжает при следующем вводе или при возврате сети. Это не второй источник
 * правды — читаем всегда из базы, здесь лежат только неподтверждённые записи.
 */
const QUEUE_KEY = 'gym-pending-sets'
const DEBOUNCE_MS = 800

type Queue = Record<string, GymSetLogRow>

let queue: Queue = loadQueue()
let timer: ReturnType<typeof setTimeout> | null = null
let flushing = false
let listener: ((state: SyncState) => void) | null = null

function loadQueue(): Queue {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '{}') as Queue
  } catch {
    return {}
  }
}

function saveQueue() {
  try {
    if (Object.keys(queue).length === 0) localStorage.removeItem(QUEUE_KEY)
    else localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  } catch { /* приватный режим / переполнение — очередь останется только в памяти */ }
}

function emit() {
  if (!listener) return
  listener(flushing ? 'saving' : Object.keys(queue).length > 0 ? 'pending' : 'idle')
}

export function onSyncStateChange(fn: (state: SyncState) => void) {
  listener = fn
  emit()
}

function rowKey(workout: number, exerciseId: string, setIndex: number) {
  return `${workout}:${exerciseId}:${setIndex}`
}

/** Upsert по (workout_number, exercise_id, set_index) — PostgREST merge-duplicates. */
async function upsertRows(rows: GymSetLogRow[]) {
  await req('/gym_set_log?on_conflict=workout_number,exercise_id,set_index', {
    method: 'POST',
    headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  })
}

export async function flushPendingSets(): Promise<void> {
  if (flushing) return
  const batch = Object.entries(queue)
  if (batch.length === 0) return

  flushing = true
  emit()
  try {
    await upsertRows(batch.map(([, row]) => row))
    // Снимаем с очереди только то, что реально отправили: за время запроса
    // пользователь мог перебить те же поля новым значением.
    for (const [key, row] of batch) {
      if (queue[key] === row) delete queue[key]
    }
    saveQueue()
  } catch {
    // Остаётся в очереди — уедет при следующем вводе или по событию online.
  } finally {
    flushing = false
    emit()
  }
}

export function queueSetWrite(
  workout: number,
  exerciseId: string,
  setIndex: number,
  set: GymSet,
) {
  queue[rowKey(workout, exerciseId, setIndex)] = {
    workout_number: workout,
    exercise_id: exerciseId,
    set_index: setIndex,
    reps: set.reps,
    weight_kg: set.weightKg,
  }
  saveQueue()
  emit()

  if (timer) clearTimeout(timer)
  timer = setTimeout(() => { timer = null; void flushPendingSets() }, DEBOUNCE_MS)
}

/** Немедленная отправка — на blur поля и при уходе со страницы. */
export function flushNow() {
  if (timer) { clearTimeout(timer); timer = null }
  void flushPendingSets()
}

/** Весь лог подходов из базы: тренировка → упражнение → подходы + даты тренировок. */
export async function fetchSetLog(): Promise<{
  log: GymSetLog
  dates: Record<number, string>
}> {
  const res = await req(
    '/gym_set_log?select=workout_number,exercise_id,set_index,reps,weight_kg,performed_at' +
    '&order=workout_number.asc,exercise_id.asc,set_index.asc',
  )
  const rows = (await res.json()) as GymSetLogRow[]

  const log: GymSetLog = {}
  const dates: Record<number, string> = {}

  for (const r of rows) {
    const forWorkout = log[r.workout_number] ?? (log[r.workout_number] = {})
    const sets = forWorkout[r.exercise_id] ?? (forWorkout[r.exercise_id] = [])
    while (sets.length <= r.set_index) sets.push({ reps: null, weightKg: null })
    sets[r.set_index] = { reps: r.reps, weightKg: r.weight_kg }
    if (r.performed_at && (!dates[r.workout_number] || r.performed_at > dates[r.workout_number])) {
      dates[r.workout_number] = r.performed_at
    }
  }

  return { log, dates }
}

/** Неотправленные значения поверх свежих данных из базы. */
export function applyPendingSets(log: GymSetLog): GymSetLog {
  for (const row of Object.values(queue)) {
    const forWorkout = log[row.workout_number] ?? (log[row.workout_number] = {})
    const sets = forWorkout[row.exercise_id] ?? (forWorkout[row.exercise_id] = [])
    while (sets.length <= row.set_index) sets.push({ reps: null, weightKg: null })
    sets[row.set_index] = { reps: row.reps, weightKg: row.weight_kg }
  }
  return log
}
