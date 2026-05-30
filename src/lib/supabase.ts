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
  const res = await req('/checklist_entries', {
    method: 'POST',
    body: JSON.stringify(entry),
  })
  return res.json() as Promise<ChecklistEntry[]>
}

export async function fetchEntries(limit = 10): Promise<ChecklistEntry[]> {
  const res = await req(`/checklist_entries?order=created_at.desc&limit=${limit}`)
  return res.json()
}
