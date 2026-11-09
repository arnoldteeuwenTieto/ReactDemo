import type { ImportedReport } from './importedReporting'

// Verified active App.Formulas subset. Null marks malformed/unavailable numeric
// input; blank participates as zero in Sum/Coalesce, without filling editable data.
function number(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return 0
  const parsed = Number(String(value).replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}
function sum(values: unknown[]) {
  const numbers = values.map(number)
  return numbers.some(n => n === null) ? null : (numbers as number[]).reduce((a,b) => a+b,0)
}
function round(value: number, digits: number) { const factor = 10 ** digits; return Math.sign(value) * Math.round((Math.abs(value) + Number.EPSILON) * factor) / factor }
export function lifecycleFormulas(report: ImportedReport) {
  const hours = number(report.numbers[4].GG_79_Sum_Aarstimer_Undervisning_Trinn5_7)
  const frame = number(report.numbers[6].GG_224_Aarsramme_Undervisning_Trinn_1_7)
  const languageRows = report.collections?.['8C'] ?? []
  const keys = ['GG_870_Elever_med_bare_morsmaalsopplaering','GG_871_Elever_med_bare_tospraaklig_fagopplaering','GG_872_Elever_med_baade_morsmaalopplaering_og_tospraaklig_fagopplaering','GG_873_Elever_med_tilrettelagt_opplaering']
  return {
    nfBeregnedeArsverk_Til_Undervisning_Trinn_5_7: hours === null || !frame ? 0 : round(hours / frame,2),
    nfKompetenteLaerereSum: sum([report.numbers[5].GG_217_Antall_Laerere_Kompetente_Trinn_1_7, report.numbers[5].GG_218_Antall_Laerere_Kompetente_Trinn_8_10]),
    nfSum_GG_870FromShadowColGG8SpC: sum(languageRows.map(row=>row[keys[0]])),
    nfSum_GG_871FromShadowColGG8SpC: sum(languageRows.map(row=>row[keys[1]])),
    nfSum_GG_872FromShadowColGG8SpC: sum(languageRows.map(row=>row[keys[2]])),
    nfSum_GG_873FromShadowColGG8SpC: sum(languageRows.map(row=>row[keys[3]])),
    nfSum_GG_874FromShadowColGG8SpC: sum(languageRows.map(row=>Object.hasOwn(row,'GG_874_Sum_Elever_morsmaal_tospraaklig_tilrettelagtopplaering') ? row.GG_874_Sum_Elever_morsmaal_tospraaklig_tilrettelagtopplaering : sum(keys.map(key=>row[key])))),
    nfSum_GG_917FromShadowColGG8SpD: sum((report.collections?.['8D']??[]).map(row=>row.GG_917_Elever_Forstaerket_SpraakOpplaering_Annen_Kommune)),
    nfSum11_13G_Trinn_8: sum([report.numbers[11].GG_1052_Antall_Gutter_Istedenfor_Valgfag_Trinn_8,report.numbers[11].GG_1053_Antall_Jenter_Istedenfor_Valgfag_Trinn_8,report.numbers[13].GG_1070_Antall_Elever_Videregaaende_Ordinaer_Valgfag_13G_Trinn_8]),
    // These are active boolean placeholders in the export, not numerical totals.
    nfSum11_13G_Trinn_9: true, nfSum11_13G_Trinn_10: true, nfSum11_13G_Trinn_8_10: true,
    nfTimetallSum_5_7_A146_A148: sum([report.numbers[3].GG_44_Timetallsfordeling_Trinn5,report.numbers[3].GG_45_Timetallsfordeling_Trinn6,report.numbers[3].GG_46_Timetallsfordeling_Trinn7]),
  }
}
