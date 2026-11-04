import fs from 'node:fs';
import { controls } from './inspect-powerapps.mjs';
const humanize=s=>s.replace(/^GG_\d+_/, '').replaceAll('_',' ').replace(/([a-z])([A-Z])/g,'$1 $2').replaceAll('Aarstimer','Årstimer').replaceAll('Antall','Antall').replaceAll('Hoey','Høy').replaceAll('Asylsoekere','Asylsøkere').replaceAll('Tegnspraak','Tegnspråk').replaceAll('Opplaering','Opplæring');
const data={};
for(const section of [3,4]){
 const ns=controls[section];const keyOf=n=>(n.props.Default??'').match(/(?:nfSelectedRecord\d+|ThisItem)\.(GG_\w+)/)?.[1];
 const byName=new Map(ns.map(n=>[n.name,n]));
 const isDescendant=(node,ancestor)=>{let current=node;while(current){if(current.name===ancestor)return true;current=byName.get(current.parent)}return false};
 const numberLabels=ns.filter(n=>/^="\d+"$/.test(n.props.Text??''));
 const questionNumber=node=>{let parent=byName.get(node.parent);while(parent){const labels=numberLabels.filter(label=>isDescendant(label,parent.name));if(labels.length===1)return labels[0].props.Text.replace(/\D/g,'');parent=byName.get(parent.parent)}return ''};
 const keyByControl=Object.fromEntries(ns.filter(keyOf).map(n=>[n.name,keyOf(n)]));let current='';const fields=[];const groups=[];
 for(const n of ns){
  if(n.props.Input_HeaderText){let title=n.props.Input_HeaderText.match(/\/\/"\s*([^"\n]+)"/)?.[1]??'';const ref=n.props.Input_HeaderText.match(/BeregnetId\s*=\s*"([^"]+)"/)?.[1]??'';
   if(section===3&&ref==='GG_H13_U16')title='F. Hjemmeundervisning';if(section===3&&ref==='GG_H60_U17')title='G. Elever som ikke har møtt ved skolestart';current=title[0];groups.push({id:current,title,reference:ref});
  }
  const key=keyOf(n);if(!key||key.includes('GG_886_'))continue;
  const readOnly=(n.props.DisplayMode??'').includes('DisplayMode.View');const formula=(n.props.Default??'').match(/(?:Sum|Value)\(\s*([\w.+\-\s]+)\s*\)/)?.[1];let terms=[];
  if(readOnly&&formula){terms=[...formula.matchAll(/([+-]?)\s*(\w+)\.Text/g)].map(m=>({field:keyByControl[m[2]]??'',sign:m[1]==='-'?-1:1}));if(terms.some(t=>!t.field))terms=[];}
  fields.push({key,control:n.name,group:current,questionNumber:questionNumber(n),label:humanize(key),readOnly,maxDigits:Number((n.props.MaxLength??'=6').replace('=',''))||6,terms,sourceFormula:n.props.Default});
 }
 data[section]={groups:groups.sort((a,b)=>a.id.localeCompare(b.id)),fields,controllers:[...new Set(ns.flatMap(n=>Object.values(n.props).join('\n').match(/GG-[AF]\d+/g)??[]))].sort()};
}
fs.writeFileSync('src/domain/importedScreens.json',JSON.stringify(data,null,2)+'\n');
console.log(Object.fromEntries(Object.entries(data).map(([s,d])=>[s,{fields:d.fields.length,groups:d.groups.length,calculated:d.fields.filter(f=>f.readOnly&&f.terms.length).length,unknown:d.fields.filter(f=>f.readOnly&&!f.terms.length).map(f=>f.key)}])));
