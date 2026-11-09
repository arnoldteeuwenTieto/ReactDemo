import fs from 'node:fs'
import { controls } from './inspect-powerapps.mjs'
const clean=s=>(s??'').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'')
const titles={11:{A:'Antall elever med valgfag',B:'Antall elever som tar fag fra videregående i stedet for valgfag',C:'Antall elever uten valgfag',D:'Sum elever med og uten valgfag'},12:{A:'Antall elevtimer til fysisk aktivitet per år',B:'Antall årstimer til fysisk aktivitet',C:'Leksehjelp på 1.–10. trinn'},13:{A:'Skoleskyss',B:'Omdisponering av timetall (25 %-regelen)',C:'Leirskole',D:'Tilgang til skolebibliotek',E:'Tilgang på digitale enheter',F:'Beredskap',G:'Elever som tar fag fra videregående opplæring'}}
const output={},review={}
for(const section of [11,12,13]){
 const ns=controls[section],map=new Map(ns.map(n=>[n.name,n]));const chain=n=>{const a=[];while(n){a.push(n);n=map.get(n.parent)}return a};const hidden=n=>chain(n).some(a=>/^=\s*false\b/.test(clean(a.props.Visible).trim()));const card=n=>chain(n).find(a=>a.props.Control?.startsWith('DataCard@'))
 const groups=[],fields=[];const byControl=Object.fromEntries(ns.map(n=>[n.name,clean(n.props.Default??n.props.Text).match(/\.(GG_[\p{L}\p{N}_]+)/u)?.[1]]))
 for(const [group,title] of Object.entries(titles[section])){
  const owner=ns.find(n=>n.props.Control?.startsWith('DataCard@')&&n.name.startsWith(`${group}.`)&&!hidden(n));if(!owner)throw Error('Missing card '+section+group)
  const children=ns.filter(n=>card(n)===owner&&!hidden(n)),header=children.find(n=>n.props.Input_HeaderText)
  const g={id:group,title:`${group}. ${title}`,reference:clean(header?.props.Input_HeaderText).match(/BeregnetId\s*=\s*"([^"]+)"/)?.[1]??'',helpId:clean(header?.props.VisDrawer).match(/HjelpetekstId\s*=\s*"([^"]+)"/)?.[1],controllers:[...new Set(clean(header?.props.Input_Kontrollere).match(/(?:GG|BK)-[AF]\d+/g)??[])],sourceCard:owner.name}
  if(section===11&&['B','C','D'].includes(group))g.columnGroups=[8,9,10].map(grade=>({title:`${grade}. trinn`,table:`${grade}. trinn`,columns:['Gutter','Jenter','Sum'].map(c=>({fieldColumn:c,label:c}))})).concat([{title:'8.–10. trinn',table:'8.–10. trinn',columns:[{fieldColumn:'Sum',label:'Sum'}]}])
  groups.push(g)
  if(section===11&&group==='A'||section===13&&group==='F')continue
  const nums=children.filter(n=>/^="\d+"$/.test(n.props.Text??''))
  for(const n of children){
   const raw=clean(n.props.Default??n.props.Text),binding=raw.match(/nfSelectedRecord(\d+)\.(GG_[\p{L}\p{N}_]+)/u)
   const numeric=n.props.ComponentName==='Local_Comp_Input_Number'||n.props.Control?.startsWith('Classic/TextInput')||n.props.Control?.includes('Label')
   if(!numeric||!binding&&!(section===11&&group==='D'&&n.props.ComponentName==='Local_Comp_Input_Number'))continue
   // Formula cells have no SQL result column: don't mistake the first operand for a binding.
   const direct=binding&&(/^=\s*nfSelectedRecord\d+\.GG_\w+\s*$/.test(raw)||/^=\s*If\(/.test(raw)&&new Set(raw.match(/GG_\w+/g)).size===1),key=direct?binding[2]:`calculated-${section}-${n.name}`
   if(n.props.Control?.includes('Label')&&!direct)continue
   let number
   for(const a of chain(n).slice(1)){const labels=nums.filter(label=>chain(label).includes(a));if(labels.length===1){number=labels[0].props.Text.replace(/\D/g,'');break}}
   const grade=key.match(/Trinn_?(\d+)(?:_(\d+))?/i),id=Number(key.match(/^GG_(\d+)/)?.[1]);let rowLabel='',column='Sum',table
   if(section===11){number='1';rowLabel=title;const grad=grade&&!grade[2]?grade[1]:null;table=grad?`${grad}. trinn`:'8.–10. trinn';column=/Gutter/.test(key)?'Gutter':/Jenter/.test(key)?'Jenter':'Sum';if(!direct&&group==='D'){const order=Number(n.name.match(/_(\d+)$/)[1])-659;if(order<0||order>9)continue;table=order<9?`${8+Math.floor(order/3)}. trinn`:'8.–10. trinn';column=order<9?['Gutter','Jenter','Sum'][order%3]:'Sum'}}
   if(section===12){if(group==='A'){number=grade?String(Number(grade[1])-4):'4';rowLabel=grade?`${grade[1]}. trinn`:'Sum elevtimer';column='Elevtimer per år'}if(group==='B'){number='1';rowLabel='Årstimer til fysisk aktivitet på 5.–7. trinn';column='Årstimer'}if(group==='C'){number=grade?grade[1]:'11';rowLabel=grade?`${grade[1]}. trinn`:'Sum';column=/Timer/.test(key)?'Timer per uke':'Elever'}}
   if(section===13){if(group==='A'){number='1';rowLabel='Antall elever med skoleskyss';column=id===722?'1. trinn':id===723?'2.–10. trinn':'Sum'}if(group==='B'){number=id===1013?'1':'2';rowLabel=id===1013?'Elever med omdisponert timetall på 1.–7. trinn':'Elever med omdisponert timetall på 8.–10. trinn';column='Elever'}if(group==='C'){number=grade?grade[1]:'11';rowLabel=grade?`${grade[1]}. trinn`:'Sum';column=/H23/.test(key)?'Høst {year}':/V24/.test(key)?'Vår {nextYear}':/V23/.test(key)?'Vår {year}':'Overnattinger'}if(group==='E'){number=/PC_Mac/.test(key)?'1':/Chromebook/.test(key)?'2':/Nettbrett/.test(key)?'3':/Andre_digitale/.test(key)?'4':/Ingen_digitale/.test(key)?'5':binding?.[1]==='3'?'7':'6';rowLabel=['','PC/Mac','Chromebook','Nettbrett','Andre digitale enheter','Ingen digitale enheter','Sum digitale enheter','Elevtall (hentet fra del 3 A)'][Number(number)];column=grade?`${grade[1]}. trinn`:'Sum'}if(group==='G'){number=number??'1';rowLabel=number==='1'?'Elever som tar fag fra videregående i stedet for valgfag':number==='2'?'Elever som tar fag fra videregående i tillegg til ordinært valgfag':'Sum elever';column=grade&&!grade[2]?`${grade[1]}. trinn`:'Sum'}}
   if(section===13&&group==='D'){number='1';rowLabel='Antall timer skolebiblioteket er åpent per uke';column='Timer'}
   // The source binds its fifth device-row total to a misleadingly named PC/Mac column.
   if(section===13&&group==='E'&&id===825){number='5';rowLabel='Ingen digitale enheter'}
   if(section===11&&group==='D'&&direct){const index=Number(n.name.match(/_(\d+)$/)[1])-669;number=String(index+1);rowLabel=['Fransk','Spansk','Italiensk','Russisk','Andre språk','Fordypning engelsk','Fordypning norsk','Fordypning samisk','Arbeidslivsfag','Fordypning matematikk','Fordypning i arbeid','Sum'][index]??'Elever';column='Sum';table='Referanseverdier fra del 10'}
   if(section===13&&group==='G'&&id>=1074){column=id===1077?'Sum':`${id-1066}. trinn`}
   if(!number||!rowLabel)throw Error('Missing layout '+section+' '+n.name)
   const readOnly=!direct||Number(binding[1])!==section||clean(n.props.DisplayMode??n.props.Displaymode).includes('DisplayMode.View')||n.props.Control?.includes('Label')
   let terms=[];const formula=raw.match(/(?:Sum|Value)\(\s*([\w.+\-\s]+)\s*\)/)?.[1];if(formula)terms=[...formula.matchAll(/([+-]?)\s*(\w+)\.(?:Text|SumText)/g)].map(m=>({field:byControl[m[2]]??'',sign:m[1]==='-'?-1:1}));if(terms.some(t=>!t.field))terms=[]
   const field={key,control:n.name,group,questionNumber:number,label:rowLabel,rowLabel,column,table,readOnly:!!readOnly,maxDigits:Number((n.props.MaxLength??n.props.AntallSiffer??'4').replace(/\D/g,''))||4,terms,sourceFormula:raw,sourceSection:direct&&Number(binding[1])!==section?Number(binding[1]):undefined,sqlColumn:direct?key:'',origin:!direct?'calculated':undefined,gradeRestricted:!!grade}
   if(section===13&&group==='B')field.gradeRange=id===1013?[1,7]:[8,10]
   if(section===13&&group==='A')field.gradeRange=id===722?[1,1]:id===723?[2,10]:[1,10]
   if(section===13&&group==='D'){field.requiresChoice='GG_1081_Bibliotekstilbud_Egne_Lokaler';field.minimumExclusive=0;field.maxDigits=2}
   if(section===11&&group==='D'&&!direct){field.terms=[...raw.matchAll(/nfSelectedRecord11\.(GG_\w+)/g)].map(m=>({field:m[1],sign:1}));field.collectionTerms=[...raw.matchAll(/,\s*(GG_\w+)\)/g)].map(m=>m[1])}
   if(!fields.some(f=>f.key===key&&f.group===group))fields.push(field)
  }
 }
 // Reproduce visible sum rows from their verified component operands/bindings.
 for(const f of fields.filter(f=>f.readOnly&&!f.sourceSection&&!f.terms.length)){
  if(section===11&&f.group==='B'&&/GG_69[123]_/.test(f.key))f.terms=fields.filter(x=>x.group==='B'&&!x.readOnly&&x.table===f.table).map(x=>({field:x.key,sign:1}))
  if(section===11&&f.group==='C'&&/GG_6(?:79|82|85)_/.test(f.key))f.terms=fields.filter(x=>x.group==='C'&&!x.readOnly&&x.table===f.table).map(x=>({field:x.key,sign:1}))
  if(section===11&&/GG_(694|686)_/.test(f.key))f.terms=fields.filter(x=>x.group===f.group&&x.readOnly&&x.table!=='8.–10. trinn').map(x=>({field:x.key,sign:1}))
  if(section===12)f.terms=fields.filter(x=>x.group===f.group&&!x.readOnly&&x.column===f.column).map(x=>({field:x.key,sign:1}))
  if(section===13&&f.group==='A')f.terms=fields.filter(x=>x.group==='A'&&!x.readOnly).map(x=>({field:x.key,sign:1}))
  if(section===13&&f.group==='C')f.terms=fields.filter(x=>x.group==='C'&&!x.readOnly&&x.column===f.column).map(x=>({field:x.key,sign:1}))
  if(section===13&&f.group==='E'&&f.column==='Sum')f.terms=fields.filter(x=>x.group==='E'&&x.questionNumber===f.questionNumber&&x.column!=='Sum'&&(!x.readOnly||f.questionNumber==='6')).map(x=>({field:x.key,sign:1}))
  if(section===13&&f.group==='E'&&f.questionNumber==='6'&&f.column!=='Sum')f.terms=fields.filter(x=>x.group==='E'&&!x.readOnly&&x.column===f.column).map(x=>({field:x.key,sign:1}))
  if(section===13&&f.group==='G')f.terms=fields.filter(x=>x.group==='G'&&((Number(f.key.match(/^GG_(\d+)/)?.[1])===1073&&x.questionNumber==='2'&&!x.readOnly)||(f.questionNumber==='3'&&['1','2'].includes(x.questionNumber)&&x.column===f.column))).map(x=>({field:x.key,sign:1}))
 }
 output[section]={groups,fields,controllers:[...new Set(groups.flatMap(g=>g.controllers))]}
 review[section]={groups,fields:fields.map(f=>({key:f.key,control:f.control,group:f.group,question:f.questionNumber,column:f.column,table:f.table,readOnly:f.readOnly,terms:f.terms,sourceSection:f.sourceSection})),backendOwned:fields.filter(f=>f.readOnly&&!f.sourceSection&&!f.terms.length).map(f=>f.key)}
}
fs.writeFileSync('src/domain/additionalScreens.json',JSON.stringify(output,null,2)+'\n')
fs.writeFileSync('gsi-react-import/DEL11_12_13_CHECKLIST.json',JSON.stringify(review,null,2)+'\n')
for(const [s,v]of Object.entries(output))console.log(s,v.groups.map(g=>g.id),v.fields.length,v.fields.filter(f=>!f.readOnly).length)
