import type { School } from '../mockData'
import type { GsiUnitRecord, NsrSchoolInformation, SchoolDetails } from '../domain/schoolDetails'

export interface SchoolInformationService {
  getSchoolDetails: (school: School) => Promise<SchoolDetails>
}

// Distinct local sources: NSR is keyed by organisation; GSI records by report.
// Values are fictional demo context, never a real NSR lookup. No network/writes.
const nsrRecords = new Map<string, NsrSchoolInformation>()
const gsiRecords = new Map<string, GsiUnitRecord>()

export const mockSchoolInformationService: SchoolInformationService = {
  async getSchoolDetails(school) {
    const nsr: NsrSchoolInformation = nsrRecords.get(school.organizationNumber) ?? {
      Navn: school.name,
      Kommunenavn: school.municipality,
      BeliggenhetsadresseAdresse: null,
      BeliggenhetsadressePostnummer: null,
      BeliggenhetsadressePoststed: null,
      PostadresseAdresse: null,
      PostadressePostnummer: null,
      PostadressePoststed: null,
      EierOrganisasjonsnummer: null,
      Driftsansvar: null,
      Telefon: null,
      Epost: null,
      Kommunenummer: null,
      Fylkesnummer: null,
      Fylkesnavn: null,
    }
    const record = gsiRecords.get(`${school.id}:${school.year}`)
    return {
      selectedSchool: { schoolId: school.id, Organisasjonsnummer: school.organizationNumber, Ar: school.year },
      nsr: { ...nsr },
      formRecord: { skjemaStatusId: record?.skjemaStatusId ?? null, NsrEnhet: record?.NsrEnhet ? { ...record.NsrEnhet } : null },
      source: 'local-demo',
    }
  },
}
