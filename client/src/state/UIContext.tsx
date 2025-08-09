import { createContext, useContext, useMemo, useState } from 'react'
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material'

type UIContextValue = {
  darkMode: boolean
  toggleDarkMode: () => void
  notificationsCount: number
  setNotificationsCount: (n: number) => void
}

const UIContext = createContext<UIContextValue | undefined>(undefined)

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? saved === 'true' : false
  })
  const [notificationsCount, setNotificationsCount] = useState(0)

  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode: darkMode ? 'dark' : 'light' },
        shape: { borderRadius: 12 },
        typography: { fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' },
      }),
    [darkMode]
  )

  const value = useMemo<UIContextValue>(
    () => ({
      darkMode,
      toggleDarkMode: () => {
        setDarkMode((prev) => {
          localStorage.setItem('darkMode', String(!prev))
          return !prev
        })
      },
      notificationsCount,
      setNotificationsCount,
    }),
    [darkMode, notificationsCount]
  )

  return (
    <UIContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </UIContext.Provider>
  )
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used within UIProvider')
  return ctx
}



