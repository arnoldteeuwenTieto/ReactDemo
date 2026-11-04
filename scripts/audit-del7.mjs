import fs from 'node:fs';
import {controls} from './inspect-powerapps.mjs';
const ns=controls[7],byName=new Map(ns.map(n=>[n.name,n]));
const chain=n=>{const a=[];while(n){a.push(n);n=byName.get(n.parent)}return a};
const details=ns.filter(n=>n.props.Control?.startsWith('DataCard@')).map(card=>({name:card.name,props:card.props,controls:ns.filter(n=>chain(n).some(p=>p.name===card.name)).map(n=>({name:n.name,parent:n.parent,...n.props}))}));
fs.writeFileSync('gsi-react-import/DEL7_SOURCE_AUDIT.json',JSON.stringify(details,null,2));
for(const card of details){if(!card.controls.some(n=>n.Input_HeaderText))continue;console.log('\nCARD',card.name,'Y',card.props.Y,'Visible',card.props.Visible);for(const n of card.controls){if(n.Input_HeaderText)console.log('HEADER',n.name,n.Input_HeaderText);if(n.Text&&(!n.Text.includes('LookUp(')||/GG_H32|GG_H62/.test(n.Text)))console.log('TEXT',n.name,n.Text);if(n.Default&&/GG_/.test(n.Default))console.log('FIELD',n.name,n.Default,n.DisplayMode??n.Displaymode);if(n.Visible)console.log('VISIBLE',n.name,n.Visible)}}
