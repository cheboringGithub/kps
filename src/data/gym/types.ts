export interface GymExercise {
  name: string
  equipment: string
  how: string
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
