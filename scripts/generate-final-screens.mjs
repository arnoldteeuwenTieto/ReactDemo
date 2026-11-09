import fs from 'node:fs'
import { controls } from './inspect-powerapps.mjs'
const clean=s=>(s??'').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'').trim()
const titles={14:{A:'Barn i skolefritidsordningen',B:'Ansatte i skolefritidsordningen',C:'Foreldrebetaling og oppholdstid',D:'Lokale moderasjonsordninger',E:'Elever med inntektsgraderte satser'},15:{A:'Organisering av PP-tjenesten',B:'Samordning med PPT i videregående opplæring',C:'Stillingsgrupper og utdanningsbakgrunn i PP-tjenesten',D:'Kommuner som mottar PPT-tjenester'},16:{A:'Fordrevne ukrainske elever',B:'Forsterket opplæring i norsk',C:'Egne undervisningsgrupper',D:'Morsmålsopplæring og/eller tospråklig opplæring i fag'}}
const choicesLabels={1016:'Har SFO lokale inntektsgraderte satser?',1017:'Har SFO lokale friplasser?',858:'Har SFO søskenmoderasjon?',946:'Har kommunen egen kommunal PP-tjeneste?',947:'Drifter kommunen en interkommunal PP-tjeneste?',948:'Deltar kommunen i en interkommunal PP-tjeneste?',949:'Har PP-tjenesten annen organisering?',951:'Er tjenesten samordnet med PPT i videregående opplæring?'}
const out={},audit={}
for(const section of [14,15,16]){
 const ns=controls[section],map=new Map(ns.map(n=>[n.name,n]));const chain=n=>{const a=[];while(n){a.push(n);n=map.get(n.parent)}return a};const hidden=n=>chain(n).some(a=>/^=\s*false\b/.test(clean(a.props.Visible)));const card=n=>chain(n).find(a=>a.props.Control?.startsWith('DataCard@'))
 const groups=[],fields=[],choices=[]
 for(const [group,title]of Object.entries(titles[section])){
  const owner=ns.find(n=>n.props.Control?.startsWith('DataCard@')&&!hidden(n)&&(n.name===`${section}${group}`||n.name.startsWith(`${group}.`)));if(!owner)throw Error('Missing '+section+group)
  const children=ns.filter(n=>card(n)===owner&&!hidden(n)),header=children.find(n=>n.props.Input_HeaderText)
  groups.push({id:group,title:`${group}. ${title}`,reference:clean(header?.props.Input_HeaderText).match(/BeregnetId\s*=\s*"([^"]+)"/)?.[1]??'',helpId:clean(header?.props.VisDrawer).match(/HjelpetekstId\s*=\s*"([^"]+)"/)?.[1],sourceCard:owner.name,controllers:[...new Set(clean(header?.props.Input_Kontrollere).match(/(?:GG|BK)-[AF]\d+/g)??[])]})
  const numbers=children.filter(n=>/^="\d+"$/.test(n.props.Text??''))
  for(const n of children){
   const raw=clean(n.props.Default??n.props.Text),m=raw.match(/nfSelectedRecord(\d+)\.(GG_[\p{L}\p{N}_]+)/u)
   if(!m||Number(m[1])!==section)continue
   const key=m[2],id=Number(key.match(/^GG_(\d+)/)?.[1])
   if(n.props.Control?.includes('Radio')){choices.push({key,control:n.name,group,label:choicesLabels[id],questionNumber:String(choices.filter(c=>c.group===group).length+1)});continue}
   if(!(n.props.ComponentName==='Local_Comp_Input_Number'||n.props.Control?.includes('TextInput')||n.props.Control?.includes('Label')))continue
   let number;for(const ancestor of chain(n).slice(1)){const labels=numbers.filter(label=>chain(label).includes(ancestor));if(labels.length===1){number=labels[0].props.Text.replace(/\D/g,'');break}}
   let rowLabel='',column='Antall',gradeRange
   const grade=key.match(/Trinn_?(\d+)(?:_(\d+))?/i)
   if(section===14){
    if(group==='A'){const total=id===845||id===851;number=total?'6':grade?grade[2]?'5':grade[1]:'6';rowLabel=total?'Sum barn':grade?grade[2]?'5.–7. trinn':`${grade[1]}. trinn`:'Sum barn';column=/100_Prosent/.test(key)?'Herav med 100 prosent plass':'Barn i SFO'}
    if(group==='B'){rowLabel=['','Lærer- eller barnehagelærerutdanning','Fagbrev i barne- og ungdomsarbeiderfag','Annen kompetanse','Sum ansatte'][Number(number)];column=/Arsverk/.test(key)?'Årsverk':/Kvinner/.test(key)?'Kvinner':/_Menn_|_Menn$/.test(key)?'Menn':'Sum'}
    if(group==='C'){const labels={856:'Månedlig foreldrebetaling for heltidsplass på 1.–3. trinn',1014:'Månedlig foreldrebetaling for heltidsplass på 4. trinn',1015:'Månedlig foreldrebetaling for deltidsplass på 4. trinn',857:'Antall timer for heltidsplass',1020:'Antall timer for deltidsplass'};rowLabel=labels[id];column='Verdi'}
    if(group==='E'){number=grade?grade[1]:'5';rowLabel=grade?`${grade[1]}. trinn`:'Sum elever';column=/Lokale_/.test(key)?'Lokale ordninger':'Nasjonale ordninger'}
   }
   if(section===15){rowLabel=['','Psykologi','Spesialpedagogikk','Pedagogikk','Andre fagstillinger','Ledelse','Merkantilt personell','Sum årsverk'][Number(number)];column='Årsverk'}
   if(section===16){
    if(group==='A'){number=grade&&Number(grade[1])<=10&&!grade[2]?grade[1]:'11';rowLabel=number==='11'?'Sum elever':`${number}. trinn`;column=id>=1002?'Sum':/Mottar_Fullverdig/.test(key)?'Fullverdig opplæringstilbud':'Opphold over tre måneder uten fullverdig opplæringstilbud'}
    if(group==='B'){number='1';rowLabel='Fordrevne ukrainske elever med vedtak om forsterket norskopplæring';column='Elever'}
    if(group==='C'){number='1';rowLabel='Fordrevne ukrainske elever med undervisning i egne undervisningsgrupper';column='Elever'}
    if(group==='D'){number='1';rowLabel='Elever med morsmålsopplæring og/eller tospråklig opplæring';column=id===997?'Bare morsmålsopplæring':id===998?'Både morsmålsopplæring og tospråklig fagopplæring':id===999?'Bare tospråklig fagopplæring':'Annen tilrettelagt opplæring'}
   }
   if(section===14&&id===1041)column='Sum'
   if(section===16&&group==='D'&&id===1001)column='Sum'
   const readOnly=clean(n.props.DisplayMode??n.props.Displaymode).includes('DisplayMode.View')||n.props.Control?.includes('Label')
   const decimal=section===14&&group==='B'&&column==='Årsverk'||section===15&&group==='C'
   if(!number||!rowLabel)throw Error('Unmapped layout '+section+' '+n.name+' '+key)
   if(fields.some(f=>f.key===key))continue
   fields.push({key,control:n.name,group,questionNumber:number,label:rowLabel,rowLabel,column,readOnly:!!readOnly,maxDigits:Number((n.props.MaxLength??n.props.AntallSiffer??'4').replace(/\D/g,''))||4,terms:[],gradeRestricted:!!grade,gradeRange,sourceFormula:raw,...(decimal?{numericKind:'decimal',minimumExclusive:0,maximum:9999,precision:2}:{})})
  }
 }
 // Mock equivalents of explicit sum rows; official SQL computed-column bodies are absent.
 for(const f of fields.filter(f=>f.readOnly)){
  if(section===14&&['A','E'].includes(f.group))f.terms=fields.filter(x=>x.group===f.group&&!x.readOnly&&x.column===f.column).map(x=>({field:x.key,sign:1}))
  if(section===14&&f.group==='B')f.terms=fields.filter(x=>x.group==='B'&&(f.questionNumber==='4'?x.questionNumber!=='4'&&x.column===f.column:!x.readOnly&&x.questionNumber===f.questionNumber&&['Menn','Kvinner'].includes(x.column))).map(x=>({field:x.key,sign:1}))
  if(section===15){f.numericKind='decimal';f.precision=2;f.terms=fields.filter(x=>!x.readOnly).map(x=>({field:x.key,sign:1}))}
  if(section===16&&f.group==='A')f.terms=fields.filter(x=>x.group==='A'&&(f.questionNumber==='11'?x.questionNumber!=='11'&&x.column===f.column:!x.readOnly&&x.questionNumber===f.questionNumber)).map(x=>({field:x.key,sign:1}))
  if(section===16&&f.group==='D')f.terms=fields.filter(x=>x.group==='D'&&!x.readOnly).map(x=>({field:x.key,sign:1}))
 }
 out[section]={groups,fields,choices,controllers:[...new Set(groups.flatMap(g=>g.controllers))]}
 audit[section]={...out[section],fields:fields.map(({sourceFormula,...field})=>field),excluded:ns.filter(n=>hidden(n)&&n.props.Default).map(n=>({control:n.name,card:card(n)?.name}))}
}
fs.writeFileSync('src/domain/finalScreens.json',JSON.stringify(out,null,2)+'\n')
fs.writeFileSync('gsi-react-import/DEL14_15_16_CHECKLIST.json',JSON.stringify(audit,null,2)+'\n')
for(const [s,data]of Object.entries(out))console.log(s,data.groups.map(g=>g.id),data.fields.length,'manual',data.fields.filter(f=>!f.readOnly).length,'choices',data.choices.length)
