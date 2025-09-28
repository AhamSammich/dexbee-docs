import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Initialize theme state
    const checkTheme = () => {
      const isDarkTheme = document.documentElement.classList.contains('dark')
      requestAnimationFrame(() => setIsDark(isDarkTheme))
    }

    // Set initial theme
    checkTheme()

    // Listen for theme changes
    const handleThemeChange = () => {
      checkTheme()
    }

    window.addEventListener('themeChange', handleThemeChange)

    // Also listen for class changes on document element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          checkTheme()
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => {
      window.removeEventListener('themeChange', handleThemeChange)
      observer.disconnect()
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark'
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    localStorage.setItem('theme', newTheme)

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('themeChange', {
      detail: { theme: newTheme, isDark: newTheme === 'dark' },
    }))
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted cursor-pointer"
      aria-label="Toggle theme"
    >
      {isDark ? (
        // Sun icon (visible in dark mode - shows what clicking will activate)
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        // Moon icon (visible in light mode - shows what clicking will activate)
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </Button>
  )
}
