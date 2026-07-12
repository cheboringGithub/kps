import s from './MarkdownContent.module.css'

export function MarkdownContent({ text }: { text: string }) {
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
