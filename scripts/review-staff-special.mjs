import fs from 'node:fs';import {controls} from './inspect-powerapps.mjs';
let out='';const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'');
for(const section of [5,6,7]){out+='SECTION '+section+'\n';for(const n of controls[section]){
if(section===6&&/GG_/.test(n.props.Text??''))out+=JSON.stringify({name:n.name,props:n.props})+'\n';
if(n.props.Control==='CanvasComponent'&&!n.props.Input_HeaderText&&(/GG_/.test(JSON.stringify(n.props))))out+=JSON.stringify({name:n.name,props:n.props})+'\n';
if(section===6&&n.props.OnChange)out+=n.name+' CHANGE '+strip(n.props.OnChange)+'\n';
} }
fs.writeFileSync('gsi-react-import/staff-special.txt',out);
