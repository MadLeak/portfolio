import { NavLink, useNavigate } from 'react-router-dom'
import { Link as HeroLink } from '@heroui/react'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import { cv } from '../data/cv'

export default function Topbar() {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const navLinks = [
        { to: '/', label: t('nav.home') },
        { to: '/about', label: t('nav.about') },
        { to: '/projects', label: t('nav.projects') },
        { to: '/experience', label: t('nav.experience') },
        { to: '/contact', label: t('nav.contact') },
    ]

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-surface2 bg-base/80 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between gap-6">

                {/* Brand */}
                <button
                    onClick={() => navigate('/')}
                    className="font-mono text-sm font-medium text-lavender tracking-wider"
                >
                    {cv.brand}
                </button>

                {/* Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {navLinks.map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end
                            className={({ isActive }) =>
                                `px-3 py-1.5 rounded-md text-sm transition-colors ${isActive
                                    ? 'text-text bg-surface2'
                                    : 'text-muted hover:text-text hover:bg-surface2/60'
                                }`
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <HeroLink
                        href={cv.github}
                        isExternal
                        className="text-muted hover:text-text transition-colors text-sm"
                    >
                        GitHub
                    </HeroLink>
                    <HeroLink
                        href={cv.linkedin}
                        isExternal
                        className="text-muted hover:text-text transition-colors text-sm"
                    >
                        LinkedIn
                    </HeroLink>
                    <button
                        onClick={() => window.open('/cv.pdf', '_blank')}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-lavender/30 text-lavender bg-lavender/10 hover:bg-lavender/20 transition-colors"
                    >
                        <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                        {t('topbar.download')}
                    </button>
                </div>

            </div>
        </header>
    )
}