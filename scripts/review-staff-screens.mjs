import fs from 'node:fs';
import { controls } from './inspect-powerapps.mjs';
const inventory={};
for(const section of [5,6,7]){
 const ns=controls[section],byName=new Map(ns.map(n=>[n.name,n]));
 const ancestorProps=n=>{const list=[];let parent=byName.get(n.parent);while(parent){if(parent.props.Visible||parent.props.DisplayMode)list.push({control:parent.name,Visible:parent.props.Visible,DisplayMode:parent.props.DisplayMode});parent=byName.get(parent.parent)}return list};
 const fields=ns.filter(n=>/nfSelectedRecord\d+\.GG_|ThisItem\.GG_/.test(n.props.Default??n.props.Value??''));
 inventory[section]={controls:ns.length,headers:ns.filter(n=>n.props.Input_HeaderText).map(n=>({name:n.name,...n.props})),fields:fields.map(n=>({name:n.name,...n.props,ancestors:ancestorProps(n)})),visibility:[...new Set(ns.map(n=>n.props.Visible).filter(Boolean))],displayModes:[...new Set(ns.map(n=>n.props.DisplayMode).filter(Boolean))],actions:ns.filter(n=>n.props.OnSelect&&/Patch\(|Collect\(|Remove/.test(n.props.OnSelect)).map(n=>({name:n.name,...n.props}))};
 console.log('SECTION',section,'CONTROLS',ns.length,'FIELDS',fields.length);
 for(const n of inventory[section].headers)console.log('HEADER',n.name,n.Input_HeaderText);
 console.log('VISIBILITY',JSON.stringify(inventory[section].visibility));console.log('MODES',JSON.stringify(inventory[section].displayModes));
 for(const n of fields)console.log('FIELD',n.name,JSON.stringify({default:n.props.Default??n.props.Value,mode:n.props.DisplayMode,format:n.props.Format,maxLength:n.props.MaxLength,change:n.props.OnChange}));
}
fs.writeFileSync('gsi-react-import/DEL5_6_7_SOURCE_REVIEW.json',JSON.stringify(inventory,null,2)+'\n');
