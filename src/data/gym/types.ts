export interface GymExercise {
  name: string
  equipment: string
  /** Целевая мышечная группа + механика движения: направление тяги (откуда-куда), положение тела в жиме (сидя/стоя/лёжа) и т.д. */
  target: string
  how: string
  /** 2-3 короткие технические подсказки — на что смотреть/чувствовать во время выполнения. */
  cues: string[]
  note: string | null
}

export interface WorkoutExercise {
  id: string
  sets: number
  reps: string
  weight: string
}

export interface GymWorkout {
  week: number
  title: string
  short: string
  desc: string
  exs: WorkoutExercise[]
}
