import fs from 'node:fs';
import { controls } from './inspect-powerapps.mjs';
const clean=text=>(text??'').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'');
const headings={
 5:{Comp_liba_DatacardBkgGSI_22:['A','Antall lærere'],Comp_liba_DatacardBkgGSI_23:['B','Annet personale i elevrettet arbeid'],Comp_liba_DatacardBkgGSI_24:['C','Antall ansatte med spesialpedagogisk kompetanse'],Comp_liba_DatacardBkgGSI_25:['D','Kompetansekrav for undervisning'],Comp_liba_DatacardBkgGSI_59:['E','Ansatte som gir individuelt tilrettelagt opplæring']},
 6:{Comp_liba_DatacardBkgGSI_26:['A','Årsverk til lederoppgaver'],Comp_liba_DatacardBkgGSI_27:['B','Årsramme for undervisning'],Comp_liba_DatacardBkgGSI_28:['C','Årsverk utført av annet personale'],Comp_liba_DatacardBkgGSI_71:['D','Beregnede årsverk til undervisning']},
 7:{Comp_liba_DatacardBkgGSI_29:['A','Hvor mange elever får spesialundervisning etter enkeltvedtak?'],Comp_liba_DatacardBkgGSI_30:['C','Faste avdelinger for spesialundervisning'],Comp_liba_DatacardBkgGSI_31:['D','Alternativ opplæringsarena'],Comp_liba_DatacardBkgGSI_32:['E','Organisering av spesialundervisning'],Comp_liba_DatacardBkgGSI_33:['F','Tildelte timer til spesialundervisning med undervisningspersonale'],Comp_liba_DatacardBkgGSI_34:['G','Antall elever som har vedtak om personlig assistanse eller timer med assistent i videreført vedtak om spesialundervisning'],Comp_liba_DatacardBkgGSI_57:['H','Elever med individuell tilrettelegging fra andre kommuner'],Comp_liba_DatacardBkgGSI_63:['B','Individuell tilrettelegging']}
};
const labels={
 '5A':['Antall lærere totalt','Antall kontaktlærere'], '5B':['Utdannings- og yrkesrådgivere','Sosialpedagogiske rådgivere','Assistenter og øvrig elevrettet personale'], '5C':['Ansatte med spesialpedagogisk kompetanse'], '5D':['Norsk','Matematikk','Engelsk','Samisk','Norsk tegnspråk'], '5E':['Ansatte som oppfyller kompetansekravene for lærerstilling','Ansatte med egnet universitets- eller høyskoleutdanning','Ansatte med annen bakgrunn','Sum ansatte som gir individuelt tilrettelagt opplæring'],
 '6A':['Rektor','Undervisningsinspektør / avdelingsleder','Sum årsverk til administrative og pedagogiske lederoppgaver'], '6B':['Årsramme for undervisning'], '6C':['Skolebibliotekarer','Kontorteknisk personale'], '6D':['Beregnede årsverk til undervisning'],
 '7B':['Antall elever – spørsmål 1','Antall elever – spørsmål 2'], '7C':['Elever i faste avdelinger for spesialundervisning'], '7D':['Elever på alternativ opplæringsarena'], '7E':['Hovedsakelig i ordinær klasse','Hovedsakelig i grupper med seks eller flere elever','Hovedsakelig i grupper med to til fem elever','Hovedsakelig alene'], '7F':['Antall elever som får 1–75 timer per år.','Antall elever som får 76–190 timer per år.','Antall elever som får 191–270 timer per år.','Antall elever som får 271 timer eller mer per år.','Sum elever som får timer med undervisningspersonale.'], '7G':['Antall elever som får 1–75 timer per år.','Antall elever som får 76–190 timer per år.','Antall elever som får 191–270 timer per år.','Antall elever som får 271 timer eller mer per år.','Sum elever som får timer med assistent.'],
};
const result={};const review={};
for(const section of [5,6,7]){
 const ns=controls[section],byName=new Map(ns.map(n=>[n.name,n]));
 const ancestors=n=>{const a=[];let p=n;while(p){a.push(p);p=byName.get(p.parent)}return a};
 const numberNodes=ns.filter(n=>/^="\d+"$/.test(n.props.Text??''));
 const question=n=>{for(const ancestor of ancestors(n).slice(1)){const found=numberNodes.filter(node=>ancestors(node).some(p=>p.name===ancestor.name));if(found.length===1)return found[0].props.Text.replace(/\D/g,'')}return ''};
 const binding=n=>clean(n.props.Default??n.props.Value??n.props.Text).match(new RegExp(`nfSelectedRecord${section}\\.(GG_[\\p{L}\\p{N}_]+)`,'u'))?.[1];
 const keyByControl=Object.fromEntries(ns.filter(binding).map(n=>[n.name,binding(n)]));
 let group='';const groups=[],fields=[],excluded=[];
 for(const n of ns){
  if(headings[section][n.name]){const [id,title]=headings[section][n.name];group=id;const references=[...clean(n.props.Input_HeaderText).matchAll(/BeregnetId\s*=\s*"([^"]+)"/g)];groups.push({id,title:`${id}. ${title}`,reference:references.at(-1)?.[1]??'',tables:section===5&&id==='D'?['1–7. trinn','8–10. trinn']:undefined});}
  const key=binding(n);if(!key)continue;
  const hidden=ancestors(n).some(p=>/^=\s*false\b/i.test(clean(p.props.Visible)));
  const readOnly=(n.props.DisplayMode??n.props.Displaymode??'').includes('DisplayMode.View')||n.props.Control?.startsWith('Label@');
  const number=question(n)||key.match(/_Rad_(\d+)$/)?.[1]||'1';
  const change=clean(n.props.OnChange??n.props.Onchange);
  const decimal=/IsMatch\(/.test(change)&&change.includes('[.,]');
  const backendDecimal=section===6&&group==='D';
  const raw=n.props.Default??n.props.Value??n.props.Text;
  const formula=readOnly&&!n.props.Control?.startsWith('Label@')?raw.match(/(?:Sum|Value)\(\s*([\w.+\-\s]+)\s*\)/)?.[1]:null;
  let terms=formula?[...formula.matchAll(/([+-]?)\s*(\w+)\.Text/g)].map(m=>({field:keyByControl[m[2]]??'',sign:m[1]==='-'?-1:1})):[];
  if(terms.some(term=>!term.field))terms=[];
  const grade=key.match(/_Trinn_?(\d+)(?:_(\d+))?/i);const band=grade?`${grade[1]}${grade[2]?'–'+grade[2]:''}. trinn`:null;
  let column=section===7&&group==='A'?(/_Gutter_/.test(key)?'Gutter':/_Jenter_/.test(key)?'Jenter':'Sum')
   :/_Menn(?:_|$)/.test(key)?'Menn':/_Kvinner(?:_|$)/.test(key)?'Kvinner':/_Gutter(?:_|$)/.test(key)?'Gutter':/_Jenter(?:_|$)/.test(key)?'Jenter':band??(section===6&&group!=='B'?'Årsverk':'Sum');
  let table;
  if(section===5&&group==='D'){table=band;column=/Min_30/.test(key)?'Minst 30 studiepoeng':/Min_60/.test(key)?'Minst 60 studiepoeng':/30_59/.test(key)?'30–59 studiepoeng':/0_29/.test(key)?'0–29 studiepoeng':'Sum';}
  if(section===5&&group==='E')column='Antall ansatte';
  if(section===7&&group==='B'){table=/^GG_101[89]_/.test(key)?'Totalt':/_Uten_/.test(key)?'Uten individuelt tilrettelagt opplæring':'Med individuelt tilrettelagt opplæring';column=/_Gutter_/.test(key)?'Gutter':/_Jenter_/.test(key)?'Jenter':'Sum';}
  const rowLabel=section===7&&group==='A'?(Number(number)===11?'Sum elever':`${number}. trinn`):labels[`${section}${group}`]?.[Number(number)-1]??'Antall';
  if(hidden)excluded.push({control:n.name,key,reason:'Visible=false on control/ancestor'});
  fields.push({key,control:n.name,group,questionNumber:number,label:rowLabel,rowLabel,column,table,readOnly,hidden,gradeRestricted:section===7&&group==='A',excludeInapplicableFromSums:section===7&&group==='A',maxDigits:Number((n.props.MaxLength??n.props.AntallSiffer??'4').replace(/\D/g,''))||4,numericKind:decimal||backendDecimal?'decimal':'integer',minimumExclusive:decimal?0:undefined,maximum:decimal?9999:undefined,precision:decimal||/^=Round\(/.test(raw)?2:undefined,terms,sourceFormula:raw});
 }
 if(section===7){
  for(const g of groups){
   const header=ns.find(n=>headings[7][n.name]?.[0]===g.id);
   let card=byName.get(header.parent);while(card&&!card.props.Control?.startsWith('DataCard@'))card=byName.get(card.parent);
   g.sourceCard=card?.name;g.sourceOrder=Number(card?.props.Y?.replace('=',''));
   if(!g.sourceCard || !(g.sourceCard.startsWith(`${g.id}.`) || g.sourceCard===`7${g.id}`))throw new Error(`Del 7 ${g.id}: source DataCard mismatch`);
   g.textReferences=[...new Set(ns.filter(n=>ancestors(n).some(a=>a.name===card?.name)).flatMap(n=>[...(n.props.Text??'').matchAll(/BeregnetId\s*=\s*"([^"]+)"/g)].map(m=>m[1])))];
   g.controllers=[...new Set((header.props.Input_Kontrollere??'').match(/(?:GG|BK)-[AF]\d+/g)??[])];
  }
  const b=groups.find(g=>g.id==='B');
  b.columnGroups=[{title:'Med individuelt tilrettelagt opplæring',table:'Med individuelt tilrettelagt opplæring',columns:['Gutter','Jenter','Sum'].map(x=>({fieldColumn:x,label:x}))},{title:'Uten individuelt tilrettelagt opplæring',table:'Uten individuelt tilrettelagt opplæring',columns:['Gutter','Jenter','Sum'].map(x=>({fieldColumn:x,label:x}))},{title:'Totalt',table:'Totalt',columns:[{fieldColumn:'Sum',label:'Sum'}]}];
  const h=groups.find(g=>g.id==='H');h.description='Registrer kommune og antall elever med individuell tilrettelegging fra andre kommuner.';
  for(const field of fields){if(/^\d+–\d+\. trinn$/.test(field.column))field.column=field.column.replace('–','.–');}
 }
 const deduplicated=[];for(const f of fields){const index=deduplicated.findIndex(other=>other.key===f.key&&other.group===f.group&&other.hidden===f.hidden);if(index===-1)deduplicated.push(f);else excluded.push({control:f.control,key:f.key,reason:'Repeated view of same bound value'});}
 result[section]={groups:groups.sort((a,b)=>a.id.localeCompare(b.id)),fields:deduplicated,controllers:[...new Set(ns.flatMap(n=>Object.values(n.props).join('\n').match(/GG-[AF]\d+/g)??[]))].sort()};
 review[section]={groups:result[section].groups,visibleFields:deduplicated.filter(f=>!f.hidden).length,hidden:excluded,backendOwned:deduplicated.filter(f=>!f.hidden&&f.readOnly&&!f.terms.length).map(f=>f.key),decimal:deduplicated.filter(f=>f.numericKind==='decimal').map(f=>({key:f.key,max:f.maximum,minExclusive:f.minimumExclusive,precision:f.precision})),controllers:result[section].controllers};
}
fs.writeFileSync('src/domain/staffScreens.json',JSON.stringify(result,null,2)+'\n');fs.writeFileSync('gsi-react-import/DEL5_6_7_CHECKLIST.json',JSON.stringify(review,null,2)+'\n');console.log(JSON.stringify(review,null,2));
