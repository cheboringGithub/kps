export interface GymExercise {
  name: string
  equipment: string
  /** Целевая мышечная группа + механика движения: направление тяги (откуда-куда), положение тела в жиме (сидя/стоя/лёжа) и т.д. */
  target: string
  how: string
  /** 2-3 короткие технические подсказки — на что смотреть/чувствовать во время выполнения. */
  cues: string[]
  note: string | null
  /** 'cardio' меняет поля записи в карточке: вместо веса и повторов — скорость и подъём. По умолчанию силовое. */
  kind?: 'strength' | 'cardio'
}

/** Ориентиры кардио-блока: длительность сессии и целевые скорость/подъём. */
export interface CardioTarget {
  minutes: number
  /** Ориентир скорости, км/ч — строкой, потому что это диапазон: «18-20». */
  speed: string
  /** Ориентир уровня подъёма/сопротивления на тренажёре: «3-4». */
  incline: string
}

interface BaseWorkoutExercise {
  id: string
  /** Кардио: один «подход» = вся сессия, поэтому sets: 1. */
  sets: number
}

export interface StrengthWorkoutExercise extends BaseWorkoutExercise {
  reps: string
  weight: string
  cardio?: never
}

export interface CardioWorkoutExercise extends BaseWorkoutExercise {
  cardio: CardioTarget
  reps?: never
  weight?: never
}

export type WorkoutExercise = StrengthWorkoutExercise | CardioWorkoutExercise

export interface GymWorkout {
  week: number
  title: string
  short: string
  desc: string
  exs: WorkoutExercise[]
}
