import { createContext, useContext, type ReactNode } from 'react'

interface NavigationContextType {
  currentPage: string
  navigate: (path: string) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export const useNavigation = () => {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}

interface NavigationProviderProps {
  children: ReactNode
  currentPage: string
  navigate: (path: string) => void
}

export const NavigationProvider = ({ children, currentPage, navigate }: NavigationProviderProps) => {
  return (
    <NavigationContext.Provider value={{ currentPage, navigate }}>
      {children}
    </NavigationContext.Provider>
  )
}
