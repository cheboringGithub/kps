import type { GymWorkout } from './types'

// 10 тренировок / 4 недели. Недели 1–3: ротация A (верх жим+тяга+кор) /
// B (низ + плечи) / C (верх тяга-акцент + низ хамстринг/ягодичные).
// Неделя 4: одна контрольная/разгрузочная тренировка перед следующим блоком.
// Прогрессия — double progression: сначала повторы растут к верхней границе
// диапазона при том же весе, затем вес растёт и повторы сбрасываются к нижней
// границе (см. workout 7 vs 1, 8 vs 2, 9 vs 3). Осевая нагрузка на согнутое
// стоя колено исключена везде — см. src/data/gym/exercises.ts.

export const WORKOUTS: GymWorkout[] = [
  // ── Неделя 1 ──────────────────────────────────────────────────────
  {
    week: 1,
    title: 'Верх тела: жим + тяга + кор',
    short: 'Жим/тяга + кор',
    desc: 'Базовый жим и тяга для верха тела, руки, нагруженная антиротация в конце. Стартовые веса — ориентировочные, скорректируй по факту первой тренировки.',
    exs: [
      { id: 'gym_bench_press', sets: 3, reps: '8-10', weight: '20 кг' },
      { id: 'gym_lat_pulldown', sets: 3, reps: '10-12', weight: '30 кг' },
      { id: 'gym_shoulder_press', sets: 3, reps: '8-10', weight: '8 кг' },
      { id: 'gym_biceps_curl', sets: 3, reps: '10-12', weight: '8 кг' },
      { id: 'gym_triceps_pushdown', sets: 3, reps: '10-12', weight: '15 кг' },
      { id: 'gym_cable_antirotation', sets: 3, reps: '10/сторона', weight: '10 кг' },
    ],
  },
  {
    week: 1,
    title: 'Низ тела (safe) + плечи',
    short: 'Низ (safe) + плечи',
    desc: 'Низ тела без осевой нагрузки через согнутое стоя колено — только тренажёры с контролируемой амплитудой. Левая нога и левая средняя ягодичная — приоритет объёма.',
    exs: [
      { id: 'gym_leg_press_partial', sets: 3, reps: '10-12', weight: '40 кг' },
      { id: 'gym_leg_extension', sets: 3, reps: '12-15', weight: '20 кг' },
      { id: 'gym_leg_curl_unilateral', sets: 4, reps: '10-12', weight: '12 кг' },
      { id: 'gym_hip_abduction_cable', sets: 4, reps: '15', weight: '5 кг' },
      { id: 'gym_calf_raise', sets: 3, reps: '15', weight: '30 кг' },
      { id: 'gym_lateral_raise', sets: 3, reps: '12-15', weight: '6 кг' },
    ],
  },
  {
    week: 1,
    title: 'Верх тела: тяга-акцент + низ (хамстринг/ягодичные)',
    short: 'Тяга + хамстринг/ягодичные',
    desc: 'Тяговые движения верха тела плюс хамстринг и ягодичные — работают на ту же цель, что и домашняя реабилитация (компенсация слабой левой ягодичной).',
    exs: [
      { id: 'gym_seated_row', sets: 3, reps: '10-12', weight: '35 кг' },
      { id: 'gym_db_row', sets: 4, reps: '10-12', weight: '12 кг' },
      { id: 'gym_face_pull', sets: 3, reps: '15', weight: '12 кг' },
      { id: 'gym_rdl_barbell', sets: 3, reps: '8-10', weight: '30 кг' },
      { id: 'gym_glute_bridge_machine', sets: 3, reps: '12', weight: '40 кг' },
    ],
  },

  // ── Неделя 2 — те же упражнения, повторы к верхней границе диапазона ──
  {
    week: 2,
    title: 'Верх тела: жим + тяга + кор',
    short: 'Жим/тяга + кор',
    desc: 'Тот же вес, что на неделе 1 — цель прогрессии: дойти до верхней границы диапазона повторов в каждом подходе.',
    exs: [
      { id: 'gym_bench_press', sets: 3, reps: '10-12', weight: '20 кг' },
      { id: 'gym_lat_pulldown', sets: 3, reps: '12-14', weight: '30 кг' },
      { id: 'gym_shoulder_press', sets: 3, reps: '10-12', weight: '8 кг' },
      { id: 'gym_biceps_curl', sets: 3, reps: '12-15', weight: '8 кг' },
      { id: 'gym_triceps_pushdown', sets: 3, reps: '12-15', weight: '15 кг' },
      { id: 'gym_cable_antirotation', sets: 3, reps: '12/сторона', weight: '10 кг' },
    ],
  },
  {
    week: 2,
    title: 'Низ тела (safe) + плечи',
    short: 'Низ (safe) + плечи',
    desc: 'Вес удерживается, повторы растут к верхней границе. Колено — по-прежнему без боли; при дискомфорте не увеличивай амплитуду.',
    exs: [
      { id: 'gym_leg_press_partial', sets: 3, reps: '12-15', weight: '40 кг' },
      { id: 'gym_leg_extension', sets: 3, reps: '15-18', weight: '20 кг' },
      { id: 'gym_leg_curl_unilateral', sets: 4, reps: '12-14', weight: '12 кг' },
      { id: 'gym_hip_abduction_cable', sets: 4, reps: '18', weight: '5 кг' },
      { id: 'gym_calf_raise', sets: 3, reps: '18', weight: '30 кг' },
      { id: 'gym_lateral_raise', sets: 3, reps: '15-18', weight: '6 кг' },
    ],
  },
  {
    week: 2,
    title: 'Верх тела: тяга-акцент + низ (хамстринг/ягодичные)',
    short: 'Тяга + хамстринг/ягодичные',
    desc: 'Повторы растут к верхней границе на том же весе — RDL проверяй по утренней боли в пояснице, при дискомфорте снижай амплитуду.',
    exs: [
      { id: 'gym_seated_row', sets: 3, reps: '12-14', weight: '35 кг' },
      { id: 'gym_db_row', sets: 4, reps: '12-14', weight: '12 кг' },
      { id: 'gym_face_pull', sets: 3, reps: '18', weight: '12 кг' },
      { id: 'gym_rdl_barbell', sets: 3, reps: '10-12', weight: '30 кг' },
      { id: 'gym_glute_bridge_machine', sets: 3, reps: '15', weight: '40 кг' },
    ],
  },

  // ── Неделя 3 — вес растёт, повторы сброшены к нижней границе, +1 подход на базовых ──
  {
    week: 3,
    title: 'Верх тела: жим + тяга + кор',
    short: 'Жим/тяга + кор',
    desc: 'Вес вырос на базовых движениях (жим, тяга), у жима лёжа — дополнительный подход. Повторы снова с нижней границы диапазона.',
    exs: [
      { id: 'gym_bench_press', sets: 4, reps: '8-10', weight: '25 кг' },
      { id: 'gym_lat_pulldown', sets: 3, reps: '10-12', weight: '35 кг' },
      { id: 'gym_shoulder_press', sets: 3, reps: '8-10', weight: '10 кг' },
      { id: 'gym_biceps_curl', sets: 3, reps: '10-12', weight: '10 кг' },
      { id: 'gym_triceps_pushdown', sets: 3, reps: '10-12', weight: '20 кг' },
      { id: 'gym_cable_antirotation', sets: 3, reps: '10/сторона', weight: '12 кг' },
    ],
  },
  {
    week: 3,
    title: 'Низ тела (safe) + плечи',
    short: 'Низ (safe) + плечи',
    desc: 'Жим ногами получает дополнительный подход и вес — по-прежнему в ограниченной амплитуде. Отведение бедра прибавляет сопротивление, не объём.',
    exs: [
      { id: 'gym_leg_press_partial', sets: 4, reps: '10-12', weight: '50 кг' },
      { id: 'gym_leg_extension', sets: 3, reps: '12-15', weight: '25 кг' },
      { id: 'gym_leg_curl_unilateral', sets: 4, reps: '10-12', weight: '15 кг' },
      { id: 'gym_hip_abduction_cable', sets: 4, reps: '15', weight: '7 кг' },
      { id: 'gym_calf_raise', sets: 3, reps: '15', weight: '40 кг' },
      { id: 'gym_lateral_raise', sets: 3, reps: '12-15', weight: '8 кг' },
    ],
  },
  {
    week: 3,
    title: 'Верх тела: тяга-акцент + низ (хамстринг/ягодичные)',
    short: 'Тяга + хамстринг/ягодичные',
    desc: 'Тяга блока сидя и RDL получают дополнительный подход и вес — это точка блока с наибольшей силовой прогрессией перед разгрузкой.',
    exs: [
      { id: 'gym_seated_row', sets: 4, reps: '10-12', weight: '40 кг' },
      { id: 'gym_db_row', sets: 4, reps: '10-12', weight: '14 кг' },
      { id: 'gym_face_pull', sets: 3, reps: '15', weight: '15 кг' },
      { id: 'gym_rdl_barbell', sets: 4, reps: '8-10', weight: '40 кг' },
      { id: 'gym_glute_bridge_machine', sets: 3, reps: '12', weight: '50 кг' },
    ],
  },

  // ── Неделя 4 — контрольная / разгрузочная ──────────────────────────
  {
    week: 4,
    title: 'Контрольная / разгрузочная тренировка',
    short: 'Контрольная (deload)',
    desc: 'Сниженный объём (2 подхода на упражнение, вес ниже пиковых недели 3) — разгрузка перед следующим блоком и проверка самочувствия колена и поясницы под нагрузкой. По одному движению из каждой категории блока.',
    exs: [
      { id: 'gym_bench_press', sets: 2, reps: '8', weight: '20 кг' },
      { id: 'gym_seated_row', sets: 2, reps: '10', weight: '30 кг' },
      { id: 'gym_leg_press_partial', sets: 2, reps: '10', weight: '35 кг' },
      { id: 'gym_hip_abduction_cable', sets: 2, reps: '15', weight: '5 кг' },
      { id: 'gym_rdl_barbell', sets: 2, reps: '8', weight: '25 кг' },
      { id: 'gym_cable_antirotation', sets: 2, reps: '10/сторона', weight: '10 кг' },
    ],
  },
]
