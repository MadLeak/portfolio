import { useTelemetry } from '../hooks/useTelemetry'
import Heartbeat from './Heartbeat'

function Bar({ pct, color }: { pct: number; color: string }) {
    return (
        <div className="h-[3px] rounded-full bg-white/4 overflow-hidden mt-2">
            <div
                className={`h-full rounded-full transition-all duration-1000 ${color}`}
                style={{ width: `${pct}%` }}
            />
        </div>
    )
}

function StatusDot({ status }: { status: string }) {
    return (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status === 'running' ? 'bg-mint animate-pulse' : 'bg-muted/30'
            }`} />
    )
}

export default function TelemetryWidget() {
    const { data, lastPing, error, cpuHistory } = useTelemetry(5000)

    const metrics = data ? [
        {
            label: 'CPU',
            value: `${data.cpu.pct}%`,
            sub: `${data.cpu.cores} cores · load ${data.cpu.loadAvg[0]}`,
            color: 'bg-lavender',
            pct: data.cpu.pct,
        },
        {
            label: 'RAM',
            value: `${data.ram.pct}%`,
            sub: `${data.ram.used_gib} / ${data.ram.total_gib} GiB`,
            color: 'bg-mint',
            pct: data.ram.pct,
        },
        {
            label: 'Disk',
            value: `${data.disk.pct}%`,
            sub: `${data.disk.used_gib} / ${data.disk.total_gib} GiB`,
            color: 'bg-sky',
            pct: data.disk.pct,
        },
        {
            label: 'Containers',
            value: String(data.running),
            sub: `${data.running} up · ${data.stopped} off`,
            color: 'bg-amber',
            pct: 0,
        },
    ] : Array(4).fill(null)

    return (
        <div className="rounded-xl border border-mint/10 overflow-hidden bg-[#070810]">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-mint/[0.03] border-b border-mint/[0.08]">
                <div className="flex items-center gap-2 font-mono text-[10px] text-mint/70">
                    <span className={`w-1.5 h-1.5 rounded-full ${error ? 'bg-rose' : 'bg-mint animate-pulse'
                        }`} />
                    Kronos · {data?.pveVersion?.split('/')[1] ?? '–'}
                </div>
                <div className="flex items-center gap-3">
                    <span className="font-mono text-[9px] text-muted/25">
                        {data?.kernel ?? '–'}
                    </span>
                    <span className="font-mono text-[9px] text-muted/20">
                        uptime {data?.uptime ?? '–'}
                    </span>
                    <span className="font-mono text-[9px] text-muted/25">
                        {error ? '⚠ unreachable' : data ? `↻ ${lastPing}` : 'connecting…'}
                    </span>
                </div>
            </div>

            {/* Core metrics */}
            <div className="grid grid-cols-4 border-b border-white/4">
                {metrics.map((m, i) => (
                    <div key={i} className={`p-4 ${i < 3 ? 'border-r border-white/4' : ''}`}>
                        {m ? (
                            <>
                                <div className="text-[9px] uppercase tracking-[0.08em] text-muted/30 mb-1.5">
                                    {m.label}
                                </div>
                                <div className="text-xl font-medium font-mono tracking-tight text-text">
                                    {m.value}
                                </div>
                                <div className="text-[10px] font-mono text-muted/30 mt-1">{m.sub}</div>
                                {m.pct > 0 && <Bar pct={m.pct} color={m.color} />}
                            </>
                        ) : (
                            <div className="h-12 flex items-center">
                                <span className="text-[10px] font-mono text-muted/20">–</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* ← Heartbeat reemplaza el sparkline aquí */}
<Heartbeat
  cpuHistory={cpuHistory}
  lastPing={lastPing}
  interval={5000}
  uptime={data?.uptime}
  ram={data?.ram.pct ?? 0}
  temp={data?.temp ?? 0}
/>

            {/* Containers */}
            <div className="px-4 py-3">
                <div className="text-[9px] uppercase tracking-[0.08em] text-muted/25 mb-2.5">
                    containers · {data?.running ?? '–'} running
                </div>
                <div className="flex flex-col gap-1.5">
                    {(data?.containers ?? []).map((c) => (
                        <div
                            key={c.vmid}
                            className={`flex items-center justify-between px-3 py-1.5 rounded-lg border ${c.status === 'running'
                                    ? 'bg-mint/[0.03] border-mint/8'
                                    : 'bg-white/[0.02] border-white/5'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <StatusDot status={c.status} />
                                <span className={`font-mono text-[11px] ${c.status === 'running' ? 'text-text/70' : 'text-muted/30'
                                    }`}>
                                    {c.name}
                                </span>
                                <span className="font-mono text-[9px] text-muted/20">
                                    #{c.vmid}
                                </span>
                            </div>
                            {c.status === 'running' && (
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-[9px] text-muted/30">
                                        cpu <span className="text-lavender/60">{c.cpu}%</span>
                                    </span>
                                    <span className="font-mono text-[9px] text-muted/30">
                                        mem <span className="text-mint/60">{c.mem} GiB</span>
                                    </span>
                                </div>
                            )}
                            {c.status !== 'running' && (
                                <span className="font-mono text-[9px] text-muted/20">stopped</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}