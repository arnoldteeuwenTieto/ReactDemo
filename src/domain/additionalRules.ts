import { sectionApplicability } from '../components/grunnskoleSections'
import type { Del2Data } from './del2'
export function additionalGroupVisible(section:number,group:string,del2:Del2Data,choices?:Record<string,boolean>) {
  if(section===14)return sectionApplicability(section, del2).state === 'available'
  if(section===15&&group==='C')return choices?.GG_946_Egen_Kommunal_Tjeneste===true||choices?.GG_947_Drifter_Interkommunal_Tjeneste===true
  if(section===15&&group==='D')return choices?.GG_947_Drifter_Interkommunal_Tjeneste===true
  if(section!==12||!['A','B'].includes(group))return true
  const lo=del2.GG_228_Laveste_Trinn_Paa_Skolen,hi=del2.GG_229_Hoeyeste_Trinn_Paa_Skolen
  return lo!==null&&hi!==null&&lo<=7&&hi>=5
}
