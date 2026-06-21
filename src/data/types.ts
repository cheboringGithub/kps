export type ExerciseType = 'kps' | 'fix' | 'secondary' | 'rest'

export interface TimerSet {
  work: number
  rest: number
  workLabel: string
  restLabel: string
}

export interface TimerConfig {
  rounds: number
  work?: number
  rest?: number
  workLabel?: string
  restLabel?: string
  sets?: TimerSet[]
}

export interface Exercise {
  name: string
  time: string
  type: ExerciseType
  timer: TimerConfig
  how: string
  note: string | null
}

export interface Phase {
  name: string
  title: string
  icon: string
  desc: string
}

export interface Day {
  phase: number
  title: string
  short: string
  desc: string
  exs: string[]
}
