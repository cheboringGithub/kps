import { useAppStore } from '../../store/useAppStore'
import s from './GymPlaceholder.module.css'

export function GymPlaceholder() {
  const setActiveProgram = useAppStore((st) => st.setActiveProgram)

  return (
    <div className={s.screen}>
      <div className={s.tag}>Зал</div>
      <h1 className={s.title}>Программа в разработке</h1>
      <p className={s.sub}>
        Здесь появится силовая программа для зала: мобильность, сила, мышечная масса —
        3 тренировки в неделю по 60–90 минут.
      </p>
      <button type="button" className={s.back} onClick={() => setActiveProgram(null)}>
        ← К выбору программы
      </button>
    </div>
  )
}
