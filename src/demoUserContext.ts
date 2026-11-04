import { createContext, useContext } from 'react'
import type { DemoUser } from './demoUser'

// Local opt-in or an explicitly configured fictional deployed demo only.
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
