export function initializeTheme() {
  if (typeof window === 'undefined')
    return

  const theme
    = localStorage.getItem('theme')
      || (window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light')

  document.documentElement.classList.toggle('dark', theme === 'dark')
  localStorage.setItem('theme', theme)
}

export function toggleTheme() {
  if (typeof window === 'undefined')
    return

  const isDark = document.documentElement.classList.contains('dark')
  const newTheme = isDark ? 'light' : 'dark'

  document.documentElement.classList.toggle('dark', newTheme === 'dark')
  localStorage.setItem('theme', newTheme)
}
