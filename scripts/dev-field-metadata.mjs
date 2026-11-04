import { controls } from './inspect-powerapps.mjs'
export function fieldMetadataCatalog(){
 const catalog={}
 for(const nodes of Object.values(controls))for(const n of nodes){const raw=n.props.Default??'';const clean=raw.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'');const column=clean.match(/\.(GG_[\p{L}\p{N}_]+|MerknadSkole|MerknadKommune)\b/u)?.[1]??clean.match(/,\s*(GG_[\p{L}\p{N}_]+)\s*\)/u)?.[1];if(!column)continue;const change=(n.props.OnChange??n.props.Onchange??'').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'');const sources=[...change.matchAll(/Patch\(\s*([\w]+)\s*,/g)].map(m=>m[1]).filter(x=>!/^Col|^Shadow/.test(x));const type=change.includes('[.,]')?'decimal':n.props.AntallSiffer||/HeltallsFilter/.test(change)?'integer':undefined;catalog[column]={...catalog[column],column,...(sources[0]?{source:sources[0]}:{}),...(type?{type}:{})}}
 for(const column of ['GG_227_Skolens_Maalform','GG_228_Laveste_Trinn_Paa_Skolen','GG_229_Hoeyeste_Trinn_Paa_Skolen','GG_230_Tilbyr_SFO'])catalog[column]={column}
 return catalog
}
