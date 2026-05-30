const SUPABASE_URL = 'https://xfhduoighyjlxstvqhkc.supabase.co'
const SUPABASE_KEY = 'sb_publishable_ICqU5UrY5_Cr7EQX5OotbA_E6kpv1VP'

export interface ChecklistEntry {
  id?: string
  created_at?: string
  day_number: number
  back_pain: number
  kps_feeling: number
  left_knee: number
  sitting_symmetry: string
  comment?: string
}

async function req(path: string, options?: RequestInit) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...(options?.headers ?? {}),
    },
  })
  if (!res.ok) throw new Error(await res.text())
  return res
}

export async function insertEntry(entry: Omit<ChecklistEntry, 'id' | 'created_at'>) {
  try {
    const res = await req('/checklist_entries', {
      method: 'POST',
      body: JSON.stringify(entry),
    })
    return res.json() as Promise<ChecklistEntry[]>
  } catch (err) {
    // Fallback: column 'comment' may not exist yet — retry without it
    if (entry.comment !== undefined && String(err).includes('comment')) {
      const { comment: _, ...withoutComment } = entry
      const res = await req('/checklist_entries', {
        method: 'POST',
        body: JSON.stringify(withoutComment),
      })
      return res.json() as Promise<ChecklistEntry[]>
    }
    throw err
  }
}

export async function fetchEntries(limit = 10): Promise<ChecklistEntry[]> {
  const res = await req(`/checklist_entries?order=created_at.desc&limit=${limit}`)
  return res.json()
}

export interface AnalysisReport {
  id?: string
  created_at?: string
  report_date: string
  entries_count: number
  period_start: string
  period_end: string
  content: string
  recommendation: 'ok' | 'warning' | 'critical'
}

export async function insertAnalysis(report: Omit<AnalysisReport, 'id' | 'created_at'>) {
  const res = await req('/analysis_reports', {
    method: 'POST',
    body: JSON.stringify(report),
  })
  return res.json() as Promise<AnalysisReport[]>
}

export async function fetchAnalysis(limit = 10): Promise<AnalysisReport[]> {
  const res = await req(`/analysis_reports?order=created_at.desc&limit=${limit}`)
  return res.json()
}

// ── Rule-based analysis generator ──────────────────────────────────────────

const BACK_PAIN_LABEL: Record<number, string> = {
  0: 'нет боли',
  1: 'лёгкий дискомфорт',
  2: 'умеренная боль',
  3: 'острая боль',
}
const KPS_LABEL: Record<number, string> = {
  1: 'зажат, не отпускает',
  2: 'чуть свободнее',
  3: 'заметно открылся',
}
const KNEE_LABEL: Record<number, string> = {
  0: 'не беспокоит',
  1: 'лёгкое натяжение',
  2: 'тянет ощутимо',
}

function interpretEntry(e: Omit<ChecklistEntry, 'id' | 'created_at'>): {
  content: string
  recommendation: AnalysisReport['recommendation']
} {
  const { day_number, back_pain, kps_feeling, left_knee, sitting_symmetry, comment } = e

  // derive recommendation
  let recommendation: AnalysisReport['recommendation'] = 'ok'
  if (back_pain >= 3 || (kps_feeling === 1 && left_knee >= 2)) {
    recommendation = 'critical'
  } else if (back_pain >= 2 || kps_feeling === 1 || left_knee >= 2) {
    recommendation = 'warning'
  }

  // KPS interpretation
  const kpsText =
    kps_feeling === 3
      ? 'Левый КПС хорошо реагирует на тракцию — суставная щель раскрывается, компрессия снижается.'
      : kps_feeling === 2
        ? 'Левый КПС немного освобождается при тракции, но ещё держит зажим. Продолжай приоритизировать ротационные и тракционные упражнения.'
        : 'Левый КПС по-прежнему жёстко зажат. Возможна реактивная защита мышц. На следующей тренировке сократи объём осевой нагрузки.'

  // back pain interpretation
  const backText =
    back_pain === 0
      ? 'Поясница без боли — утренняя реактивность снижается.'
      : back_pain === 1
        ? 'Лёгкий утренний дискомфорт в пояснице — ожидаемо при активном КПС-протоколе, следи за динамикой.'
        : back_pain === 2
          ? 'Умеренная боль в пояснице. Исключи наклоны вперёд стоя до стихания. Проверь, нет ли перегрузки разгибателей.'
          : 'Острая боль. Осевую нагрузку снять полностью. Только горизонтальные тракционные упражнения лёжа.'

  // knee interpretation
  const kneeText =
    left_knee === 0
      ? 'Левое колено спокойно — ИТ-тяж и задняя поверхность не перегружены.'
      : left_knee === 1
        ? 'Лёгкое натяжение в левом колене. Вероятна компенсация через ИТ-тяж — добавь раскатку боковой поверхности бедра.'
        : 'Ощутимое натяжение в колене. Уменьши беговую нагрузку, усиль работу с левой средней ягодичной, чтобы снять нагрузку с ИТ-тяжа.'

  // symmetry interpretation
  const symmText =
    sitting_symmetry === 'примерно ровно'
      ? 'Симметрия при сидении улучшилась — левая седалищная кость меньше перегружена.'
      : sitting_symmetry === 'чуть меньше'
        ? 'Асимметрия при сидении чуть сглаживается — КПС-протокол работает.'
        : 'Левая седалищная кость всё ещё давит сильнее. Продолжай приоритизировать левый КПС.'

  const today = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  let content = `## День ${day_number} — промежуточный результат\n`
  content += `${today}\n\n`
  content += `**Поясница**: ${BACK_PAIN_LABEL[back_pain]}\n`
  content += `**Левый КПС**: ${KPS_LABEL[kps_feeling]}\n`
  content += `**Левое колено**: ${KNEE_LABEL[left_knee]}\n`
  content += `**Симметрия при сидении**: ${sitting_symmetry}\n\n`
  content += `---\n\n`
  content += `${kpsText}\n\n`
  content += `${backText}\n\n`
  content += `${kneeText}\n\n`
  content += `${symmText}\n`

  if (comment && comment.trim()) {
    content += `\n---\n\n**Твой комментарий**: ${comment.trim()}\n`
  }

  return { content, recommendation }
}

export async function saveEntryWithAnalysis(
  entry: Omit<ChecklistEntry, 'id' | 'created_at'>,
) {
  await insertEntry(entry)

  const today = new Date().toISOString().slice(0, 10)
  const { content, recommendation } = interpretEntry(entry)

  await insertAnalysis({
    report_date: today,
    entries_count: 1,
    period_start: today,
    period_end: today,
    content,
    recommendation,
  })
}
