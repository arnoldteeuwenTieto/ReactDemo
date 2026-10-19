export const statuses = ['Ikke påbegynt', 'Under arbeid', 'Levert', 'Godkjent'] as const
export type SchoolStatus = typeof statuses[number]
export interface School {
  id: string
  name: string
  organizationNumber: string
  municipality: string
  year: number
  status: SchoolStatus
}
// Fiktive skoler. Numrene er demonstrasjonsverdier, ikke gyldige organisasjonsnumre.
export const schools: School[] = [
  { id: '1', name: 'Fjordgløtt barneskole', organizationNumber: '000100001', municipality: 'Bergen', year: 2026, status: 'Under arbeid' },
  { id: '2', name: 'Bjørkelia ungdomsskole', organizationNumber: '000100002', municipality: 'Oslo', year: 2026, status: 'Levert' },
  { id: '3', name: 'Solenga skole', organizationNumber: '000100003', municipality: 'Trondheim', year: 2026, status: 'Godkjent' },
  { id: '4', name: 'Nordmyra barneskole', organizationNumber: '000100004', municipality: 'Tromsø', year: 2026, status: 'Ikke påbegynt' },
  { id: '5', name: 'Havblikk ungdomsskole', organizationNumber: '000100005', municipality: 'Stavanger', year: 2026, status: 'Under arbeid' },
  { id: '6', name: 'Lindeåsen skole', organizationNumber: '000100006', municipality: 'Drammen', year: 2026, status: 'Levert' },
  { id: '7', name: 'Skogstun barneskole', organizationNumber: '000100007', municipality: 'Oslo', year: 2026, status: 'Ikke påbegynt' },
  { id: '8', name: 'Elvebakken oppvekstsenter', organizationNumber: '000100008', municipality: 'Trondheim', year: 2026, status: 'Godkjent' },
  { id: '9', name: 'Vestlia ungdomsskole', organizationNumber: '000100009', municipality: 'Bergen', year: 2026, status: 'Levert' },
  { id: '10', name: 'Åsly barneskole', organizationNumber: '000100010', municipality: 'Kristiansand', year: 2026, status: 'Under arbeid' },
  { id: '11', name: 'Granvik skole', organizationNumber: '000100011', municipality: 'Stavanger', year: 2026, status: 'Godkjent' },
  { id: '12', name: 'Sørenga ungdomsskole', organizationNumber: '000100012', municipality: 'Drammen', year: 2026, status: 'Ikke påbegynt' },
  { id: '13', name: 'Fjordgløtt barneskole', organizationNumber: '000100001', municipality: 'Bergen', year: 2025, status: 'Godkjent' },
  { id: '14', name: 'Nordmyra barneskole', organizationNumber: '000100004', municipality: 'Tromsø', year: 2025, status: 'Levert' },
  { id: '15', name: 'Solenga skole', organizationNumber: '000100003', municipality: 'Trondheim', year: 2025, status: 'Godkjent' },
]
