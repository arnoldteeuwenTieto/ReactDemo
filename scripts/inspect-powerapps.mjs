import fs from 'node:fs';
const sections=[3,4,5,6,7,8,9,10,17,18];
const names={3:'Del3',4:'Del4',5:'Del5',6:'Del6',7:'Del7',8:'Del8',9:'Del9',10:'Del10',17:'Del17_Kontroller',18:'Del18_Fullfor'};
const all={};
for(const section of sections){
 const lines=fs.readFileSync(`gsi-react-import/source/${names[section]}${[5,6,7,8,9,10].includes(section)?'':'.powerapps'}.yaml`,'utf8').split(/\r?\n/);const nodes=[];const stack=[];
 for(let i=0;i<lines.length;i++){
  const line=lines[i], indent=line.search(/\S/);const control=line.match(/^\s*- (.+):\s*$/);
  if(control){while(stack.length&&stack.at(-1).indent>=indent)stack.pop();const node={name:control[1],indent,parent:stack.at(-1)?.name,props:{}};nodes.push(node);stack.push(node);continue;}
  if(!stack.length)continue;
  const prop=line.match(/^\s+([\w]+):\s*(.*)$/);if(!prop||['Properties','Children'].includes(prop[1]))continue;
  let value=prop[2];if(/^[|>]/.test(value)){const block=[];while(i+1<lines.length&&(lines[i+1].trim()===''||lines[i+1].search(/\S/)>indent)){block.push(lines[++i].slice(indent+2))}value=block.join('\n')}else if(value.startsWith('"')){try{value=JSON.parse(value)}catch{}}
  stack.at(-1).props[prop[1]]=value;
 }
 all[section]=nodes;
}
export const controls = all;
