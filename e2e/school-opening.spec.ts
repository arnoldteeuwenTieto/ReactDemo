import { test, expect, type Page } from '@playwright/test'
import { schools } from '../src/mockData'
import { demoUsers } from '../src/demoUser'
import { openSchool, type SchoolOpeningAdapter } from '../src/services/schoolOpeningService'
import { clearOpeningPolicy, openingKey } from '../src/domain/reportOpeningPolicy'
import { canEditDemoReport, getDemoReportPermissions } from '../src/domain/demoPermissions'
import { getMockReportRevision, patchMockSection, readMockSection, grunnskoleSave } from '../src/services/grunnskoleApi'
import { readImportedReport, saveImportedNumber, saveMunicipalities, saveControllerComment, saveRemark, markMockChecked, performMockAction } from '../src/services/importedReportService'
import { importedScreens } from '../src/domain/importedReporting'
import { createApplicationConfiguration, initializeApplication } from '../src/services/applicationInitialization'
import { initializeReporting } from '../src/services/reportingInitialization'
import { lifecycleFormulas } from '../src/domain/lifecycleFormulas'
import { isWithinReportingPeriod } from '../src/domain/reportOpeningPolicy'
import { nbHelpTexts } from '../src/locales/gsiHelp'

const school = schools.find(s => s.id === '1' && s.year === 2026)!
const key = openingKey(school)
const context = { enabled: true, user: demoUsers[0], school }
const adapter: SchoolOpeningAdapter = {
  async findExisting(s) { return { skjemaStatusId: openingKey(s), schoolId: s.id, year: s.year } },
  async load(form) { return readImportedReport(form.skjemaStatusId) },
}
test.afterEach(() => { for (const s of schools) clearOpeningPolicy(openingKey(s)); clearOpeningPolicy('demo:lifecycle-new:2026') })

for (const user of demoUsers) test(`${user.id}: view preserves status, children and comments and rejects every write path`, async () => {
  clearOpeningPolicy(key)
  patchMockSection(key, 2, { GG_228_Laveste_Trinn_Paa_Skolen: 1, GG_229_Hoeyeste_Trinn_Paa_Skolen: 10 })
  patchMockSection(key, 3, { municipalities: [{ id: 'stable-child', GG_887_Finansiert_Annen_Kommune: 'Oslo', GG_886_Elever_Finansiert_Annen_Kommune: '3' }] })
  patchMockSection(key, 17, { comments: { existing: 'Behold' } })
  const before = readImportedReport(key), revision = getMockReportRevision()
  const ctx = { ...context, user }
  const session = await openSchool(ctx, 'view', { adapter })
  expect(session.mode).toBe('view'); expect(session.statusId).toBe(1)
  expect(session.skjemaStatusId).toBe(key)
  expect(session.report).toEqual(before)
  expect(canEditDemoReport(ctx)).toBe(false)
  expect(getDemoReportPermissions(ctx)).toEqual({ read: true, edit: false, submit: false, approve: false, reject: false })
  const field = importedScreens[3].fields.find(f => !f.readOnly)!
  expect(saveImportedNumber(ctx, 3, field.key, '9')).toBe(false)
  expect(saveMunicipalities(ctx, [])).toBe(false)
  expect(saveControllerComment(ctx, 'existing', 'Changed')).toBe(false)
  expect(saveRemark(ctx, 'MerknadSkole', 'Changed')).toBe(false)
  expect(markMockChecked(ctx)).toBe(false)
  expect(performMockAction(ctx, 'reject')).toBeNull()
  expect(() => patchMockSection(key, 3, {})).toThrow(/skrivebeskyttet/)
  await expect(grunnskoleSave(key, 2, { GG_230_Tilbyr_SFO: true })).rejects.toThrow(/skrivebeskyttet/)
  expect(getMockReportRevision()).toBe(revision)
  expect(readImportedReport(key)).toEqual(before)
})

test('edit and view are explicit; period, rejected status, missing ID and access are independently enforced', async () => {
  await openSchool(context, 'edit', { adapter }); expect(canEditDemoReport(context)).toBe(true)
  await openSchool(context, 'view', { adapter }); expect(canEditDemoReport(context)).toBe(false)
  await openSchool(context, 'edit', { adapter }); expect(canEditDemoReport(context)).toBe(true)
  const period = { startsAt: '2000-01-01T00:00:00Z', endsAt: '2000-12-31T23:59:59Z' }
  await expect(openSchool(context, 'edit', { period, adapter })).rejects.toThrow(/rapporteringsperiode/)
  const revision = getMockReportRevision()
  const rejected = { ...context, school: { ...school, statusId: 3 } }
  expect((await openSchool(rejected, 'view', { period, adapter })).statusId).toBe(3)
  await expect(openSchool(rejected, 'edit', { adapter })).rejects.toThrow()
  const missing = { ...adapter, async findExisting() { return null } }
  await expect(openSchool(context, 'view', { adapter: missing })).rejects.toThrow(/SkjemaStatusId/)
  await expect(openSchool({ ...context, user: null }, 'view', { adapter })).rejects.toThrow(/lesetilgang/)
  await expect(openSchool({ ...context, enabled: false }, 'view', { adapter })).rejects.toThrow(/lesetilgang/)
  await expect(openSchool({ ...context, school: schools.find(s => s.id === '5')! }, 'view', { adapter })).rejects.toThrow(/lesetilgang/)
  await expect(openSchool(context, 'view', { adapter, isCurrent: () => false })).rejects.toThrow(/avbrutt/)
  expect(getMockReportRevision()).toBe(revision)
  expect(readMockSection(key, 17).comments).toEqual({ existing: 'Behold' })
})

test('municipal central flag resolves effective access without changing actual role', async () => {
  const central = schools.find(s => s.id === '17')!
  const ctx = { ...context, user: demoUsers[1], school: central }
  const session = await openSchool(ctx, 'edit', { adapter })
  expect(session.school.isKommunesentralt).toBe(true); expect(ctx.user.roleId).toBe(10)
  expect(getDemoReportPermissions(ctx).edit).toBe(true)
  await openSchool(ctx, 'view', { adapter }); expect(getDemoReportPermissions(ctx).edit).toBe(false)
  await expect(openSchool({ ...ctx, school }, 'edit', { adapter })).rejects.toThrow()
  expect((await openSchool({ ...ctx, school: { ...school, statusId: 2 } }, 'view', { adapter })).statusId).toBe(2)
})

test('startup is configurable, language-aware and does not automatically bypass a reporting period', async () => {
  const base = { environment: 'QA', demoEnabled: true, year: '2026', language: 'nn', startsAt: '2000-01-01', endsAt: '2000-12-31', demoPeriodOverride: true }
  const config = await initializeApplication({ async load() { return createApplicationConfiguration(base) } })
  expect(config.reportingYear).toBe(2026);expect(config.language).toBe('nn');expect(config.environment).toBe('QA')
  expect(config.features.demoPeriodOverride).toBe(false);expect(isWithinReportingPeriod(config.period)).toBe(false)
  expect(createApplicationConfiguration({...base,environment:'DEV'}).period).toBeNull()
  expect(createApplicationConfiguration({...base,environment:'DEV',demoEnabled:false}).period).not.toBeNull()
  expect(createApplicationConfiguration({...base,environment:'DEV',demoPeriodOverride:false}).period).not.toBeNull()
  expect(createApplicationConfiguration({environment:'PROD',demoEnabled:false,newFeature:true}).features.newFeature).toBe(false)
  expect(()=>createApplicationConfiguration({...base,year:'unknown'})).toThrow(/rapporteringsår/)
  await expect(initializeApplication({ async load() { throw new Error('Configuration unavailable') } })).rejects.toThrow('Configuration unavailable')
  expect(isWithinReportingPeriod({startsAt:'2026-11-04',endsAt:'2026-11-04'},new Date(2026,10,4,23,59).getTime())).toBe(true)
})

test('new mock form initialization is idempotent, applies only creation defaults and preserves its returned ID', async () => {
  const fresh = {...school,id:'lifecycle-new',statusId:0}
  const ctx = {...context,school:fresh,user:{...demoUsers[0],mockAccessScope:{...demoUsers[0].mockAccessScope,schoolIds:['lifecycle-new']}}}
  await expect(openSchool(ctx,'view')).rejects.toThrow(/SkjemaStatusId/)
  const created = await openSchool(ctx,'edit')
  expect(created.statusId).toBe(1);expect(created.skjemaStatusId).toBe('demo:lifecycle-new:2026')
  expect(created.report.numbers[6].GG_224_Aarsramme_Undervisning_Trinn_1_7).toBe(741)
  expect(created.report.numbers[6].GG_225_Aarsramme_Undervisning_Trinn_8_10).toBe(656)
  const revision = getMockReportRevision()
  const again = await openSchool(ctx,'edit')
  expect(again.skjemaStatusId).toBe(created.skjemaStatusId);expect(again.statusId).toBe(1)
  expect(getMockReportRevision()).toBe(revision)
})

test('only edit mode resets explicitly supported rejected/corrected statuses; existing answers are preserved',async()=>{
  for(const statusId of [3,5,7]){
    clearOpeningPolicy(key)
    patchMockSection(key,6,{GG_224_Aarsramme_Undervisning_Trinn_1_7:700})
    const ctx={...context,school:{...school,statusId}}
    expect((await openSchool(ctx,'view')).statusId).toBe(statusId)
    const edit=await openSchool(ctx,'edit')
    expect(edit.statusId).toBe(1);expect(edit.report.numbers[6].GG_224_Aarsramme_Undervisning_Trinn_1_7).toBe(700)
  }
})

test('Innledning initialization preserves child IDs, comments and blank values without persisting shadow/placeholder rows',async()=>{
  clearOpeningPolicy(key)
  patchMockSection(key,8,{ColGG8SpC:[{id:'stable-language',GG_869_Morsmaal:'Samisk',GG_870_Elever_med_bare_morsmaalsopplaering:'2'}]})
  patchMockSection(key,9,{ColGG9SpC:[{id:'stable-sami',GG_915_Opplaering_Samisk_Kvensk_Finsk:'Samisk'}]})
  patchMockSection(key,11,{ColGG11SpA:[{id:'stable-elective',GG_875_Valgfag:'Programmering'}]})
  patchMockSection(key,15,{ColGG15SpD:[{id:'stable-ppt',KommuneNavn:'Oslo'}]})
  await openSchool(context,'view',{adapter})
  const revision=getMockReportRevision(),before=readImportedReport(key)
  const initialized=await initializeReporting(context,'nb',{ async getHelpText(id) { return nbHelpTexts[id] } })
  expect(initialized.comments).toEqual(before.comments)
  expect(initialized.shadow.collections?.['8C']?.[0].id).toBe('stable-language')
  expect(initialized.shadow.collections?.['9C']?.[0].id).toBe('stable-sami')
  expect(initialized.shadow.collections?.['11A']?.[0].id).toBe('stable-elective')
  expect(initialized.shadow.pptRecipients?.[0].id).toBe('stable-ppt')
  expect(initialized.helpTexts.length).toBeGreaterThan(0)
  expect(getMockReportRevision()).toBe(revision);expect(readImportedReport(key)).toEqual(before)
  await expect(initializeReporting({...context,user:null},'nb',{ async getHelpText(id) { return nbHelpTexts[id] } })).rejects.toThrow(/lesetilgang/)
  const report=structuredClone(before)
  report.numbers[4].GG_79_Sum_Aarstimer_Undervisning_Trinn5_7='1000'
  report.numbers[6].GG_224_Aarsramme_Undervisning_Trinn_1_7='741'
  expect(lifecycleFormulas(report).nfBeregnedeArsverk_Til_Undervisning_Trinn_5_7).toBe(1.35)
  expect(lifecycleFormulas(report).nfSum_GG_870FromShadowColGG8SpC).toBe(2)
})

async function openFromOverview(page: Page, view: boolean) {
  await page.goto('./')
  if (view) await page.getByText('Demokontekst', { exact: true }).click()
  if (view) await page.getByRole('combobox', { name: 'Åpningsmodus', exact: true }).selectOption('view')
  await page.getByRole('button', { name: `${view ? 'Se' : 'Åpne'} skjema for Fjordgløtt barneskole, 2026`, exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Innledning', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Gå til rapporteringen', exact: true }).click()
}

test('school leader can explicitly view: Del 2, numeric fields, child actions and statuses stay read-only after user switching', async ({ page }) => {
  await openFromOverview(page, true)
  await expect(page.getByRole('combobox', { name: 'Demonstrasjonsstatus', exact: true })).toBeDisabled()
  await page.getByRole('navigation', { name: 'Grunnskoleseksjoner', exact: true }).getByRole('button', { name: 'Om skolen', exact: true }).click()
  for (const radio of await page.getByRole('main').getByRole('radio').all()) await expect(radio).toBeDisabled()
  await page.getByRole('combobox', { name: 'Demonstrasjonsbruker DEMO', exact: true }).selectOption('demo-owner-central')
  for (const radio of await page.getByRole('main').getByRole('radio').all()) await expect(radio).toBeDisabled()
  await page.getByRole('navigation', { name: 'Grunnskoleseksjoner', exact: true }).getByRole('button', { name: 'Elever og timer', exact: true }).click()
  await expect(page.getByRole('main').locator('input:not([readonly]):not(:disabled)')).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Legg til kommune/ })).toBeDisabled()
  await page.getByRole('navigation', { name: 'Grunnskoleseksjoner', exact: true }).getByRole('button', { name: 'Kontroller', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Kontroller skjema', exact: true })).toBeDisabled()
})

test('school leader edit opening retains editable Del 2 controls', async ({ page }) => {
  await openFromOverview(page, false)
  await page.getByRole('button', { name: 'Neste', exact: true }).click()
  await expect(page.getByRole('group', { name: 'D. Har skolen tilbud om SFO?', exact: true }).getByRole('radio', { name: 'Ja', exact: true })).toBeEnabled()
})

import { openingModeTests } from './helpers/openingMode'
openingModeTests()
