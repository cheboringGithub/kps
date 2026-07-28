import { useState, useEffect, useCallback } from 'react'
import { fetchAnalysis, AnalysisReport } from '../../lib/supabase'
import { useAppStore } from '../../store/useAppStore'
import { MarkdownContent } from '../MarkdownContent/MarkdownContent'
import s from './Analysis.module.css'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function badgeClass(r: AnalysisReport['recommendation']) {
  if (r === 'ok') return s.badgeOk
  if (r === 'warning') return s.badgeWarning
  return s.badgeCritical
}

function badgeLabel(r: AnalysisReport['recommendation']) {
  if (r === 'ok') return '✅ норма'
  if (r === 'warning') return '⚠️ стагнация'
  return '🔴 ухудшение'
}

export function Analysis() {
  const [reports, setReports] = useState<AnalysisReport[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState<string | null>(null)
  // Without this a failed fetch rendered the "no analyses yet" empty state,
  // which reads as "your history is gone" rather than "the network is down".
  const [loadFailed, setLoadFailed] = useState(false)
  const { setActiveView } = useAppStore()

  const load = useCallback(() => {
    setLoading(true)
    setLoadFailed(false)
    fetchAnalysis(20)
      .then(data => { setReports(data); if (data.length > 0) setOpen(data[0].id!) })
      .catch(() => setLoadFailed(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <main className={s.main}>
      <button className={s.backBtn} onClick={() => setActiveView('training')} type="button">← Программа</button>

      <div className={s.header}>
        <div className={s.tag}>История анализов</div>
        <h2 className={s.title}>Прогресс реабилитации</h2>
      </div>

      {loading ? (
        <div className={s.loading}>Загружаю...</div>
      ) : loadFailed ? (
        <div className={s.loadError}>
          Не удалось загрузить анализы — нет связи. История цела.
          <button type="button" className={s.retryBtn} onClick={load}>↻ Повторить</button>
        </div>
      ) : reports.length === 0 ? (
        <div className={s.empty}>Анализов пока нет — первый появится после разбора накопленных записей дневника.</div>
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
