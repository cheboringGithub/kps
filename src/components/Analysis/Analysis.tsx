import { useState, useEffect } from 'react'
import { fetchAnalysis, AnalysisReport } from '../../lib/supabase'
import { useAppStore } from '../../store/useAppStore'
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

function MarkdownContent({ text }: { text: string }) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i}>{line.slice(2)}</h1>)
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i}>{line.slice(3)}</h2>)
    } else if (line.trim() === '---') {
      elements.push(<hr key={i} />)
    } else if (line.trim() === '') {
      // skip blank lines
    } else {
      const html = line
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/^- /, '• ')
      elements.push(<p key={i} dangerouslySetInnerHTML={{ __html: html }} />)
    }
  }

  return <div className={s.reportBody}>{elements}</div>
}

export function Analysis() {
  const [reports, setReports] = useState<AnalysisReport[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState<string | null>(null)
  const { setActiveView } = useAppStore()

  useEffect(() => {
    fetchAnalysis(20)
      .then(data => { setReports(data); if (data.length > 0) setOpen(data[0].id!) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className={s.main}>
      <button className={s.backBtn} onClick={() => setActiveView('training')} type="button">← Программа</button>

      <div className={s.header}>
        <div className={s.tag}>История анализов</div>
        <h2 className={s.title}>Прогресс реабилитации</h2>
      </div>

      {loading ? (
        <div className={s.loading}>Загружаю...</div>
      ) : reports.length === 0 ? (
        <div className={s.empty}>Анализов пока нет. Запусти <strong>/analyze-results</strong> после нескольких тренировок.</div>
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
