import { LanguageIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'

export default function LangToggle() {
    const { i18n, t } = useTranslation()

    const toggle = () => {
        const next = i18n.language.startsWith('es') ? 'en' : 'es'
        i18n.changeLanguage(next)
    }

    return (
        <button
            onClick={toggle}
            style={{ background: '#13142a', color: '#c4b5fd', border: '1px solid rgba(196,181,253,0.3)' }}
            className="fixed bottom-6 right-6 z-[9999] flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-mono hover:opacity-80 transition-opacity"
            aria-label="Toggle language"
        >
            <LanguageIcon className="w-4 h-4" />
            {t('lang.toggle')}
        </button>
    )
}