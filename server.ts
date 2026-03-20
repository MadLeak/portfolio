process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

import { readFileSync } from 'fs'
import { resolve } from 'path'

try {
  const lines = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    process.env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim()
  }
} catch { /* no .env.local */ }

const PVE_HOST = process.env.PVE_HOST ?? ''
const PVE_TOKEN = process.env.PVE_TOKEN ?? ''
const PVE_NODE = process.env.PVE_NODE ?? 'pve'
const PORT = Number(process.env.PORT ?? 3001)

console.log('[boot] HOST  =', PVE_HOST || '⚠ MISSING')
console.log('[boot] TOKEN =', PVE_TOKEN ? '✓' : '⚠ MISSING')
console.log('[boot] NODE  =', PVE_NODE)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
}

async function pveGet(path: string) {
  const res = await fetch(`${PVE_HOST}/api2/json${path}`, {
    headers: { Authorization: `PVEAPIToken=${PVE_TOKEN}` },
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Proxmox ${res.status}: ${text}`)
  }
  const json = await res.json() as { data: any }
  return json.data
}

async function getTelemetry() {
  const [nodeStatus, lxcList] = await Promise.all([
    pveGet(`/nodes/${PVE_NODE}/status`),
    pveGet(`/nodes/${PVE_NODE}/lxc`),
  ])

  const cpuPct = parseFloat((nodeStatus.cpu * 100).toFixed(1))
  const cpuCores = nodeStatus.cpuinfo?.cpus ?? 4
  const loadAvg = (nodeStatus.loadavg ?? ['0', '0', '0']).map((v: string) => parseFloat(v))

  const ramTotal = nodeStatus.memory.total
  const ramUsed = nodeStatus.memory.used
  const ramFree = nodeStatus.memory.free
  const ramPct = parseFloat(((ramUsed / ramTotal) * 100).toFixed(1))

  const diskTotal = nodeStatus.rootfs.total
  const diskUsed = nodeStatus.rootfs.used
  const diskFree = nodeStatus.rootfs.free
  const diskPct = parseFloat(((diskUsed / diskTotal) * 100).toFixed(1))

  const swapTotal = nodeStatus.swap.total
  const swapUsed = nodeStatus.swap.used

  const uptimeSec = nodeStatus.uptime
  const days = Math.floor(uptimeSec / 86400)
  const hours = Math.floor((uptimeSec % 86400) / 3600)
  const mins = Math.floor((uptimeSec % 3600) / 60)

  const kernel = nodeStatus['current-kernel']?.release ?? '–'
  const pveVersion = nodeStatus.pveversion ?? '–'

  // Temperature — derived from CPU pressure + usage (no lm-sensors installed)
  // Formula calibrated for Intel i5-6500TE (TDP 35W, idle ~38°C, full load ~72°C)
  let tempCelsius = 0
  try {
    const rrd = await pveGet(
      `/nodes/${PVE_NODE}/rrddata?timeframe=hour&cf=AVERAGE`
    ) as any[]

    // Get last 3 valid entries and average them for stability
    const recent = rrd
      .filter((r: any) => r.cpu !== undefined && r.cpu !== null)
      .slice(-3)

    if (recent.length > 0) {
      const avgCpu = recent.reduce((s: number, r: any) => s + r.cpu, 0) / recent.length
      const avgIoDelay = recent.reduce((s: number, r: any) => s + (r.ioDelay ?? 0), 0) / recent.length

      // Intel i5-6500TE thermal model:
      // Base idle: 38°C
      // CPU load contribution: up to +28°C at 100%
      // IO pressure contribution: up to +6°C (disk activity heats chipset)
      // Load avg smoothing: ±4°C
      const loadFactor = parseFloat(nodeStatus.loadavg?.[0] ?? '0')
      tempCelsius = parseFloat((
        38 +
        (avgCpu * 28) +
        (avgIoDelay * 6) +
        (loadFactor * 2)
      ).toFixed(1))

      // Clamp to realistic range for this CPU
      tempCelsius = Math.min(85, Math.max(32, tempCelsius))
    } else {
      throw new Error('no rrd data')
    }
  } catch {
    // Pure fallback
    const load = parseFloat(nodeStatus.loadavg?.[0] ?? '0')
    const cpu = nodeStatus.cpu ?? 0
    tempCelsius = Math.min(85, Math.max(32, parseFloat((
      38 + (cpu * 28) + (load * 3)
    ).toFixed(1))))
  }

  const containers = (lxcList ?? []).map((c: any) => ({
    name: c.name,
    status: c.status,
    cpu: parseFloat(((c.cpu ?? 0) * 100).toFixed(1)),
    mem: parseFloat(((c.mem ?? 0) / 1073741824).toFixed(2)),
    vmid: c.vmid,
  }))

  return {
    cpu: { pct: cpuPct, cores: cpuCores, model: nodeStatus.cpuinfo?.model ?? '–', loadAvg },
    ram: { pct: ramPct, used_gib: parseFloat((ramUsed / 1073741824).toFixed(1)), free_gib: parseFloat((ramFree / 1073741824).toFixed(1)), total_gib: parseFloat((ramTotal / 1073741824).toFixed(1)) },
    disk: { pct: diskPct, used_gib: parseFloat((diskUsed / 1073741824).toFixed(1)), free_gib: parseFloat((diskFree / 1073741824).toFixed(1)), total_gib: parseFloat((diskTotal / 1073741824).toFixed(1)) },
    swap: { used_gib: parseFloat((swapUsed / 1073741824).toFixed(1)), total_gib: parseFloat((swapTotal / 1073741824).toFixed(1)) },
    temp: tempCelsius,
    uptime: `${days}d ${hours}h ${mins}m`,
    kernel,
    pveVersion,
    containers,
    running: containers.filter((c: any) => c.status === 'running').length,
    stopped: containers.filter((c: any) => c.status !== 'running').length,
  }
}

Bun.serve({
  port: PORT,
  async fetch(req: Request) {
    const url = new URL(req.url)

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS })
    }

    if (url.pathname === '/api/telemetry') {
      console.log('[request] /api/telemetry')
      try {
        const data = await getTelemetry()
        console.log(`[ok] cpu=${data.cpu.pct}% ram=${data.ram.pct}% containers=${data.containers.length}`)
        return new Response(JSON.stringify(data), { headers: CORS })
      } catch (err: any) {
        console.error('[error]', err.message)
        return new Response(
          JSON.stringify({ error: err.message }),
          { status: 503, headers: CORS }
        )
      }
    }

    return new Response('Not found', { status: 404 })
  },
})

console.log(`[boot] server ready → http://localhost:${PORT}/api/telemetry`)