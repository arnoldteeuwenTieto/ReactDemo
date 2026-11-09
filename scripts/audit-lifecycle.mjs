import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
const folder = 'gsi-react-import/lifecycle/'
function activeText(source) {
  source = source.replaceAll('&#x20;', ' ').replaceAll('/\\*', '/*').replaceAll('\\*/', '*/')
  let result = '', quote = '', comment = ''
  for (let i = 0; i < source.length; i++) {
    const c = source[i], next = source[i + 1]
    if (comment) {
      if (comment === 'line' && c === '\n') comment = ''
      else if (comment === 'block' && c === '*' && next === '/') { result += '  '; i++; comment = ''; continue }
      result += c === '\n' ? '\n' : ' '; continue
    }
    if (quote) {
      result += c
      if (c === quote) { if (next === quote) { result += next; i++ } else quote = '' }
    } else if (c === '"' || c === "'") { quote = c; result += c }
    else if (c === '/' && next === '/') { comment = 'line'; result += '  '; i++ }
    else if (c === '/' && next === '*') { comment = 'block'; result += '  '; i++ }
    else result += c
  }
  return result
}
const sources = readdirSync(folder).sort().map(name => {
  const raw = readFileSync(folder + name, 'utf8')
  const decoded = name.endsWith('.yaml') ? JSON.parse(raw.match(/OnSelect: (".*")/)[1]).replace(/^=/, '') : raw
  const active = activeText(decoded)
  return { name, sha256: createHash('sha256').update(raw).digest('hex'), active, activeLineCount: active.split('\n').filter(s => s.trim()).length }
})
const formulas = sources.find(s => s.name === 'App.Formulas.txt').active
const statements = []
let begin = 0, depth = 0, quote = ''
for (let i = 0; i < formulas.length; i++) {
  const c = formulas[i]
  if (quote) { if (c === quote) { if (formulas[i+1] === quote) i++; else quote = '' } }
  else if (c === '"' || c === "'") quote = c
  else if ('([{'.includes(c)) depth++
  else if (')]}'.includes(c)) depth--
  else if (c === ';' && depth === 0) { statements.push({ text: formulas.slice(begin, i), offset: begin }); begin = i + 1 }
}
statements.push({ text: formulas.slice(begin), offset: begin })
const catalog = statements.flatMap(statement => {
  const m = statement.text.match(/^\s*([A-Za-z][\w]*)\s*=/)
  if (!m) return []
  const expression = statement.text.slice(m[0].length).trim()
  const name = m[1]
  const category = /^Statussteg|nfTotalStatus/.test(name) ? 'section-status' : /^(nf)?GG_?[AF]|kontroll/i.test(name) ? 'validation' : /Session|User|Role|Tilgang|DisplayMode/.test(name) ? 'authorization' : /ViewSprak|Tekst|Hjelp/.test(name) ? 'translation' : /SelectedRecord|LookupNSR/.test(name) ? 'backend-record' : /Sum|sum|Tot|Beregn|Antall/.test(name) ? 'calculation' : 'shared'
  return [{ name, category, line: formulas.slice(0, statement.offset).split('\n').length, inputs: [...new Set(expression.match(/GG_\d+_[\p{L}\w]+/gu) ?? [])], dependencies: [...new Set(expression.match(/\b(?:nf\w+|Statussteg\d+|ColGG\w+)\b/g) ?? [])], expression }]
})
const implemented = new Set([...readFileSync('src/domain/lifecycleFormulas.ts','utf8').matchAll(/^\s+(nf\w+):/gm)].map(m=>m[1]))
for (const formula of catalog) {
  formula.migrationStatus = implemented.has(formula.name) ? 'implemented-typed-subset'
    : formula.category === 'section-status' ? 'partial-existing-local-validation; official gating not ported'
    : formula.category === 'validation' ? 'catalogued-not-ported; never reported passed'
    : /nfCardWidth|nfMin\d+Width/.test(formula.name) ? 'obsolete-layout; responsive React preserved'
    : ['authorization','backend-record','translation'].includes(formula.category) ? 'adapted-mock; production backend-dependent'
    : 'catalogued-review-required'
  formula.sections = [...new Set([...formula.expression.matchAll(/nfSelectedRecord(\d+)/g)].map(m=>Number(m[1])))].sort((a,b)=>a-b)
  formula.backendDependencies = [...new Set(formula.expression.match(/\b(?:ViewKontroll|ViewSprak|Hjelpetekst|Tilgang|NsrEnhet|SkjemaStatus|SchemaConfiguration|Office365Users|UIDPConnector2)\b/g)??[])]
}
writeFileSync('gsi-react-import/LIFECYCLE_FORMULA_CATALOG.json', JSON.stringify({ sources: sources.map(({active,...s})=>s), formulas: catalog }, null, 2) + '\n')
console.log(JSON.stringify({ sources: sources.map(({active,...s})=>s), formulaCount: catalog.length, categories: Object.fromEntries([...new Set(catalog.map(f=>f.category))].map(c=>[c,catalog.filter(f=>f.category===c).length])), names: catalog.filter(f=>f.category!=='validation').map(f=>f.name) }, null, 2))
