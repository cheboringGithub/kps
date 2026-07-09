import { useEffect, useRef, useState } from 'react'
import type { TimerConfig, TimerSet } from '../../data/types'
import s from './Timer.module.css'

interface TimerStep extends TimerSet {
  round: number
}

function buildSequence(timer: TimerConfig): TimerStep[] {
  const seq: TimerStep[] = []
  for (let r = 0; r < timer.rounds; r++) {
    if (timer.sets) {
      timer.sets.forEach((set) => seq.push({ ...set, round: r + 1 }))
    } else {
      seq.push({
        work: timer.work ?? 0,
        rest: timer.rest ?? 0,
        workLabel: timer.workLabel ?? '',
        restLabel: timer.restLabel ?? '',
        round: r + 1,
      })
    }
  }
  return seq
}

// ─── Speech ──────────────────────────────────────────────────────────────────

let ruVoice: SpeechSynthesisVoice | null = null

function loadVoice() {
  if (!('speechSynthesis' in window)) return
  const pick = () => {
    const voices = speechSynthesis.getVoices()
    ruVoice =
      voices.find((v) => v.lang.startsWith('ru') && v.localService) ??
      voices.find((v) => v.lang.startsWith('ru')) ??
      voices[0] ??
      null
  }
  pick()
  speechSynthesis.addEventListener('voiceschanged', pick)
}
loadVoice()

function speak(text: string, priority = false) {
  if (!('speechSynthesis' in window)) return
  if (priority) speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'ru-RU'
  utt.rate = 0.95
  utt.pitch = 1
  utt.volume = 1
  if (ruVoice) utt.voice = ruVoice
  speechSynthesis.speak(utt)
}

function stopSpeech() {
  if ('speechSynthesis' in window) speechSynthesis.cancel()
}

// ─── Wake Lock ───────────────────────────────────────────────────────────────

let wakeLock: WakeLockSentinel | null = null
async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen')
  } catch { /* ignore */ }
}
function releaseWakeLock() {
  wakeLock?.release()
  wakeLock = null
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  timer: TimerConfig
  totalRounds: number
  onComplete?: () => void
}

type Phase = 'idle' | 'work' | 'rest' | 'done'

export function Timer({ timer, totalRounds, onComplete }: Props) {
  const seq = useRef(buildSequence(timer))
  const [seqIdx, setSeqIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [remaining, setRemaining] = useState(0)
  const [running, setRunning] = useState(false)

  const startedAt = useRef<number>(0)
  const startedRemaining = useRef<number>(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // track which countdown seconds already spoken
  const spokenAt = useRef<Set<number>>(new Set())

  const cur = seq.current[seqIdx]

  function clear() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
  }

  function startTick(rem: number) {
    startedAt.current = Date.now()
    startedRemaining.current = rem
    spokenAt.current = new Set()
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt.current) / 1000)
      const next = Math.max(0, startedRemaining.current - elapsed)
      setRemaining(next)
    }, 500)
  }

  // Short intervals get a shorter announcement — the countdown itself
  // (10, 5, 3, 2, 1) already conveys the duration, no need to say it twice.
  const SHORT_THRESHOLD = 15

  // Announce phase start
  function announcePhaseStart(p: Phase, step: TimerStep, roundNum: number, totalRoundsCount: number) {
    if (p === 'work') {
      if (step.work <= SHORT_THRESHOLD) {
        speak(`Работа. ${step.workLabel}`, true)
        return
      }
      const mins = Math.floor(step.work / 60)
      const secs = step.work % 60
      const durText = mins > 0
        ? `${mins} минут${mins === 1 ? 'а' : mins < 5 ? 'ы' : ''} ${secs > 0 ? secs + ' секунд' : ''}`
        : `${secs} секунд`
      const roundText = totalRoundsCount > 1 ? `, раунд ${roundNum} из ${totalRoundsCount}` : ''
      speak(`Работа${roundText}. ${step.workLabel}. ${durText}`, true)
    } else if (p === 'rest') {
      if (step.rest <= SHORT_THRESHOLD) {
        speak(`Отдых. ${step.restLabel}`, true)
        return
      }
      speak(`Отдых, ${step.rest} секунд. ${step.restLabel}`, true)
    }
  }

  // Countdown: announce 10, 5, 3, 2, 1
  useEffect(() => {
    if (phase === 'idle' || phase === 'done') return
    if (remaining <= 0) return

    const milestones = [10, 5, 3, 2, 1]
    if (milestones.includes(remaining) && !spokenAt.current.has(remaining)) {
      spokenAt.current.add(remaining)
      if (remaining <= 3) {
        speak(String(remaining))
      } else {
        speak(`${remaining} секунд`)
      }
    }
  }, [remaining, phase])

  // Phase transitions when remaining hits 0
  useEffect(() => {
    if (phase === 'idle' || phase === 'done') return
    if (remaining > 0) return
    clear()

    if (phase === 'work') {
      const restSec = cur?.rest ?? 0
      if (restSec > 0) {
        setPhase('rest')
        setRemaining(restSec)
        startTick(restSec)
        if (cur) announcePhaseStart('rest', cur, cur.round, totalRounds)
      } else {
        advance()
      }
    } else {
      advance()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining])

  function advance() {
    const next = seqIdx + 1
    if (next >= seq.current.length) {
      setPhase('done')
      setRunning(false)
      releaseWakeLock()
      speak('Упражнение выполнено. Отличная работа!', true)
      onComplete?.()
      return
    }
    const nextStep = seq.current[next]!
    setSeqIdx(next)
    setPhase('work')
    setRemaining(nextStep.work)
    startTick(nextStep.work)
    announcePhaseStart('work', nextStep, nextStep.round, totalRounds)
  }

  function handlePlay() {
    if (phase === 'done') {
      reset()
      return
    }
    if (phase === 'idle') {
      requestWakeLock()
      const firstStep = cur!
      setPhase('work')
      setRemaining(firstStep.work)
      setRunning(true)
      startTick(firstStep.work)
      announcePhaseStart('work', firstStep, firstStep.round, totalRounds)
      return
    }
    if (running) {
      clear()
      setRunning(false)
      stopSpeech()
    } else {
      setRunning(true)
      startTick(remaining)
      speak('Продолжаем')
    }
  }

  function reset() {
    clear()
    stopSpeech()
    setSeqIdx(0)
    setPhase('idle')
    setRemaining(0)
    setRunning(false)
    releaseWakeLock()
  }

  useEffect(() => () => { clear(); releaseWakeLock(); stopSpeech() }, [])

  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible' && running) requestWakeLock()
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [running])

  const isWork = phase === 'work'
  const isRest = phase === 'rest'
  const isDone = phase === 'done'
  const total = isWork ? (cur?.work ?? 1) : (cur?.rest ?? 1)
  const pct = phase === 'idle' || isDone ? 100 : Math.max(0, (remaining / total) * 100)
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const timeStr = phase === 'idle' ? '—' : isDone ? '✓' : mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}`

  return (
    <div className={s.block}>
      <div className={[s.phaseLabel, isWork ? s.work : isRest ? s.rest : isDone ? s.done : s.work].join(' ')}>
        {phase === 'idle' ? 'Готов к старту' : isWork ? 'РАБОТА' : isRest ? 'ОТДЫХ' : 'Готово!'}
      </div>

      <div className={s.instruction}>
        {phase === 'idle' && 'Нажми Play для начала'}
        {isWork && cur?.workLabel}
        {isRest && cur?.restLabel}
        {isDone && '✓ Упражнение выполнено'}
      </div>

      <div className={[s.display, isRest ? s.restColor : remaining <= 3 && isWork ? s.lowColor : ''].join(' ')}>
        {timeStr}
      </div>

      <div className={s.track}>
        <div className={[s.fill, isRest ? s.restFill : ''].join(' ')} style={{ width: `${pct}%` }} />
      </div>

      <div className={s.meta}>
        {isDone
          ? 'Упражнение завершено'
          : `Раунд ${cur?.round ?? 0} / ${totalRounds} · Подход ${seqIdx + 1} из ${seq.current.length}`}
      </div>

      <div className={s.controls}>
        <button className={`${s.btn} ${s.btnPlay}`} onClick={handlePlay}>
          {phase === 'idle' ? '▶ Старт' : isDone ? '↺ Ещё раз' : running ? '⏸ Пауза' : '▶ Продолжить'}
        </button>
        <button className={`${s.btn} ${s.btnReset}`} onClick={reset}>↺ Сброс</button>
      </div>
    </div>
  )
}
