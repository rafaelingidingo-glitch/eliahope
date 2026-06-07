'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import en, { type Translations } from './en'
import sw from './sw'

export type Locale = 'en' | 'sw'

const translations: Record<Locale, Translations> = { en, sw }

interface LanguageContextType {
  locale: Locale
  t: Translations
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  t: en,
  setLocale: () => {},
  toggleLocale: () => {},
})

const STORAGE_KEY = 'elia_hope_locale'

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'sw') return stored
  } catch {
    // localStorage not available
  }
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    try {
      localStorage.setItem(STORAGE_KEY, newLocale)
      // Update html lang attribute
      document.documentElement.lang = newLocale
    } catch {
      // localStorage not available
    }
  }, [])

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'en' ? 'sw' : 'en')
  }, [locale, setLocale])

  // Set html lang on mount
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const t = translations[locale]

  return (
    <LanguageContext.Provider value={{ locale, t, setLocale, toggleLocale }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
