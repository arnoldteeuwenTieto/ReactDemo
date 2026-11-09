import { expect, test } from '@playwright/test'
import { calculatedNumberText } from '../src/domain/fieldPresentation'
import { calculateValues } from '../src/domain/importedReporting'
import { emptyDel2 } from '../src/domain/del2'

test('known empty/inapplicable sums are zero; unknown backend and invalid results remain unavailable',()=>{
  expect(calculatedNumberText(0)).toBe('0')
  expect(calculatedNumberText(12)).toBe('12')
  expect(calculatedNumberText(null)).toBe('')
  expect(calculatedNumberText(undefined)).toBe('')
  const grades={...emptyDel2,GG_228_Laveste_Trinn_Paa_Skolen:4,GG_229_Hoeyeste_Trinn_Paa_Skolen:6}
  expect(calculatedNumberText(calculateValues(3,{},grades).GG_39_Antall_Elever_Sum_EleverTotalt)).toBe('0')
  expect(calculatedNumberText(calculateValues(3,{GG_1_Antall_Elever_Trinn1_Gutter:'5'},grades).GG_3_Antall_Elever_Trinn1_Sum)).toBe('0')
  expect(calculatedNumberText(calculateValues(3,{GG_10_Antall_Elever_Trinn4_Gutter:'bad'},grades).GG_12_Antall_Elever_Trinn4_Sum)).toBe('')
  expect(calculatedNumberText(calculateValues(4,{}).GG_1043_Sum_Aarstimer_Trinn1_4)).toBe('')
  expect(calculatedNumberText(calculateValues(10,{}).GG_539_Sum_Tysk_Trinn_8)).toBe('')
  expect(calculatedNumberText(calculateValues(12,{},grades).GG_698_Sum_Elevtimer_Fysisk_Aktivitet)).toBe('0')
})
