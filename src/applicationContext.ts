import { createContext, useContext } from 'react'
import type { ApplicationConfiguration } from './services/applicationInitialization'
export const ApplicationContext = createContext<ApplicationConfiguration | null>(null)
export function useApplication() {
  const value = useContext(ApplicationContext)
  if (!value) throw new Error('Application initialization is required')
  return value
}
