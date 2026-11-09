import { useState, useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { ui } from '../i18n'
import type { School } from '../mockData'
import { schools } from '../mockData'
import { useDemoUser } from '../demoUserContext'
import { getDemoReportPermissions } from '../domain/demoPermissions'
import { applicable, calculateValues, importedScreens, sectionFindings } from '../domain/importedReporting'
import type { NumericSection } from '../domain/importedReporting'
import { getMockReportRevision, mockSkjemaStatusId, subscribeMockReports } from '../services/grunnskoleApi'
import { readImportedReport, saveImportedNumber, saveMunicipalities, saveSupportMunicipalities } from '../services/importedReportService'
import { HelpDrawer } from './HelpDrawer'
import { ImportedQuestionSection, ImportedQuestionTable } from './ImportedQuestionTable'
import { MunicipalityFinancingTable } from './MunicipalityFinancingTable'
import type { QuestionColumnGroup } from './ImportedQuestionTable'
import { LanguageCollectionTable } from './LanguageCollectionTable'
import { languageCollections } from '../domain/languageCollections'
import type { CollectionId } from '../domain/languageCollections'
import { ElectiveTable } from './ElectiveTable'
import { AdditionalChoices } from './AdditionalChoices'
import { saveAdditionalChoice } from '../services/additionalReportService'
import { additionalGroupVisible } from '../domain/additionalRules'
import { finalBooleanQuestions,pptParticipates } from '../domain/finalScreenRules'
import { BooleanSubquestions } from './BooleanSubquestions'
import { PptMunicipalityPicker,PptRecipients } from './PptMunicipalities'
import { saveFinalBoolean,savePptMunicipality,savePptRecipients } from '../services/finalReportService'
import { saveLanguageRows } from '../services/languageReportService'
const competenceColumns: QuestionColumnGroup[] = [
  { title: '1.–7. trinn', table: '1–7. trinn', columns: [
    { fieldColumn: 'Minst 30 studiepoeng', label: 'Minst 30 studiepoeng' }, { fieldColumn: '0–29 studiepoeng', label: '0–29 studiepoeng' }, { fieldColumn: 'Sum', label: 'Sum 1.–7. trinn' },
  ] },
  { title: '8.–10. trinn', table: '8–10. trinn', columns: [
    { fieldColumn: 'Minst 60 studiepoeng', label: 'Minst 60 studiepoeng' }, { fieldColumn: '30–59 studiepoeng', label: '30–59 studiepoeng' }, { fieldColumn: '0–29 studiepoeng', label: '0–29 studiepoeng' }, { fieldColumn: 'Sum', label: 'Sum 8.–10. trinn' },
  ] },
]
const titles = { 3: 'Elever og timer', 4: 'Årstimer', 5: 'Lærere og assistenter', 6: 'Årsverk og ansatte', 7: 'Spesialundervisning', 8: 'Særskilt språkopplæring', 9: 'Opplæringsspråk', 10: 'Fremmedspråk, fordypning eller arbeidslivsfag', 11:'Valgfag', 12:'Fysisk aktivitet og leksehjelp', 13:'Andre opplysninger',14:'Skolefritidsordningen (SFO)',15:'Pedagogisk-psykologisk tjeneste (PPT)',16:'Fordrevne ukrainske elever' }

export function ImportedNumericSection({ school, section }: { school: School; section: NumericSection }) {
  useTranslation('ui')
  useSyncExternalStore(subscribeMockReports, getMockReportRevision)
  const { enabled, selectedUser } = useDemoUser()
  const context = { enabled, user: selectedUser, school }
  const rights = getDemoReportPermissions(context)
  const report = readImportedReport(mockSkjemaStatusId(school))
  const values = calculateValues(section, report.numbers[section], report.del2, report.numbers, report.collections)
  const screen = importedScreens[section]
  const errors = Object.fromEntries(sectionFindings(section,report,school.municipality,rights.edit).filter(f=>f.kind==='error'&&f.field).map(f=>[f.field!,f.message]))
  const [help, setHelp] = useState<{ id: string; trigger: HTMLButtonElement } | null>(null)
  const municipalities = [...new Set(schools.map(item => item.municipality))].sort((a, b) => a.localeCompare(b, 'nb'))
  if (!rights.read) return <><h2>{section}. {ui(titles[section])}</h2><p role="note">{ui('Ingen tilgang')}</p></>
  return <>
    <h2>{section}. {ui(titles[section])}</h2>
    {!rights.edit && <p role="note">{ui('Skrivebeskyttet')}</p>}
    {screen.groups.map(group => {
      if(!additionalGroupVisible(section,group.id,report.del2,report.finalChoices))return null
      const allFields = screen.fields.filter(field => field.group === group.id && !field.hidden)
      const fields = allFields.filter(field=>!(section===13&&group.id==='D'&&!applicable(field,report.del2,report.additionalChoices))&&!(section===11&&group.id==='D'&&field.sourceSection===10))
      const formatColumn=(column:string)=>column==='Høst {year}'?ui('Høst {{year}}',{year:school.year}):column==='Vår {nextYear}'?ui('Vår {{year}}',{year:school.year+1}):column==='Vår {year}'?ui('Vår {{year}}',{year:school.year}):ui(column)
      const competence = section === 5 && group.id === 'D'
      const collectionId = `${section}${group.id}` as CollectionId
      return <ImportedQuestionSection key={group.id} id={`import-${section}-${group.id}`} title={group.title} onHelp={trigger => setHelp({ id: group.helpId ?? group.reference, trigger })}>
        {competence && <p className="imported-competence-description">{ui('Lærere fordelt på antall studiepoeng de har i fagene de underviser i.')}</p>}
        {group.description && <p className="imported-competence-description">{ui(group.description)}</p>}
        {(section===14||section===15)&&<BooleanSubquestions section={section} group={group.id} questions={finalBooleanQuestions[section].choices.filter(q=>q.group===group.id)} values={report.finalChoices??{}} canEdit={rights.edit} onChange={(field,value)=>saveFinalBoolean(context,section,field,value)}/>}
        {section===15&&group.id==='A'&&report.finalChoices?.[pptParticipates]&&<PptMunicipalityPicker value={report.pptMunicipality??''} options={municipalities.filter(m=>m!==school.municipality)} canEdit={rights.edit} onChange={value=>savePptMunicipality(context,value)}/>}
        {section===15&&group.id==='D'&&<PptRecipients rows={report.pptRecipients??[]} options={municipalities.filter(m=>m!==school.municipality)} canEdit={rights.edit} onChange={rows=>savePptRecipients(context,rows)}/>}
        {!!fields.length && (competence ? [''] : group.tables ?? ['']).map(table => <div key={table}>
        {table && <h4 className="imported-table-heading">{ui(table)}</h4>}
        <ImportedQuestionTable formatColumn={formatColumn} rowHeading={competence ? 'Fag' : 'Spørsmål'} columnGroups={competence ? competenceColumns : group.columnGroups} section={section} group={group.id} title={table ? `${ui(group.title)} – ${ui(table)}` : group.title} fields={fields.filter(field => !table || field.table === table)} values={values} answers={report.numbers[section]} canEdit={rights.edit}
          errors={errors} validated={report.checked} businessReason={ui('Skolen har trinn {{lowest}}–{{highest}}. Tilgjengelige trinn styres av del 2 B og C (laveste og høyeste trinn).', { lowest: report.del2.GG_228_Laveste_Trinn_Paa_Skolen ?? '', highest: report.del2.GG_229_Hoeyeste_Trinn_Paa_Skolen ?? '' })}
          isRelevant={field => applicable(field, report.del2, report.additionalChoices)} onChange={(field, value) => saveImportedNumber(context, section, field, value)} /></div>)}
        {section===11&&group.id==='D'&&<ImportedQuestionTable section={section} group={group.id} title="Referanseverdier fra del 10" fields={allFields.filter(field=>field.sourceSection===10)} values={values} answers={report.numbers[section]} canEdit={false} validated={report.checked} businessReason="" isRelevant={()=>true} onChange={()=>{}} />}
        {section===13&&(group.id==='D'||group.id==='F')&&<AdditionalChoices group={group.id} values={report.additionalChoices??{}} canEdit={rights.edit} onChange={(field,value)=>saveAdditionalChoice(context,field,value)}/>}
        {section===11&&group.id==='A'&&<ElectiveTable rows={report.collections?.['11A']??[]} del2={report.del2} canEdit={rights.edit} validated={report.checked} onChange={rows=>saveLanguageRows(context,'11A',rows)}/>}
        {section === 3 && group.id === 'E' && <MunicipalityFinancingTable rows={report.municipalities} municipalities={municipalities} ownMunicipality={school.municipality} canEdit={rights.edit} validated={report.checked} onChange={rows => saveMunicipalities(context, rows)} />}
        {collectionId!=='11A' && languageCollections[collectionId] && <LanguageCollectionTable id={collectionId} rows={report.collections?.[collectionId] ?? []} del2={report.del2} canEdit={rights.edit} validated={report.checked} municipalities={municipalities} ownMunicipality={school.municipality} onChange={rows => saveLanguageRows(context, collectionId, rows)} />}
        {section === 7 && group.id === 'H' && <MunicipalityFinancingTable sectionRef="7H" sqlFields={{choice:'GG_918_Individuell_Tilrettelagt_Opplaering',count:'GG_919_Elever_Individuell_Tilrettelagt_Opplaering'}} rows={(report.supportMunicipalities ?? []).map(row => ({ id: row.id, GG_887_Finansiert_Annen_Kommune: row.GG_918_Individuell_Tilrettelagt_Opplaering, GG_886_Elever_Finansiert_Annen_Kommune: row.GG_919_Elever_Individuell_Tilrettelagt_Opplaering }))} caption="Elever med individuell tilrettelegging fra andre kommuner" countLabel="Elever" rowLabel="Kommune" totalLabel="Sum elever" dependencyReason="Velg kommune i del 7 H før du fyller ut antall elever." municipalities={municipalities} ownMunicipality={school.municipality} canEdit={rights.edit} validated={report.checked} onChange={rows => saveSupportMunicipalities(context, rows.map(row => ({ id: row.id, GG_918_Individuell_Tilrettelagt_Opplaering: row.GG_887_Finansiert_Annen_Kommune, GG_919_Elever_Individuell_Tilrettelagt_Opplaering: row.GG_886_Elever_Finansiert_Annen_Kommune })))} />}
      </ImportedQuestionSection>
    })}
    {help && <HelpDrawer key={help.id} helpId={help.id} returnFocusTo={help.trigger} showReference={false} onClose={() => setHelp(null)} />}
  </>
}
