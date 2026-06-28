import { useCallback } from 'react'

type Language = 'en' | 'hi' | 'te' | 'ta' | 'ml'

const translations: Record<Language, Record<string, any>> = {
  en: require('@/public/locales/en/common.json'),
  hi: require('@/public/locales/hi/common.json'),
  te: require('@/public/locales/te/common.json'),
  ta: require('@/public/locales/ta/common.json'),
  ml: require('@/public/locales/ml/common.json'),
}

export function useTranslation(language: Language) {
  const t = useCallback(
    (path: string, fallback?: string): string => {
      try {
        const keys = path.split('.')
        let value = translations[language]

        for (const key of keys) {
          if (value && typeof value === 'object' && key in value) {
            value = value[key]
          } else {
            return fallback || path
          }
        }

        return typeof value === 'string' ? value : fallback || path
      } catch {
        return fallback || path
      }
    },
    [language]
  )

  return { t, language }
}

export type { Language }
