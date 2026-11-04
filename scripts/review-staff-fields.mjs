import fs from 'node:fs';import {controls} from './inspect-powerapps.mjs';let out='';
for(const s of [5,6,7]){let group='';out+='\nSECTION '+s+'\n';for(const n of controls[s]){
if(n.props.Input_HeaderText){group=n.name;out+='HEADER '+group+' '+n.props.Input_HeaderText.replaceAll('\n',' ')+'\n'}
if(/\.GG_/.test(n.props.Default??''))out+=n.name+' | '+n.props.Default.replaceAll('\n',' ')+' | '+(n.props.DisplayMode??'')+' | '+(n.props.OnChange??'').match(/(?:HeltallsFilter|\w*[Dd]esimal\w*|TallFilter)\([^\n]*\)/g)?.join(' / ')+'\n';
} out+='Visibility '+JSON.stringify([...new Set(controls[s].map(n=>n.props.Visible).filter(Boolean))])+'\n';out+='Items '+JSON.stringify(controls[s].filter(n=>n.props.Items).map(n=>({name:n.name,Items:n.props.Items})))+'\n'}
fs.writeFileSync('gsi-react-import/staff-fields.txt',out);
