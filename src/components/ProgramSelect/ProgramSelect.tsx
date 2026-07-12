import { useAppStore } from '../../store/useAppStore'
import s from './ProgramSelect.module.css'

export function ProgramSelect() {
  const setActiveProgram = useAppStore((st) => st.setActiveProgram)

  return (
    <div className={s.screen}>
      <div className={s.tag}>Выбор программы</div>
      <h1 className={s.title}>КПС &<br /><em>Подвижность</em></h1>
      <div className={s.cards}>
        <button type="button" className={s.card} onClick={() => setActiveProgram('kps')}>
          <div className={s.cardLabel}>КПС</div>
          <div className={s.cardSub}>Домашняя реабилитация таза, кор и постуральная коррекция — 90-дневный курс</div>
        </button>
        <button type="button" className={s.card} onClick={() => setActiveProgram('gym')}>
          <div className={s.cardLabel}>Зал</div>
          <div className={s.cardSub}>Силовая тренировка в зале — мобильность, сила, мышечная масса</div>
        </button>
      </div>
    </div>
  )
}
