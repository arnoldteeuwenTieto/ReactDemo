import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

async function reports(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await reports(path))
    else if (entry.name === 'axe-results.json') files.push(path)
  }
  return files
}

const compactRule = rule => ({
  id: rule.id, impact: rule.impact, description: rule.description,
  help: rule.help, helpUrl: rule.helpUrl, tags: rule.tags,
  nodes: rule.nodes.map(node => ({
    target: node.target, html: node.html, failureSummary: node.failureSummary,
    checks: [...node.any, ...node.all, ...node.none].map(check => ({
      id: check.id, message: check.message, data: check.data,
    })),
  })),
})

const scenarios = []
for (const path of await reports('test-results')) {
  const result = JSON.parse(await readFile(path, 'utf8'))
  scenarios.push({
    ...result,
    sourceArtifact: relative('.', path).replaceAll('\\', '/'),
    violations21: result.violations21.map(compactRule),
    violations22: result.violations22.map(compactRule),
    bestPractices: result.bestPractices.map(compactRule),
    incomplete: result.incomplete.map(compactRule),
  })
}
scenarios.sort((a, b) => a.scenario.localeCompare(b.scenario, 'nb'))
const evidence = {
  auditDate: '2026-10-30',
  note: 'Audit snapshot. Incomplete findings require manual review; zero axe violations does not establish conformance. Keyboard tests are reported separately in UU_AUDIT.md.',
  scenarios,
}
await writeFile(process.argv[2] ?? 'UU_AUDIT_RESULTS.json', JSON.stringify(evidence, null, 2) + '\n')
const review = new Map()
for (const scenario of scenarios) {
  for (const rule of scenario.incomplete) {
    const item = review.get(rule.id) ?? { id: rule.id, impact: rule.impact, scenarios: 0, nodeOccurrences: 0, messages: new Set(), selectors: new Set() }
    item.scenarios++
    item.nodeOccurrences += rule.nodes.length
    for (const node of rule.nodes) {
      item.selectors.add(JSON.stringify(node.target))
      for (const check of node.checks) item.messages.add(check.message)
    }
    review.set(rule.id, item)
  }
}
console.log(JSON.stringify({
  scans: scenarios.length,
  violations21: scenarios.flatMap(scenario => scenario.violations21).length,
  violations22: scenarios.flatMap(scenario => scenario.violations22).length,
  bestPractices: scenarios.flatMap(scenario => scenario.bestPractices).length,
  review: [...review.values()].map(item => ({ ...item, messages: [...item.messages], selectors: [...item.selectors].slice(0, 8) })),
  scenarios: scenarios.map(scenario => ({ name: scenario.scenario, incomplete: scenario.incomplete.map(rule => rule.id), ruleCount: scenario.passedRuleIds.length })),
}, null, 2))
