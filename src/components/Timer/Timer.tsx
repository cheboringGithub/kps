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

let audioCtx: AudioContext | null = null
function playBeep(type: 'work' | 'rest' | 'countdown' | 'done') {
  try {
    if (!audioCtx) audioCtx = new AudioContext()
    const ctx = audioCtx
    const beep = (freq: number, vol: number, dur: number, delay = 0) => {
      setTimeout(() => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = freq
        gain.gain.value = vol
        osc.start()
        osc.stop(ctx.currentTime + dur)
      }, delay)
    }
    if (type === 'work') { beep(880, 0.3, 0.15); beep(1100, 0.3, 0.2, 180) }
    else if (type === 'rest') beep(440, 0.2, 0.3)
    else if (type === 'countdown') beep(660, 0.15, 0.08)
    else if (type === 'done') { beep(880, 0.25, 0.2); beep(1100, 0.25, 0.2, 220); beep(1320, 0.25, 0.2, 440) }
  } catch { /* ignore */ }
}

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

interface Props {
  timer: TimerConfig
  totalRounds: number
}

type Phase = 'idle' | 'work' | 'rest' | 'done'

export function Timer({ timer, totalRounds }: Props) {
  const seq = useRef(buildSequence(timer))
  const [seqIdx, setSeqIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [remaining, setRemaining] = useState(0)
  const [running, setRunning] = useState(false)

  const startedAt = useRef<number>(0)
  const startedRemaining = useRef<number>(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const cur = seq.current[seqIdx]

  function clear() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
  }

  function startTick(rem: number) {
    startedAt.current = Date.now()
    startedRemaining.current = rem
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt.current) / 1000)
      const next = Math.max(0, startedRemaining.current - elapsed)
      setRemaining(next)
    }, 500)
  }

  // advance to next step when remaining hits 0
  useEffect(() => {
    if (phase === 'idle' || phase === 'done') return
    if (remaining > 0) {
      if (remaining === 3) playBeep('countdown')
      return
    }
    clear()

    if (phase === 'work') {
      const restSec = cur?.rest ?? 0
      if (restSec > 0) {
        playBeep('rest')
        setPhase('rest')
        setRemaining(restSec)
        startTick(restSec)
      } else {
        advance()
      }
    } else {
      playBeep('work')
      advance()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining])

  function advance() {
    const next = seqIdx + 1
    if (next >= seq.current.length) {
      setPhase('done')
      setRunning(false)
      playBeep('done')
      releaseWakeLock()
      return
    }
    setSeqIdx(next)
    setPhase('work')
    const nextWork = seq.current[next]?.work ?? 0
    setRemaining(nextWork)
    startTick(nextWork)
  }

  function handlePlay() {
    if (phase === 'done') {
      reset()
      return
    }
    if (phase === 'idle') {
      requestWakeLock()
      const firstWork = cur?.work ?? 0
      setPhase('work')
      setRemaining(firstWork)
      setRunning(true)
      startTick(firstWork)
      return
    }
    if (running) {
      clear()
      setRunning(false)
    } else {
      setRunning(true)
      startTick(remaining)
    }
  }

  function reset() {
    clear()
    setSeqIdx(0)
    setPhase('idle')
    setRemaining(0)
    setRunning(false)
    releaseWakeLock()
  }

  useEffect(() => () => { clear(); releaseWakeLock() }, [])

  // visibility change — re-acquire wake lock
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
        <div
          className={[s.fill, isRest ? s.restFill : ''].join(' ')}
          style={{ width: `${pct}%` }}
        />
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
