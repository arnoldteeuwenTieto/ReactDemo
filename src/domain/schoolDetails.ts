export interface NsrSchoolInformation {
  Navn: string | null
  BeliggenhetsadresseAdresse: string | null
  BeliggenhetsadressePostnummer: string | null
  BeliggenhetsadressePoststed: string | null
  PostadresseAdresse: string | null
  PostadressePostnummer: string | null
  PostadressePoststed: string | null
  EierOrganisasjonsnummer: string | null
  Driftsansvar: string | null
  Telefon: string | null
  Epost: string | null
  Kommunenummer: string | null
  Kommunenavn: string | null
  Fylkesnummer: string | null
  Fylkesnavn: string | null
}

export interface SelectedSchoolIdentity {
  schoolId: string
  Organisasjonsnummer: string
  Ar: number
}

export interface GsiUnitRecord {
  // Numeric persisted form record ID, equivalent to vargblSkjemaStatusId.
  // The existing "demo:..." identifier is not evidence of a persisted record.
  skjemaStatusId: number | null
  NsrEnhet: { EierOrganisasjonsnummer: string | null } | null
}

export interface SchoolDetails {
  selectedSchool: SelectedSchoolIdentity
  nsr: NsrSchoolInformation
  formRecord: GsiUnitRecord
  source: 'local-demo'
}

export function getSchoolOwnerOrganizationNumber(details: SchoolDetails): string | null {
  return (details.formRecord.skjemaStatusId ?? 0) > 0
    ? details.formRecord.NsrEnhet?.EierOrganisasjonsnummer ?? null
    : details.nsr.EierOrganisasjonsnummer
}

export function displaySchoolDetail(value: string | null | undefined): string {
  return value?.trim() ? value : 'Ikke tilgjengelig'
}
