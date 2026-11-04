import fs from 'node:fs';
const p='gsi-react-import/DEL8_9_10_SOURCE_AUDIT.json',audit=JSON.parse(fs.readFileSync(p,'utf8'));
const roots={};for(const n of [8,9,10]){const text=fs.readFileSync(`gsi-react-import/source/Del${n}.yaml`,'utf8');const encoded=text.match(/^      OnVisible: (".*")$/m)?.[1];roots[n]=encoded?JSON.parse(encoded):(text.match(/^      OnVisible: [|>].*\r?\n((?:[ \t]{8}.*\r?\n|\r?\n)*)/m)?.[1]??null);}
fs.writeFileSync('gsi-react-import/DEL8_9_10_INITIALIZATION.json',JSON.stringify(roots,null,2));
for(const [n,init]of Object.entries(roots))console.log(n,init?.length??0,'characters; collections', [...new Set(init?.match(/(?:Shadow)?ColGG\w+/g)??[])]);
