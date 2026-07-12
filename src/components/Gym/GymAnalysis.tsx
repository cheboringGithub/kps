import { useState, useEffect } from 'react'
import { fetchGymAnalysis, type GymAnalysisReport } from '../../lib/gymSupabase'
import { useGymStore } from '../../store/useGymStore'
import { MarkdownContent } from '../MarkdownContent/MarkdownContent'
import s from '../Analysis/Analysis.module.css'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function badgeClass(r: GymAnalysisReport['recommendation']) {
  if (r === 'ok') return s.badgeOk
  if (r === 'warning') return s.badgeWarning
  return s.badgeCritical
}

function badgeLabel(r: GymAnalysisReport['recommendation']) {
  if (r === 'ok') return '✅ норма'
  if (r === 'warning') return '⚠️ внимание'
  return '🔴 колено/перегруз'
}

export function GymAnalysis() {
  const [reports, setReports] = useState<GymAnalysisReport[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState<string | null>(null)
  const setActiveView = useGymStore((st) => st.setActiveView)

  useEffect(() => {
    fetchGymAnalysis(20)
      .then(data => { setReports(data); if (data.length > 0) setOpen(data[0].id!) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className={s.main}>
      <button className={s.backBtn} onClick={() => setActiveView('program')} type="button">← Программа</button>

      <div className={s.header}>
        <div className={s.tag}>История анализов</div>
        <h2 className={s.title}>Прогресс силовой программы</h2>
      </div>

      {loading ? (
        <div className={s.loading}>Загружаю...</div>
      ) : reports.length === 0 ? (
        <div className={s.empty}>Анализов пока нет. Запусти <strong>/gym-analyze-results</strong> после нескольких тренировок.</div>
      ) : (
        <div className={s.list}>
          {reports.map(r => (
            <div key={r.id} className={s.report}>
              <div className={s.reportHeader} onClick={() => setOpen(open === r.id ? null : r.id!)}>
                <span className={s.reportDate}>{formatDate(r.created_at!)}</span>
                <div className={s.reportMeta}>
                  <span className={[s.badge, badgeClass(r.recommendation)].join(' ')}>
                    {badgeLabel(r.recommendation)}
                  </span>
                  <span className={[s.chevron, open === r.id ? s.chevronOpen : ''].join(' ')}>▼</span>
                </div>
              </div>
              {open === r.id && <MarkdownContent text={r.content} />}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
