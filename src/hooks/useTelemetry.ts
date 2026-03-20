import { useState, useEffect, useCallback } from 'react'

export interface Container {
    name: string
    status: string
    cpu: number
    mem: number
}

export interface TelemetryData {
  cpu:    { pct: number; cores: number; model: string; loadAvg: number[] }
  ram:    { pct: number; used_gib: number; free_gib: number; total_gib: number }
  disk:   { pct: number; used_gib: number; free_gib: number; total_gib: number }
  swap:   { used_gib: number; total_gib: number }
  temp:   number
  uptime:     string
  kernel:     string
  pveVersion: string
  containers: { name: string; status: string; cpu: number; mem: number; vmid: number }[]
  running:    number
  stopped:    number
}

const TELEMETRY_URL = import.meta.env.VITE_TELEMETRY_URL as string | undefined

export function useTelemetry(intervalMs = 5000) {
    const [data, setData] = useState<TelemetryData | null>(null)
    const [lastPing, setLastPing] = useState('–')
    const [error, setError] = useState(false)
    const [cpuHistory, setCpuHistory] = useState<number[]>([])

    const fetchData = useCallback(async () => {
        if (!TELEMETRY_URL) return
        try {
            const r = await fetch(TELEMETRY_URL)
            if (!r.ok) throw new Error('bad response')
            const json = await r.json() as TelemetryData
            setData(json)
            setError(false)
            setLastPing(new Date().toLocaleTimeString())
            setCpuHistory(prev => [...prev.slice(-19), json.cpu.pct])
        } catch {
            setError(true)
            setLastPing('unreachable')
        }
    }, [])

    useEffect(() => {
        fetchData()
        const id = setInterval(fetchData, intervalMs)
        return () => clearInterval(id)
    }, [fetchData, intervalMs])

    return { data, lastPing, error, cpuHistory }
}