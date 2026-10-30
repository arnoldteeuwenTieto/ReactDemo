import { useState, type ReactNode } from 'react'
import { demoUsers } from './demoUser'
import { DemoUserContext, demoUsersEnabled } from './demoUserContext'

export function DemoUserProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedId] = useState(demoUsers[0].id)
  const selectedUser = demoUsersEnabled ? demoUsers.find(user => user.id === selectedId) ?? demoUsers[0] : null
  function selectUser(id: string) {
    if (demoUsersEnabled && demoUsers.some(user => user.id === id)) setSelectedId(id)
  }
  return <DemoUserContext.Provider value={{ enabled: demoUsersEnabled, selectedUser, selectUser }}>
    {children}
  </DemoUserContext.Provider>
}
