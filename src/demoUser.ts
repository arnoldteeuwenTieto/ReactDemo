// Demo only. Replace this source with BOGIAPI/Altinn user context when available.
// The user's role is independent of the selected school's reporting status.
export const demoUser = {
  name: 'Eksempelbruker',
  email: 'demo@example.com',
  role: 'Skolerapportør (demo)',
}

export interface DemoUser {
  id: string
  name: string
  email: string
  roleId: 9 | 10 | 11 | 12 | 13
  roleName: string
  assignedUnit: { id: string; name: string }
  mockAccessScope: {
    // Fixture associations only: these are not GSI authorization rules.
    unitIds: readonly string[]
    schoolIds: readonly string[]
    municipalityCentral: boolean | null
    description: string
    permissions: 'baseline-edit-only'
  }
}

export const demoUsers: readonly DemoUser[] = [
  {
    id: 'demo-school-leader', name: 'Ada Fjord', email: 'ada.fjord@example.com',
    roleId: 9, roleName: 'Skoleleder',
    assignedUnit: { id: 'school-fjordglott', name: 'Fjordgløtt barneskole' },
    mockAccessScope: { unitIds: ['school-fjordglott'], schoolIds: ['1', '13'], municipalityCentral: null,
      description: 'Fjordgløtt barneskole (2025 og 2026)', permissions: 'baseline-edit-only' },
  },
  {
    id: 'demo-owner-central', name: 'Birk Vik', email: 'birk.vik@example.com',
    roleId: 10, roleName: 'Skoleeier, kommune sentralt',
    assignedUnit: { id: 'municipality-bergen', name: 'Bergen kommune (demo)' },
    mockAccessScope: { unitIds: ['municipality-bergen'], schoolIds: ['1', '9', '13'], municipalityCentral: true,
      description: 'Bergen: Fjordgløtt og Vestlia', permissions: 'baseline-edit-only' },
  },
  {
    id: 'demo-owner-noncentral', name: 'Celine Lund', email: 'celine.lund@example.com',
    roleId: 10, roleName: 'Skoleeier, ikke sentralt',
    assignedUnit: { id: 'owner-fjord-demo', name: 'Fjord skoleeier (demo)' },
    mockAccessScope: { unitIds: ['owner-fjord-demo'], schoolIds: ['1', '13'], municipalityCentral: false,
      description: 'Fiktiv tilknytning til Fjordgløtt barneskole', permissions: 'baseline-edit-only' },
  },
  {
    id: 'demo-county', name: 'David Li', email: 'david.li@example.com',
    roleId: 11, roleName: 'Statsforvalter',
    assignedUnit: { id: 'county-demo', name: 'Statsforvalteren i Eksempelfylket (demo)' },
    mockAccessScope: { unitIds: ['county-demo'], schoolIds: ['1', '9', '13'], municipalityCentral: null,
      description: 'Fiktivt utvalg: Fjordgløtt og Vestlia', permissions: 'baseline-edit-only' },
  },
  {
    id: 'demo-udir-admin', name: 'Elin Berg', email: 'elin.berg@example.com',
    roleId: 12, roleName: 'Udir administrator',
    assignedUnit: { id: 'udir-demo', name: 'Udir (demo)' },
    mockAccessScope: { unitIds: ['udir-demo'], schoolIds: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'], municipalityCentral: null,
      description: 'Alle fiktive rapporteringer', permissions: 'baseline-edit-only' },
  },
  {
    id: 'demo-udir-support', name: 'Farid Dal', email: 'farid.dal@example.com',
    roleId: 13, roleName: 'Udir brukerstøtte',
    assignedUnit: { id: 'udir-support-demo', name: 'Udir brukerstøtte (demo)' },
    mockAccessScope: { unitIds: ['udir-support-demo'], schoolIds: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'], municipalityCentral: null,
      description: 'Alle fiktive rapporteringer', permissions: 'baseline-edit-only' },
  },
]
