import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { MapPinIcon, ArrowRightIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import { cv } from '../../data/cv'
import TelemetryWidget from '../../components/TelemetryWidget'

const stats = [
  { value: '3.5', label: 'Years exp.' },
  { value: '4', label: 'Projects' },
  { value: 'M.Sc.', label: 'Data Science', color: 'text-lavender' },
  { value: '● Open', label: 'To work', color: 'text-mint' },
]

const roles = ['Fullstack Dev', 'Software Engineer', 'Data Scientist']

const services = [
  {
    name: 'backend.service',
    stack: 'TypeScript · FastAPI · tRPC · Prisma · PostgreSQL',
    color: 'text-mint',
    bg: 'bg-mint/[0.04]',
    border: 'border-mint/10',
    badgeBg: 'bg-mint/[0.08]',
    badgeBorder: 'border-mint/[0.15]',
  },
  {
    name: 'automation.service',
    stack: 'n8n · SnapLogic · EDI Systems · Pipelines',
    color: 'text-amber',
    bg: 'bg-amber/[0.04]',
    border: 'border-amber/10',
    badgeBg: 'bg-amber/[0.08]',
    badgeBorder: 'border-amber/[0.15]',
  },
  {
    name: 'datascience.service',
    stack: 'Python · Regression · Modeling',
    color: 'text-rose',
    bg: 'bg-rose/[0.04]',
    border: 'border-rose/10',
    badgeBg: 'bg-rose/[0.08]',
    badgeBorder: 'border-rose/[0.15]',
  },
  {
    name: 'infrastructure.service',
    stack: 'Docker · Proxmox · Nginx · Pi-hole · Homelab',
    color: 'text-sky',
    bg: 'bg-sky/[0.04]',
    border: 'border-sky/10',
    badgeBg: 'bg-sky/[0.08]',
    badgeBorder: 'border-sky/[0.15]',
  },
]

export default function Hero() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <section className="flex flex-col gap-6 pb-8">

      {/* OS bar */}
      <div className="flex items-center justify-between bg-[#0f1020] border border-white/5 rounded-xl px-4 py-2">
        <span className="font-mono text-[11px] text-muted/40">
          <span className="text-lavender">MadLeak</span>.os · v1.0.0
        </span>
        <div className="flex items-center gap-5">
          <span className="font-mono text-[10px] text-muted/30">
            kernel: <span className="text-muted/50">life-infra</span>
          </span>
          <span className="font-mono text-[10px] text-muted/30">
            status: <span className="text-mint">● running</span>
          </span>
          <span className="font-mono text-[10px] text-muted/30">
            uptime: <span className="text-muted/50">3.5 yrs</span>
          </span>
        </div>
      </div>

      {/* Name + stats */}
      <div className="flex items-end justify-between gap-6">
        <div className="flex flex-col gap-2.5">
          <h1 className="text-6xl font-medium tracking-[-2px] leading-[1.02] whitespace-nowrap">
            <span className="text-text">Adhonys </span>
            <span className="text-lavender">Diaz</span>
          </h1>
          <div className="flex items-center">
            {roles.map((role, i) => (
              <span key={role} className="flex items-center">
                <span className="text-xs text-muted/50 font-mono">{role}</span>
                {i < roles.length - 1 && (
                  <span className="mx-2 text-muted/20 text-xs">/</span>
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-stretch rounded-xl border border-white/5 bg-[#0f1020] overflow-hidden shrink-0 mb-1">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`flex flex-col justify-center items-center px-5 py-2.5 text-center ${i < stats.length - 1 ? 'border-r border-white/5' : ''
                }`}
            >
              <span className={`text-lg font-medium tracking-tight ${s.color ?? 'text-text'}`}>
                {s.value}
              </span>
              <span className="text-[9px] uppercase tracking-[0.08em] text-muted/35 mt-0.5">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tagline */}
      <p className="text-sm text-muted/55 leading-relaxed max-w-lg border-l-2 border-lavender/20 pl-4">
        My life runs on systems I built myself —
        from health optimization pipelines to self-hosted infrastructure.
        I don't just write code. I engineer solutions I live with.
      </p>

      {/* Services */}
      <div className="flex flex-col gap-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted/25">
          // active services
        </span>
        <div className="grid grid-cols-2 gap-3">
          {services.map((s) => (
            <div
              key={s.name}
              className={`flex flex-col gap-2 p-4 rounded-xl border ${s.bg} ${s.border}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium font-mono ${s.color}`}>{s.name}</span>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${s.color} ${s.badgeBg} ${s.badgeBorder}`}>
                  active
                </span>
              </div>
              <span className="text-[11px] text-muted/40 font-mono leading-relaxed">
                {s.stack}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Telemetry */}
      <TelemetryWidget />

      {/* Bottom bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 pt-5 border-t border-white/5">
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-lavender/30 text-lavender bg-lavender/10 hover:bg-lavender/20 transition-colors"
          >
            {t('hero.cta_projects')}
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigate('/contact')}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-white/6 text-muted hover:text-text hover:border-muted/30 transition-colors"
          >
            <EnvelopeIcon className="w-3.5 h-3.5" />
            {t('hero.cta_contact')}
          </button>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 font-mono text-xs text-muted/40">
            <MapPinIcon className="w-3 h-3" />
            {cv.location}
          </span>
          <a href={cv.github} target="_blank" rel="noopener noreferrer"
            className="font-mono text-xs text-muted/40 hover:text-muted transition-colors">
            GitHub
          </a>
          <a href={cv.linkedin} target="_blank" rel="noopener noreferrer"
            className="font-mono text-xs text-muted/40 hover:text-muted transition-colors">
            LinkedIn
          </a>
        </div>
      </div>

    </section>
  )
}