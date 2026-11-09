import fs from 'node:fs'
import { controls } from './inspect-powerapps.mjs'
export const clean=s=>(s??'').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'').trim()
const out=[]
for(const section of [14,15,16]){
 const nodes=controls[section],map=new Map(nodes.map(n=>[n.name,n]))
 const chain=n=>{const a=[];while(n){a.push(n);n=map.get(n.parent)}return a}
 for(const n of nodes){const ancestors=chain(n),card=ancestors.find(a=>a.props.Control?.startsWith('DataCard@'));if(!card)continue
  if(n.props.Control?.startsWith('DataCard@')||n.props.Input_HeaderText||/GG_\d/.test(clean(n.props.Default??n.props.DefaultSelectedItems??n.props.Items))||/^="\d+"$/.test(n.props.Text??'')||/^=\s*nfSelectedRecord\d+\.GG_/.test(n.props.Text??''))out.push({section,name:n.name,card:card.name,parent:n.parent,hidden:ancestors.some(a=>/^=\s*false\b/i.test(clean(a.props.Visible))),conditions:ancestors.filter(a=>a.props.Visible).map(a=>({name:a.name,visible:clean(a.props.Visible)})),props:Object.fromEntries(Object.entries(n.props).filter(([k])=>['Control','ComponentName','Input_HeaderText','Input_Kontrollere','Default','Text','Items','DefaultSelectedItems','DisplayMode','Displaymode','OnChange','Onchange','OnCheck','OnUncheck','MaxLength','AntallSiffer','Visible','Y','VisDrawer'].includes(k)).map(([k,v])=>[k,clean(v)]))})
 }
}
fs.writeFileSync('gsi-react-import/DEL14_15_16_SOURCE_AUDIT.json',JSON.stringify(out,null,2)+'\n')
console.log('Read all controls:',[14,15,16].map(n=>[n,controls[n].length]),'audited',out.length)
