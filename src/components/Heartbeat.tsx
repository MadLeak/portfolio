import { useEffect, useRef } from 'react'

interface Props {
  cpuHistory: number[]
  lastPing:   string
  interval:   number
  uptime?:    string
  ram:        number   // 0-100%
  temp:       number   // celsius
}

const W    = 600
const H    = 72
const TICK = 16

// Normalize helpers
const norm  = (v: number, min: number, max: number) =>
  Math.max(0, Math.min(1, (v - min) / (max - min)))

// Each metric maps to a different wave segment:
//   P wave  → RAM pressure (0-100%)
//   R spike → CPU usage    (0-100%)
//   S dip   → CPU load spike echo
//   T wave  → Temperature  (30-80°C)
function beatShape(cpu: number, ram: number, temp: number): number[] {
  const mid = H / 2

  const cpuN  = norm(cpu,  0,   100)
  const ramN  = norm(ram,  20,  95)
  const tempN = norm(temp, 30,  75)

  // Amplitudes per segment
  const rAmp  = Math.max(0.12, cpuN)  * (H * 1.05)   // R spike — CPU
  const pAmp  = Math.max(0.06, ramN)  * (H * 0.28)   // P wave  — RAM
  const tAmp  = Math.max(0.06, tempN) * (H * 0.38)   // T wave  — Temp
  const sAmp  = rAmp * 0.42                           // S dip   — echo of R

  const flat = (n: number) => Array(n).fill(mid)

  return [
    // Pre-beat baseline
    ...flat(14),

    // P wave — RAM pressure
    // Higher RAM = taller, wider P bump
    mid - pAmp * 0.40,
    mid - pAmp * 0.75,
    mid - pAmp * 1.00,
    mid - pAmp * 0.75,
    mid - pAmp * 0.40,
    mid,

    // PR segment
    ...flat(4),

    // Q dip — small, fixed
    mid + rAmp * 0.10,
    mid + rAmp * 0.18,

    // R spike — CPU (dominant peak)
    mid - rAmp * 0.42,
    mid - rAmp * 0.72,
    mid - rAmp * 0.92,
    mid - rAmp * 1.00,   // peak
    mid - rAmp * 0.92,
    mid - rAmp * 0.72,
    mid - rAmp * 0.42,

    // S dip — drops below baseline (CPU echo)
    mid + sAmp * 0.50,
    mid + sAmp * 0.85,
    mid + sAmp * 1.00,   // bottom
    mid + sAmp * 0.72,
    mid + sAmp * 0.38,
    mid,

    // ST segment
    ...flat(6),

    // T wave — Temperature
    // Higher temp = taller and slightly wider
    mid - tAmp * 0.30,
    mid - tAmp * 0.62,
    mid - tAmp * 0.88,
    mid - tAmp * 1.00,   // peak
    mid - tAmp * 0.88,
    mid - tAmp * 0.62,
    mid - tAmp * 0.30,
    mid,

    // Post-beat flat
    ...flat(12),
  ]
}

export default function Heartbeat({ cpuHistory, lastPing, interval, uptime, ram, temp }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const lineRef    = useRef<Float32Array>(new Float32Array(W).fill(H / 2))
  const writeXRef  = useRef(0)
  const queueRef   = useRef<number[]>([])
  const runningRef = useRef(false)
  const rafRef     = useRef(0)
  const tickRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const idleRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevLenRef = useRef(0)
  const dotRef     = useRef<HTMLDivElement>(null)

  // Latest metrics via refs so RAF closure always has fresh values
  const ramRef  = useRef(ram)
  const tempRef = useRef(temp)
  const cpuRef  = useRef(0)

  useEffect(() => { ramRef.current  = ram  }, [ram])
  useEffect(() => { tempRef.current = temp }, [temp])

  function drainQueue() {
    if (runningRef.current) return
    runningRef.current = true
    tickRef.current = setInterval(() => {
      const q = queueRef.current
      if (q.length === 0) {
        clearInterval(tickRef.current!)
        runningRef.current = false
        return
      }
      lineRef.current[writeXRef.current] = q.shift()!
      writeXRef.current = (writeXRef.current + 1) % W
    }, TICK)
  }

  function enqueueBeat(cpu: number, ramPct: number, tempC: number) {
    queueRef.current.push(...beatShape(cpu, ramPct, tempC))
    drainQueue()
  }

  // RAF render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    function render() {
      const buf  = lineRef.current
      const head = writeXRef.current

      ctx.fillStyle = '#070810'
      ctx.fillRect(0, 0, W, H)

      // Eraser ahead of write head
      ctx.fillStyle = '#070810'
      ctx.fillRect(head, 0, 14, H)

      // Glow pass
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(134,239,172,0.14)'
      ctx.lineWidth   = 7
      ctx.lineJoin    = 'round'
      ctx.lineCap     = 'round'
      ctx.moveTo(0, buf[0])
      for (let x = 1; x < W; x++) ctx.lineTo(x, buf[x])
      ctx.stroke()

      // Main line
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(134,239,172,0.88)'
      ctx.lineWidth   = 1.5
      ctx.lineJoin    = 'round'
      ctx.lineCap     = 'round'
      ctx.moveTo(0, buf[0])
      for (let x = 1; x < W; x++) ctx.lineTo(x, buf[x])
      ctx.stroke()

      // Write head dot
      ctx.beginPath()
      ctx.arc(head, buf[head], 2.5, 0, Math.PI * 2)
      ctx.fillStyle = '#86efac'
      ctx.fill()

      rafRef.current = requestAnimationFrame(render)
    }

    render()

    // Keep flat line flowing when idle
    idleRef.current = setInterval(() => {
      if (!runningRef.current && queueRef.current.length === 0) {
        queueRef.current.push(H / 2)
        drainQueue()
      }
    }, TICK)

    return () => {
      cancelAnimationFrame(rafRef.current)
      clearInterval(tickRef.current!)
      clearInterval(idleRef.current!)
    }
  }, [])

  // New sample arrived
  useEffect(() => {
    if (cpuHistory.length === 0) return
    if (cpuHistory.length === prevLenRef.current) return
    prevLenRef.current = cpuHistory.length

    const cpu = cpuHistory[cpuHistory.length - 1]
    cpuRef.current = cpu
    enqueueBeat(cpu, ramRef.current, tempRef.current)

    if (dotRef.current) {
      dotRef.current.style.transform = 'scale(2.2)'
      dotRef.current.style.opacity   = '1'
      setTimeout(() => {
        if (dotRef.current) {
          dotRef.current.style.transform = 'scale(1)'
          dotRef.current.style.opacity   = '0.65'
        }
      }, 200)
    }
  }, [cpuHistory])

  const currentCpu  = cpuHistory[cpuHistory.length - 1] ?? 0
  const intervalSec = Math.round(interval / 1000)

  return (
    <div className="px-4 py-3 border-b border-white/4">

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            ref={dotRef}
            className="w-1.5 h-1.5 rounded-full bg-mint"
            style={{ opacity: 0.65, transition: 'transform 0.15s, opacity 0.15s' }}
          />
          <span className="font-mono text-[9px] text-mint/40 uppercase tracking-[0.1em]">
            cpu heartbeat
          </span>
        </div>

        {/* Live metric legend */}
        <div className="flex items-center gap-4">
          <span className="font-mono text-[9px] text-muted/30">
            P·<span className="text-mint/60">ram {ram.toFixed(0)}%</span>
          </span>
          <span className="font-mono text-[9px] text-muted/30">
            R·<span className="text-lavender/60">cpu {currentCpu.toFixed(1)}%</span>
          </span>
          <span className="font-mono text-[9px] text-muted/30">
            T·<span className="text-rose/60">temp {temp.toFixed(0)}°C</span>
          </span>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="w-full rounded-sm"
        style={{ height: `${H}px` }}
      />

      {/* Meta */}
      <div className="flex items-center gap-4 mt-2">
        <span className="font-mono text-[9px] text-muted/20">
          interval <span className="text-muted/40">{intervalSec}s</span>
        </span>
        <span className="font-mono text-[9px] text-muted/20">
          samples <span className="text-muted/40">{cpuHistory.length}</span>
        </span>
        <span className="font-mono text-[9px] text-muted/20">
          ↻ <span className="text-muted/40">{lastPing}</span>
        </span>
        {uptime && (
          <span className="font-mono text-[9px] text-muted/20">
            uptime <span className="text-muted/40">{uptime}</span>
          </span>
        )}
      </div>

    </div>
  )
}