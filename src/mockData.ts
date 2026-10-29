export interface School {
  id: string
  name: string
  organizationNumber: string
  municipality: string
  year: number
  // Sole status source: absent/invalid IDs display "Status ukjent".
  statusId?: number | null
}
// One-time demo migration: Ikke påbegynt→0, Under arbeid→1, Levert→2, Godkjent→4.
// Existing approved demo schools are municipality-approved by user instruction.
// Future records must supply an explicit statusId; no label-based conversion.
// Fiktive skoler. Numrene er demonstrasjonsverdier, ikke gyldige organisasjonsnumre.
export const schools: School[] = [
  { id: '1', name: 'Fjordgløtt barneskole', organizationNumber: '000100001', municipality: 'Bergen', year: 2026, statusId: 1 },
  { id: '2', name: 'Bjørkelia ungdomsskole', organizationNumber: '000100002', municipality: 'Oslo', year: 2026, statusId: 2 },
  { id: '3', name: 'Solenga skole', organizationNumber: '000100003', municipality: 'Trondheim', year: 2026, statusId: 4 },
  { id: '4', name: 'Nordmyra barneskole', organizationNumber: '000100004', municipality: 'Tromsø', year: 2026, statusId: 0 },
  { id: '5', name: 'Havblikk ungdomsskole', organizationNumber: '000100005', municipality: 'Stavanger', year: 2026, statusId: 1 },
  { id: '6', name: 'Lindeåsen skole', organizationNumber: '000100006', municipality: 'Drammen', year: 2026, statusId: 2 },
  { id: '7', name: 'Skogstun barneskole', organizationNumber: '000100007', municipality: 'Oslo', year: 2026, statusId: 0 },
  { id: '8', name: 'Elvebakken oppvekstsenter', organizationNumber: '000100008', municipality: 'Trondheim', year: 2026, statusId: 4 },
  { id: '9', name: 'Vestlia ungdomsskole', organizationNumber: '000100009', municipality: 'Bergen', year: 2026, statusId: 2 },
  { id: '10', name: 'Åsly barneskole', organizationNumber: '000100010', municipality: 'Kristiansand', year: 2026, statusId: 1 },
  { id: '11', name: 'Granvik skole', organizationNumber: '000100011', municipality: 'Stavanger', year: 2026, statusId: 4 },
  { id: '12', name: 'Sørenga ungdomsskole', organizationNumber: '000100012', municipality: 'Drammen', year: 2026, statusId: 0 },
  { id: '13', name: 'Fjordgløtt barneskole', organizationNumber: '000100001', municipality: 'Bergen', year: 2025, statusId: 4 },
  { id: '14', name: 'Nordmyra barneskole', organizationNumber: '000100004', municipality: 'Tromsø', year: 2025, statusId: 2 },
  { id: '15', name: 'Solenga skole', organizationNumber: '000100003', municipality: 'Trondheim', year: 2025, statusId: 4 },
]
