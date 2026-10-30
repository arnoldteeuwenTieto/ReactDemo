import { createContext, useContext } from 'react'
import type { DemoUser } from './demoUser'

// Both conditions are required. A production build cannot enable switching.
export const demoUsersEnabled = __DEMO_USERS_ENABLED__

export interface DemoUserState {
  enabled: boolean
  selectedUser: DemoUser | null
  selectUser: (id: string) => void
}

export const DemoUserContext = createContext<DemoUserState | null>(null)

// Simulated UI context only. Never use this hook for backend authorization.
export function useDemoUser() {
  const context = useContext(DemoUserContext)
  if (!context) throw new Error('useDemoUser requires DemoUserProvider')
  return context
}
