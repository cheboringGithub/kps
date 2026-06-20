import type { Day } from './types'

export const START_DATE = new Date(2026, 4, 29) // May 29, 2026

export function getDayDate(d: number): string {
  const date = new Date(START_DATE)
  date.setDate(START_DATE.getDate() + d - 1)
  return date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' })
}

export const DAYS: Day[] = [
  // ── ФАЗА 1: Недели 1–2 ──
  { phase: 1, title: 'Первый контакт', short: 'Декомпрессия КПС',
    desc: 'Начинаем мягко. Тело знакомится с КПС — учимся его чувствовать и расслаблять. Без боли, только тепло и первое облегчение.',
    exs: ['warmup_knee', 'kps_decomp', 'kps_traction', 'figure4', 'side_lying_stretch', 'kps_clock', 'child_pose'] },

  { phase: 1, title: 'Тракция и боковая цепь', short: 'КПС + боковое бедро',
    desc: 'Добавляем поочерёдную тракцию КПС и первую работу с боковой поверхностью бедра — там, где болит из-за перекоса.',
    exs: ['warmup_march', 'kps_traction', 'it_side_lying', 'kps_clock', 'glute_clamshell', 'figure4', 'foot_peroneal', 'foot_eversion', 'foot_short', 'child_pose'] },

  { phase: 1, title: 'Сгибатели бедра', short: 'Подвздошно-поясничная',
    desc: 'Впервые тянем подвздошно-поясничную — главного зажимателя КПС. Без форсирования.',
    exs: ['warmup_knee', 'kps_decomp', 'il_lunge', 'figure4', 'side_lying_stretch', 'kps_clock', 'foot_peroneal', 'foot_eversion', 'foot_short', 'child_pose'] },

  { phase: 1, title: 'День отдыха КПС', short: 'Лёгкая активация',
    desc: 'Мягкий день. Только декомпрессия и активация средней ягодичной — без нагрузки. Даём КПС адаптироваться.',
    exs: ['warmup_knee', 'kps_traction', 'glute_clamshell', 'glute_side_lying', 'kps_clock', 'foot_peroneal', 'foot_eversion', 'foot_short', 'side_lying_stretch', 'savasana'] },

  { phase: 1, title: 'Задняя поверхность', short: 'Хамстринги + КПС',
    desc: 'Добавляем первую работу на заднюю поверхность бёдер. КПС уже чуть свободнее — сейчас наклон пойдёт легче.',
    exs: ['warmup_march', 'kps_decomp', 'hamstring_standing', 'figure4', 'glute_clamshell', 'kps_clock', 'foot_peroneal', 'foot_eversion', 'foot_short', 'child_pose'] },

  { phase: 1, title: 'Мост и декомпрессия', short: 'Мост + КПС',
    desc: 'Вводим мост — медленное позвонок за позвонком движение. В нижней точке КПС расслабляется. Финал недели.',
    exs: ['warmup_knee', 'kps_bridge', 'kps_decomp', 'figure4', 'it_side_lying', 'kps_clock', 'foot_peroneal', 'foot_eversion', 'foot_short', 'child_wide'] },

  { phase: 1, title: 'Полный цикл недели 1', short: 'Повторение базы',
    desc: 'Прогоняем полный набор первой недели с чуть большим временем удержания. Тело запоминает.',
    exs: ['warmup_march', 'kps_traction', 'il_lunge', 'figure4', 'side_lying_stretch', 'glute_clamshell', 'foot_peroneal', 'foot_eversion', 'foot_short', 'savasana'] },

  // Дни 8–14: добавляем мёртвый жук и птицу-собаку — безопасный кор без нагрузки на колено
  { phase: 1, title: 'Углубление КПС', short: 'КПС × 3 упражнения',
    desc: 'Три упражнения на КПС подряд. Суставная цепочка. Добавляем растяжку квадратной мышцы поясницы.',
    exs: ['warmup_knee', 'kps_decomp', 'kps_traction', 'figure4', 'glute_side_lying', 'kps_clock', 'ql_stretch', 'foot_peroneal', 'foot_eversion', 'foot_short', 'strength_dead_bug', 'child_pose'] },

  { phase: 1, title: 'Сгибатели + мост', short: 'ПП-мышца + мост',
    desc: 'Подвздошно-поясничная и мост в связке — так работают в физиотерапии при дисфункции КПС.',
    exs: ['warmup_march', 'il_lunge', 'kps_bridge', 'kps_decomp', 'figure4', 'side_lying_stretch', 'foot_peroneal', 'foot_eversion', 'foot_short', 'strength_dead_bug', 'savasana'] },

  { phase: 1, title: 'Боковая цепь + КМП', short: 'Межрёберные + КМП',
    desc: 'Полный день на боковую цепь. Добавляем прицельную растяжку квадратной мышцы поясницы.',
    exs: ['warmup_knee', 'kps_decomp', 'side_lying_stretch', 'ql_stretch', 'it_side_lying', 'glute_clamshell', 'kps_clock', 'foot_peroneal', 'foot_eversion', 'foot_short', 'strength_bird_dog', 'child_pose'] },

  { phase: 1, title: 'Хамстринги — шаг вперёд', short: 'Задняя поверхность',
    desc: 'Добавляем наклон сидя — новый угол. Цель на эту неделю: пальцы до середины голени.',
    exs: ['warmup_march', 'kps_traction', 'hamstring_standing', 'hamstring_seated', 'figure4', 'kps_clock', 'foot_peroneal', 'foot_eversion', 'foot_short', 'strength_bird_dog', 'child_pose'] },

  { phase: 1, title: '90/90 — дебют', short: 'КПС × 90/90',
    desc: 'Вводим упражнение 90/90 — одно из сильнейших для КПС. В первый раз мягко, без давления.',
    exs: ['warmup_knee', 'kps_decomp', 'kps_90_90', 'figure4', 'glute_side_lying', 'kps_clock', 'foot_peroneal', 'foot_eversion', 'foot_short', 'strength_dead_bug', 'child_wide'] },

  { phase: 1, title: 'Активация ягодичных', short: 'Средняя ягодичная',
    desc: 'Посвящаем день средней ягодичной. Она стабилизирует таз — её слабость и есть причина перекоса.',
    exs: ['warmup_march', 'glute_clamshell', 'glute_side_lying', 'glute_bridge_single', 'kps_decomp', 'kps_clock', 'foot_peroneal', 'foot_eversion', 'foot_short', 'strength_bird_dog', 'savasana'] },

  { phase: 1, title: 'Итог фазы 1', short: 'Лучшее из двух недель',
    desc: 'Собираем всё самое важное из первых двух недель. Ощути разницу с первым днём.',
    exs: ['warmup_knee', 'kps_decomp', 'kps_90_90', 'il_lunge', 'figure4', 'side_lying_stretch', 'foot_peroneal', 'foot_eversion', 'foot_short', 'strength_dead_bug', 'strength_bird_dog', 'child_wide'] },

  // ── ФАЗА 2: Недели 3–4 — добавляем силовые ягодичные и боковые ──
  { phase: 2, title: 'Подвздошно-поясничная — углубление', short: 'ПП-мышца фокус',
    desc: 'Фаза 2 начинается. Подвздошно-поясничная работает с новой интенсивностью. Добавляем силовой мост.',
    exs: ['warmup_hip_circle', 'kps_decomp', 'il_lunge_adv', 'kps_90_90', 'figure4', 'glute_clamshell', 'foot_peroneal', 'foot_eversion', 'foot_short', 'strength_hip_thrust', 'child_pose'] },

  { phase: 2, title: 'Мост — продвинутый', short: 'Одноножный мост',
    desc: 'Переходим на одноножный мост. Добавляем боковые шаги для средней ягодичной под нагрузкой.',
    exs: ['warmup_knee', 'kps_traction', 'glute_bridge_single', 'figure4_adv', 'it_side_lying', 'kps_clock', 'foot_peroneal', 'foot_eversion', 'foot_short', 'strength_side_steps', 'savasana'] },

  { phase: 2, title: 'Поза голубя — дебют', short: 'Голубь подготовительный',
    desc: 'Вводим подготовительную позу голубя. Добавляем силовой мост после растяжки.',
    exs: ['warmup_hip_circle', 'kps_decomp', 'kps_figure4_floor', 'il_lunge_adv', 'glute_side_lying', 'kps_clock', 'foot_peroneal', 'foot_eversion', 'foot_short', 'strength_hip_thrust', 'child_wide'] },

  { phase: 2, title: 'Широкий наклон', short: 'Хамстринги врозь',
    desc: 'Ноги врозь — новый угол задней поверхности. Добавляем боковые шаги.',
    exs: ['warmup_knee', 'kps_decomp', 'hamstring_wide', 'kps_90_90', 'figure4_adv', 'kps_clock', 'foot_peroneal', 'foot_eversion', 'foot_short', 'strength_side_steps', 'child_pose'] },

  { phase: 2, title: 'Симметрия таза', short: 'Коррекция перекоса',
    desc: 'День посвящён выравниванию. Добавляем обратный выпад — безопасный для колена.',
    exs: ['warmup_march', 'kps_traction', 'il_lunge', 'glute_bridge_single', 'it_side_lying', 'kps_clock', 'foot_peroneal', 'foot_eversion', 'foot_short', 'strength_reverse_lunge', 'savasana'] },

  { phase: 2, title: 'Бабочка и пах', short: 'Паховые связки',
    desc: 'Добавляем бабочку с наклоном. КМП + силовой мост + боковые шаги в финале.',
    exs: ['warmup_hip_circle', 'kps_decomp', 'butterfly_forward', 'kps_figure4_floor', 'ql_stretch', 'glute_clamshell', 'kps_clock', 'foot_peroneal', 'foot_eversion', 'foot_short', 'strength_hip_thrust', 'strength_side_steps', 'child_pose'] },

  { phase: 2, title: 'Сумо-приседание', short: 'Тазобедренный сустав',
    desc: 'Вводим глубокое сумо-приседание. Добавляем обратный выпад для силовой работы.',
    exs: ['warmup_knee', 'kps_bridge', 'squat_sumo', 'figure4_adv', 'it_side_lying', 'kps_clock', 'foot_peroneal', 'foot_eversion', 'foot_short', 'strength_reverse_lunge', 'child_wide'] },

  { phase: 2, title: 'ПНФ — первый раз', short: 'ПНФ хамстринги',
    desc: 'Впервые применяем технику ПНФ на задней поверхности. Прорыв в диапазоне.',
    exs: ['warmup_hip_circle', 'kps_decomp', 'hamstring_pnf', 'kps_90_90', 'glute_bridge_single', 'kps_clock', 'foot_peroneal', 'foot_eversion', 'foot_short', 'strength_side_steps', 'savasana'] },

  { phase: 2, title: 'Итог фазы 2', short: 'Интеграция — без осевой нагрузки на колено',
    desc: 'Полный цикл фазы 2. Диагноз от травматолога (20.06): тендинит собственной связки надколенника + раздражение бугристости большеберцовой кости слева. Выпад, мост на одной ноге и силовой блок на ногу убраны — это осевая нагрузка на воспалённую связку, врач прямо ограничил такую нагрузку на 2 недели. Растяжка задней поверхности бедра возвращается — она коленный сустав не грузит.',
    exs: ['warmup_knee', 'kps_decomp', 'kps_figure4_floor', 'hamstring_seated', 'hip_abduction_3way', 'glute_side_kicks', 'glute_clamshell', 'foot_peroneal', 'foot_eversion', 'foot_short', 'strength_bird_dog', 'strength_dead_bug', 'child_wide'] },

  // ── ФАЗА 3: Недели 5–6 — добавляем RDL и сплит-присед ──
  { phase: 3, title: 'Боковая цепь — полный день', short: 'Боковые + ИТ-тяж',
    desc: 'Фаза 3. Фокус на боковую цепь и КМП. Румынскую тягу убираем — это силовая нагрузка на опорное колено, врач ограничил такую нагрузку на 2 недели. Вместо неё фронтальный контроль таза лёжа.',
    exs: ['warmup_hip_circle', 'kps_decomp', 'side_lying_stretch', 'ql_stretch', 'it_side_lying', 'it_standing', 'kps_90_90', 'foot_peroneal', 'foot_eversion', 'foot_short', 'hip_abduction_3way', 'child_pose'] },

  { phase: 3, title: 'Голубь + ПНФ', short: 'КПС × ПНФ — ягодичная и задняя поверхность',
    desc: 'Поза голубя с техникой ПНФ — максимальное воздействие на КПС. ПНФ на ягодичную (figure4_adv) и ПНФ-наклон на заднюю поверхность бедра возвращён — это пассивная растяжка, она не нагружает коленный сустав. Боковые шаги (квартер-сквот, осевая нагрузка на колено) остаются убранными.',
    exs: ['hip_knee_circles', 'kps_traction', 'kps_figure4_floor', 'figure4_adv', 'hamstring_pnf', 'glute_side_kicks', 'kps_clock', 'foot_peroneal', 'foot_eversion', 'foot_short', 'hip_abduction_3way', 'savasana'] },

  { phase: 3, title: 'Фронтальный контроль таза', short: 'Подготовка к присяду — пауза на сам присед',
    desc: 'Сумо-присед убран — глубокое сгибание колена под весом прямо нагружает связку надколенника и бугристость большеберцовой кости, именно то, что воспалено. Подготовка к присяду продолжается через то, что безопасно лёжа и на боку: ротация тазобедренного и фронтальный контроль таза. Растяжку задней поверхности возвращаем — она колено не трогает.',
    exs: ['hip_knee_circles', 'kps_decomp', 'kps_90_90', 'glute_clamshell', 'hip_abduction_3way', 'glute_side_kicks', 'hamstring_standing', 'kps_clock', 'foot_peroneal', 'foot_eversion', 'foot_short', 'strength_bird_dog', 'child_wide'] },

  { phase: 3, title: 'Выравнивание + активация', short: 'Симметрия таза — без выпадов',
    desc: 'Сплит-присед и глубокий выпад убраны — оба грузят колено в глубоком сгибании прямо через связку надколенника. Базовую ракушку заменяем на полное 3-плоскостное отведение, добавляем динамические сайд кики и наклон ноги врозь — та же средняя ягодичная и задняя поверхность бедра, без осевой нагрузки на колено.',
    exs: ['warmup_march', 'kps_decomp', 'glute_side_kicks', 'hip_abduction_3way', 'it_side_lying', 'hamstring_wide', 'kps_clock', 'foot_peroneal', 'foot_eversion', 'foot_short', 'strength_dead_bug', 'savasana'] },

  { phase: 3, title: 'Контроль таза без осевой нагрузки', short: 'КПС и таз — без приседа и RDL',
    desc: 'RDL на одной ноге и обратный выпад — оба силовые упражнения на опорное колено, остаются убраны на время ограничения от врача. ПНФ-наклон на заднюю поверхность бедра возвращён — диагноз касается связки надколенника, не хамстринга, пассивная растяжка коленный сустав не грузит.',
    exs: ['hip_knee_circles', 'kps_traction', 'hip_abduction_3way', 'kps_90_90', 'figure4_adv', 'hamstring_pnf', 'kps_clock', 'foot_peroneal', 'foot_eversion', 'foot_short', 'glute_side_kicks', 'strength_bird_dog', 'child_pose'] },

  { phase: 3, title: 'Интеграция фазы 3', short: 'Без осевой нагрузки на колено',
    desc: 'Собираем лучшее из фазы 3 без нагрузки на связку надколенника. Мост на одной ноге и сплит-присед/RDL остаются убраны — это силовая нагрузка на опорное колено. Наклон врозь возвращаем — это растяжка, а не нагрузка на сустав.',
    exs: ['warmup_hip_circle', 'kps_decomp', 'kps_figure4_floor', 'glute_side_kicks', 'hip_abduction_3way', 'hamstring_wide', 'glute_clamshell', 'foot_peroneal', 'foot_eversion', 'foot_short', 'strength_dead_bug', 'strength_bird_dog', 'child_wide'] },

  // ── ФАЗА 4: Недели 7–8 — полный комплекс растяжка + сила ──
  { phase: 4, title: 'Поддержание и закрепление', short: 'Фаза 4 старт — без силового блока на ногу',
    desc: 'Финальная фаза. Силовой блок на ногу (присед/выпад/RDL/мост) остаётся снят до повторной консультации у ортопеда. ПНФ-наклон возвращён — диагноз касается связки надколенника, не хамстринга, растяжка задней поверхности безопасна.',
    exs: ['hip_knee_circles', 'kps_decomp', 'kps_90_90', 'kps_figure4_floor', 'hip_abduction_3way', 'glute_clamshell', 'hamstring_pnf', 'foot_peroneal', 'foot_eversion', 'foot_short', 'strength_bird_dog', 'strength_dead_bug', 'glute_side_lying', 'savasana'] },

  { phase: 4, title: 'День 30 — итог курса', short: 'Финал — присед и выпады на паузе до контроля у врача',
    desc: 'Последний день. Это твоя новая база — поддерживай 4–5 раз в неделю. ВАЖНО (уточнено по заключению травматолога от 20.06): диагноз — тендинит собственной связки надколенника + раздражение бугристости большеберцовой кости слева, это не хамстринг. Присед, выпады, сплит-присед, RDL, мост на одной ноге и боковые шаги — под паузой минимум 2 недели и до повторной консультации/УЗИ/рентгена, это осевая нагрузка прямо на воспалённую связку. Растяжка задней поверхности бедра (наклоны, ПНФ) разрешена и возвращена — она сустав не грузит, цель «ладони к полу» можно продолжать. На тренировках — назначенный ортез (Orlett PKN-103-2G), при боли — гель с диклофенаком 2–3 р/день.',
    exs: ['hip_knee_circles', 'kps_decomp', 'kps_traction', 'kps_90_90', 'kps_figure4_floor', 'glute_clamshell', 'hip_abduction_3way', 'glute_side_kicks', 'hamstring_pnf', 'foot_peroneal', 'foot_eversion', 'foot_short', 'strength_dead_bug', 'strength_bird_dog', 'child_wide'] },
]
