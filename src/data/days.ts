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
    exs: ['warmup_march', 'kps_traction', 'it_side_lying', 'kps_clock', 'glute_clamshell', 'figure4', 'foot_peroneal', 'foot_outer', 'foot_short', 'child_pose'] },

  { phase: 1, title: 'Сгибатели бедра', short: 'Подвздошно-поясничная',
    desc: 'Впервые тянем подвздошно-поясничную — главного зажимателя КПС. Без форсирования.',
    exs: ['warmup_knee', 'kps_decomp', 'il_lunge', 'figure4', 'side_lying_stretch', 'kps_clock', 'foot_peroneal', 'foot_outer', 'foot_short', 'child_pose'] },

  { phase: 1, title: 'День отдыха КПС', short: 'Лёгкая активация',
    desc: 'Мягкий день. Только декомпрессия и активация средней ягодичной — без нагрузки. Даём КПС адаптироваться.',
    exs: ['warmup_knee', 'kps_traction', 'glute_clamshell', 'glute_side_lying', 'kps_clock', 'foot_peroneal', 'foot_outer', 'foot_short', 'side_lying_stretch', 'savasana'] },

  { phase: 1, title: 'Задняя поверхность', short: 'Хамстринги + КПС',
    desc: 'Добавляем первую работу на заднюю поверхность бёдер. КПС уже чуть свободнее — сейчас наклон пойдёт легче.',
    exs: ['warmup_march', 'kps_decomp', 'hamstring_standing', 'figure4', 'glute_clamshell', 'kps_clock', 'foot_peroneal', 'foot_outer', 'foot_short', 'child_pose'] },

  { phase: 1, title: 'Мост и декомпрессия', short: 'Мост + КПС',
    desc: 'Вводим мост — медленное позвонок за позвонком движение. В нижней точке КПС расслабляется. Финал недели.',
    exs: ['warmup_knee', 'kps_bridge', 'kps_decomp', 'figure4', 'it_side_lying', 'kps_clock', 'foot_peroneal', 'foot_outer', 'foot_short', 'child_wide'] },

  { phase: 1, title: 'Полный цикл недели 1', short: 'Повторение базы',
    desc: 'Прогоняем полный набор первой недели с чуть большим временем удержания. Тело запоминает.',
    exs: ['warmup_march', 'kps_traction', 'il_lunge', 'figure4', 'side_lying_stretch', 'glute_clamshell', 'foot_peroneal', 'foot_outer', 'foot_short', 'savasana'] },

  // Дни 8–14: добавляем мёртвый жук и птицу-собаку — безопасный кор без нагрузки на колено
  { phase: 1, title: 'Углубление КПС', short: 'КПС × 3 упражнения',
    desc: 'Три упражнения на КПС подряд. Суставная цепочка. Добавляем растяжку квадратной мышцы поясницы.',
    exs: ['warmup_knee', 'kps_decomp', 'kps_traction', 'figure4', 'glute_side_lying', 'kps_clock', 'ql_stretch', 'foot_peroneal', 'foot_outer', 'foot_short', 'strength_dead_bug', 'child_pose'] },

  { phase: 1, title: 'Сгибатели + мост', short: 'ПП-мышца + мост',
    desc: 'Подвздошно-поясничная и мост в связке — так работают в физиотерапии при дисфункции КПС.',
    exs: ['warmup_march', 'il_lunge', 'kps_bridge', 'kps_decomp', 'figure4', 'side_lying_stretch', 'foot_peroneal', 'foot_outer', 'foot_short', 'strength_dead_bug', 'savasana'] },

  { phase: 1, title: 'Боковая цепь + КМП', short: 'Межрёберные + КМП',
    desc: 'Полный день на боковую цепь. Добавляем прицельную растяжку квадратной мышцы поясницы.',
    exs: ['warmup_knee', 'kps_decomp', 'side_lying_stretch', 'ql_stretch', 'it_side_lying', 'glute_clamshell', 'kps_clock', 'foot_peroneal', 'foot_outer', 'foot_short', 'strength_bird_dog', 'child_pose'] },

  { phase: 1, title: 'Хамстринги — шаг вперёд', short: 'Задняя поверхность',
    desc: 'Добавляем наклон сидя — новый угол. Цель на эту неделю: пальцы до середины голени.',
    exs: ['warmup_march', 'kps_traction', 'hamstring_standing', 'hamstring_seated', 'figure4', 'kps_clock', 'foot_peroneal', 'foot_outer', 'foot_short', 'strength_bird_dog', 'child_pose'] },

  { phase: 1, title: '90/90 — дебют', short: 'КПС × 90/90',
    desc: 'Вводим упражнение 90/90 — одно из сильнейших для КПС. В первый раз мягко, без давления.',
    exs: ['warmup_knee', 'kps_decomp', 'kps_90_90', 'figure4', 'glute_side_lying', 'kps_clock', 'foot_peroneal', 'foot_outer', 'foot_short', 'strength_dead_bug', 'child_wide'] },

  { phase: 1, title: 'Активация ягодичных', short: 'Средняя ягодичная',
    desc: 'Посвящаем день средней ягодичной. Она стабилизирует таз — её слабость и есть причина перекоса.',
    exs: ['warmup_march', 'glute_clamshell', 'glute_side_lying', 'glute_bridge_single', 'kps_decomp', 'kps_clock', 'foot_peroneal', 'foot_outer', 'foot_short', 'strength_bird_dog', 'savasana'] },

  { phase: 1, title: 'Итог фазы 1', short: 'Лучшее из двух недель',
    desc: 'Собираем всё самое важное из первых двух недель. Ощути разницу с первым днём.',
    exs: ['warmup_knee', 'kps_decomp', 'kps_90_90', 'il_lunge', 'figure4', 'side_lying_stretch', 'foot_peroneal', 'foot_outer', 'foot_short', 'strength_dead_bug', 'strength_bird_dog', 'child_wide'] },

  // ── ФАЗА 2: Недели 3–4 — добавляем силовые ягодичные и боковые ──
  { phase: 2, title: 'Подвздошно-поясничная — углубление', short: 'ПП-мышца фокус',
    desc: 'Фаза 2 начинается. Подвздошно-поясничная работает с новой интенсивностью. Добавляем силовой мост.',
    exs: ['warmup_hip_circle', 'kps_decomp', 'il_lunge_adv', 'kps_90_90', 'figure4', 'glute_clamshell', 'foot_peroneal', 'foot_outer', 'foot_short', 'strength_hip_thrust', 'child_pose'] },

  { phase: 2, title: 'Мост — продвинутый', short: 'Одноножный мост',
    desc: 'Переходим на одноножный мост. Добавляем боковые шаги для средней ягодичной под нагрузкой.',
    exs: ['warmup_knee', 'kps_traction', 'glute_bridge_single', 'figure4_adv', 'it_side_lying', 'kps_clock', 'foot_peroneal', 'foot_outer', 'foot_short', 'strength_side_steps', 'savasana'] },

  { phase: 2, title: 'Поза голубя — дебют', short: 'Голубь подготовительный',
    desc: 'Вводим подготовительную позу голубя. Добавляем силовой мост после растяжки.',
    exs: ['warmup_hip_circle', 'kps_decomp', 'kps_figure4_floor', 'il_lunge_adv', 'glute_side_lying', 'kps_clock', 'foot_peroneal', 'foot_outer', 'foot_short', 'strength_hip_thrust', 'child_wide'] },

  { phase: 2, title: 'Широкий наклон', short: 'Хамстринги врозь',
    desc: 'Ноги врозь — новый угол задней поверхности. Добавляем боковые шаги.',
    exs: ['warmup_knee', 'kps_decomp', 'hamstring_wide', 'kps_90_90', 'figure4_adv', 'kps_clock', 'foot_peroneal', 'foot_outer', 'foot_short', 'strength_side_steps', 'child_pose'] },

  { phase: 2, title: 'Симметрия таза', short: 'Коррекция перекоса',
    desc: 'День посвящён выравниванию. Добавляем обратный выпад — безопасный для колена.',
    exs: ['warmup_march', 'kps_traction', 'il_lunge', 'glute_bridge_single', 'it_side_lying', 'kps_clock', 'foot_peroneal', 'foot_outer', 'foot_short', 'strength_reverse_lunge', 'savasana'] },

  { phase: 2, title: 'Бабочка и пах', short: 'Паховые связки',
    desc: 'Добавляем бабочку с наклоном. КМП + силовой мост + боковые шаги в финале.',
    exs: ['warmup_hip_circle', 'kps_decomp', 'butterfly_forward', 'kps_figure4_floor', 'ql_stretch', 'glute_clamshell', 'kps_clock', 'foot_peroneal', 'foot_outer', 'foot_short', 'strength_hip_thrust', 'strength_side_steps', 'child_pose'] },

  { phase: 2, title: 'Сумо-приседание', short: 'Тазобедренный сустав',
    desc: 'Вводим глубокое сумо-приседание. Добавляем обратный выпад для силовой работы.',
    exs: ['warmup_knee', 'kps_bridge', 'squat_sumo', 'figure4_adv', 'it_side_lying', 'kps_clock', 'foot_peroneal', 'foot_outer', 'foot_short', 'strength_reverse_lunge', 'child_wide'] },

  { phase: 2, title: 'ПНФ — первый раз', short: 'ПНФ хамстринги',
    desc: 'Впервые применяем технику ПНФ на задней поверхности. Прорыв в диапазоне.',
    exs: ['warmup_hip_circle', 'kps_decomp', 'hamstring_pnf', 'kps_90_90', 'glute_bridge_single', 'kps_clock', 'foot_peroneal', 'foot_outer', 'foot_short', 'strength_side_steps', 'savasana'] },

  { phase: 2, title: 'Итог фазы 2', short: 'Интеграция',
    desc: 'Полный цикл фазы 2. Силовой блок: мост + обратный выпад + боковые шаги.',
    exs: ['warmup_knee', 'kps_decomp', 'kps_figure4_floor', 'il_lunge_adv', 'hamstring_wide', 'glute_bridge_single', 'foot_peroneal', 'foot_outer', 'foot_short', 'strength_hip_thrust', 'strength_reverse_lunge', 'child_wide'] },

  // ── ФАЗА 3: Недели 5–6 — добавляем RDL и сплит-присед ──
  { phase: 3, title: 'Боковая цепь — полный день', short: 'Боковые + ИТ-тяж',
    desc: 'Фаза 3. Фокус на боковую цепь и КМП. Добавляем румынскую тягу на одной ноге.',
    exs: ['warmup_hip_circle', 'kps_decomp', 'side_lying_stretch', 'ql_stretch', 'it_side_lying', 'it_standing', 'kps_90_90', 'foot_peroneal', 'foot_outer', 'foot_short', 'strength_single_rdl', 'child_pose'] },

  { phase: 3, title: 'Голубь + ПНФ', short: 'КПС × ПНФ',
    desc: 'Поза голубя с техникой ПНФ — максимальное воздействие на КПС. Боковые шаги в финале.',
    exs: ['warmup_knee', 'kps_traction', 'kps_figure4_floor', 'figure4_adv', 'hamstring_pnf', 'kps_clock', 'foot_peroneal', 'foot_outer', 'foot_short', 'strength_side_steps', 'savasana'] },

  { phase: 3, title: 'Сумо + хамстринги', short: 'Глубина диапазона',
    desc: 'Комбинация сумо и задней поверхности. Добавляем RDL на одной ноге.',
    exs: ['warmup_hip_circle', 'kps_decomp', 'squat_sumo', 'hamstring_wide', 'glute_bridge_single', 'kps_clock', 'foot_peroneal', 'foot_outer', 'foot_short', 'strength_single_rdl', 'child_wide'] },

  { phase: 3, title: 'Выравнивание + активация', short: 'Симметрия таза',
    desc: 'Правая сторона работает интенсивнее. Вводим болгарский сплит-присед.',
    exs: ['warmup_march', 'kps_decomp', 'il_lunge_adv', 'glute_clamshell', 'it_side_lying', 'kps_clock', 'foot_peroneal', 'foot_outer', 'foot_short', 'strength_split_squat', 'savasana'] },

  { phase: 3, title: 'ПНФ-наклон — прорыв', short: 'Ладони к полу',
    desc: 'Основная цель — приблизиться к полу. Добавляем RDL + обратный выпад.',
    exs: ['warmup_knee', 'kps_traction', 'hamstring_pnf', 'kps_90_90', 'figure4_adv', 'kps_clock', 'foot_peroneal', 'foot_outer', 'foot_short', 'strength_reverse_lunge', 'strength_single_rdl', 'child_pose'] },

  { phase: 3, title: 'Интеграция фазы 3', short: 'Всё вместе',
    desc: 'Собираем лучшее из фазы 3. Полный силовой блок: сплит-присед + RDL + боковые шаги.',
    exs: ['warmup_hip_circle', 'kps_decomp', 'kps_figure4_floor', 'it_standing', 'hamstring_wide', 'glute_bridge_single', 'foot_peroneal', 'foot_outer', 'foot_short', 'strength_split_squat', 'strength_single_rdl', 'child_wide'] },

  // ── ФАЗА 4: Недели 7–8 — полный комплекс растяжка + сила ──
  { phase: 4, title: 'Поддержание и закрепление', short: 'Фаза 4 старт',
    desc: 'Финальная фаза. Всё закрепляем. Полный силовой блок после растяжки.',
    exs: ['warmup_hip_circle', 'kps_decomp', 'kps_90_90', 'kps_figure4_floor', 'hamstring_pnf', 'glute_bridge_single', 'foot_peroneal', 'foot_outer', 'foot_short', 'strength_hip_thrust', 'strength_split_squat', 'strength_single_rdl', 'savasana'] },

  { phase: 4, title: 'День 30 — итог курса', short: 'Финал',
    desc: 'Последний день. Это твоя новая база — поддерживай 4–5 раз в неделю.',
    exs: ['warmup_knee', 'kps_decomp', 'kps_traction', 'kps_90_90', 'kps_figure4_floor', 'hamstring_pnf', 'foot_peroneal', 'foot_outer', 'foot_short', 'strength_reverse_lunge', 'strength_side_steps', 'strength_single_rdl', 'child_wide'] },
]
