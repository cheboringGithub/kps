import { req } from './supabase'
import { GYM_EX } from '../data/gym/exercises'

export interface GymSetLogEntry {
  exercise_id: string
  set_index: number
  reps: number | null
  weight_kg: number | null
}

export type GymRpe = 'Легко' | 'Норм' | 'Тяжело' | 'Предел'

export interface GymEntry {
  id?: string
  created_at?: string
  workout_number: number
  rpe: GymRpe
  knee_pain: number
  sets: GymSetLogEntry[]
  comment?: string
}

export async function insertGymEntry(entry: Omit<GymEntry, 'id' | 'created_at'>) {
  try {
    const res = await req('/gym_entries', {
      method: 'POST',
      body: JSON.stringify(entry),
    })
    return res.json() as Promise<GymEntry[]>
  } catch (err) {
    // Fallback: column 'comment' may not exist yet — retry without it
    if (entry.comment !== undefined && String(err).includes('comment')) {
      const { comment: _, ...withoutComment } = entry
      const res = await req('/gym_entries', {
        method: 'POST',
        body: JSON.stringify(withoutComment),
      })
      return res.json() as Promise<GymEntry[]>
    }
    throw err
  }
}

export async function fetchGymEntries(limit = 10): Promise<GymEntry[]> {
  const res = await req(`/gym_entries?order=created_at.desc&limit=${limit}`)
  return res.json()
}

export async function fetchGymEntriesByWorkout(workoutNumber: number): Promise<GymEntry[]> {
  const res = await req(`/gym_entries?workout_number=eq.${workoutNumber}&order=created_at.desc`)
  return res.json()
}

export interface GymAnalysisReport {
  id?: string
  created_at?: string
  report_date: string
  entries_count: number
  period_start: string
  period_end: string
  content: string
  recommendation: 'ok' | 'warning' | 'critical'
}

export async function insertGymAnalysis(report: Omit<GymAnalysisReport, 'id' | 'created_at'>) {
  const res = await req('/gym_analysis_reports', {
    method: 'POST',
    body: JSON.stringify(report),
  })
  return res.json() as Promise<GymAnalysisReport[]>
}

export async function fetchGymAnalysis(limit = 10): Promise<GymAnalysisReport[]> {
  const res = await req(`/gym_analysis_reports?order=created_at.desc&limit=${limit}`)
  return res.json()
}

// ── Rule-based analysis generator ──────────────────────────────────────────

const RPE_LABEL: Record<GymRpe, string> = {
  'Легко': 'легко, есть большой запас',
  'Норм': 'норм, рабочая нагрузка',
  'Тяжело': 'тяжело, близко к отказу',
  'Предел': 'предел, отказ',
}
const KNEE_LABEL: Record<number, string> = {
  0: 'не беспокоит',
  1: 'лёгкое натяжение',
  2: 'тянет ощутимо',
}

function interpretGymEntry(e: Omit<GymEntry, 'id' | 'created_at'>): {
  content: string
  recommendation: GymAnalysisReport['recommendation']
} {
  const { workout_number, rpe, knee_pain, sets, comment } = e

  let recommendation: GymAnalysisReport['recommendation'] = 'ok'
  if (knee_pain >= 2) {
    recommendation = 'critical'
  } else if (rpe === 'Предел' || knee_pain === 1) {
    recommendation = 'warning'
  }

  const byExercise = new Map<string, GymSetLogEntry[]>()
  for (const s of sets) {
    if (!byExercise.has(s.exercise_id)) byExercise.set(s.exercise_id, [])
    byExercise.get(s.exercise_id)!.push(s)
  }

  const today = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  let content = `## Тренировка ${workout_number}\n`
  content += `${today}\n\n`
  content += `**RPE**: ${rpe} — ${RPE_LABEL[rpe]}\n`
  content += `**Левое колено**: ${KNEE_LABEL[knee_pain] ?? '—'}\n\n`
  content += `---\n\n`

  for (const [exerciseId, exSets] of byExercise) {
    const name = GYM_EX[exerciseId]?.name ?? exerciseId
    const logged = exSets
      .sort((a, b) => a.set_index - b.set_index)
      .map(s => (s.reps != null && s.weight_kg != null ? `${s.weight_kg}кг×${s.reps}` : '—'))
      .join(', ')
    content += `**${name}**: ${logged}\n`
  }

  content += '\n'

  if (knee_pain >= 2) {
    content += 'Колено тянет ощутимо — на ближайших тренировках замени рискованные упражнения нижней части тела на safe-варианты и запусти /gym-adjust-program.\n\n'
  } else if (knee_pain === 1) {
    content += 'Лёгкое натяжение в колене — следи за динамикой, амплитуду в тренажёрах не увеличивай.\n\n'
  } else {
    content += 'Колено не беспокоит.\n\n'
  }

  if (rpe === 'Предел') {
    content += 'RPE на пределе — в следующий раз по этим упражнениям не повышай нагрузку, дай организму восстановиться.\n'
  } else if (rpe === 'Легко') {
    content += 'RPE низкий — есть запас для прогрессии веса или повторов в следующий раз.\n'
  } else {
    content += 'RPE в рабочем диапазоне — можно продолжать плановую прогрессию.\n'
  }

  if (comment && comment.trim()) {
    content += `\n---\n\n**Комментарий**: ${comment.trim()}\n`
  }

  return { content, recommendation }
}

export async function saveGymEntryWithAnalysis(
  entry: Omit<GymEntry, 'id' | 'created_at'>,
) {
  await insertGymEntry(entry)

  const today = new Date().toISOString().slice(0, 10)
  const { content, recommendation } = interpretGymEntry(entry)

  await insertGymAnalysis({
    report_date: today,
    entries_count: 1,
    period_start: today,
    period_end: today,
    content,
    recommendation,
  })
}
