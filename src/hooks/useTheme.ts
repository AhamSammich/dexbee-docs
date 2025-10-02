import { useEffect, useState } from 'react'

// Safe localStorage operations with error handling
function safeGetStoredTheme(): string | null {
  try {
    return localStorage.getItem('theme')
  }
  catch {
    return null
  }
}

function safeSetStoredTheme(theme: string): void {
  try {
    localStorage.setItem('theme', theme)
  }
  catch {
    // Silently ignore storage failures
  }
}

// Initialize theme state synchronously to prevent SSR hydration mismatch
function getInitialTheme(): boolean {
  // Guard for server-side rendering
  if (typeof window === 'undefined') {
    return false
  }

  const storedTheme = safeGetStoredTheme()
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const theme = storedTheme || (systemPrefersDark ? 'dark' : 'light')
  return theme === 'dark'
}

export function useTheme() {
  const [isDark, setIsDark] = useState(getInitialTheme)

  useEffect(() => {
    // Initialize theme state from localStorage and DOM
    const initializeTheme = () => {
      // First check localStorage for the stored theme
      const storedTheme = safeGetStoredTheme()
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const theme = storedTheme || (systemPrefersDark ? 'dark' : 'light')
      const isDarkTheme = theme === 'dark'

      // Apply theme to DOM if not already set
      if (document.documentElement.classList.contains('dark') !== isDarkTheme) {
        document.documentElement.classList.toggle('dark', isDarkTheme)
      }

      setIsDark(isDarkTheme)
    }

    // Listen for theme changes from the inline script
    const handleThemeChange = (event: CustomEvent) => {
      if (event.detail && typeof event.detail.isDark === 'boolean') {
        setIsDark(event.detail.isDark)
      }
      else {
        initializeTheme()
      }
    }

    // Also listen for class changes on document element as a fallback
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const isDarkTheme = document.documentElement.classList.contains('dark')
          setIsDark(isDarkTheme)
        }
      })
    })

    // Initialize theme immediately
    initializeTheme()

    /* eslint-disable-next-line react-web-api/no-leaked-event-listener */
    window.addEventListener('themeChange', handleThemeChange as EventListener)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => {
      window.removeEventListener('themeChange', handleThemeChange as EventListener)
      observer.disconnect()
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark'
    const newIsDark = newTheme === 'dark'

    // Update DOM and localStorage
    document.documentElement.classList.toggle('dark', newIsDark)
    safeSetStoredTheme(newTheme)

    // Update local state immediately
    setIsDark(newIsDark)

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('themeChange', {
      detail: { theme: newTheme, isDark: newIsDark },
    }))
  }

  return { isDark, toggleTheme }
}
