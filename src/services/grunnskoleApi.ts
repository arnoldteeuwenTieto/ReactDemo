import { dependentClears, emptyDel2 } from '../domain/del2'
import type { Del2Data, DependentClear } from '../domain/del2'
import type { School } from '../mockData'

export interface GsiSkjemaStatus { skjemaStatusId: string; schoolId: string; year: number; del2: Del2Data }
export interface SaveResponse { ok: true; savedAt: string; dependentOperations: DependentClear[] }
export interface ApiLog { schoolId: string; skjemaStatusId: string; section: number; operation: string; payload: object; response: object; timestamp: string }
type Sections = Record<number, Record<string, unknown>>
const store = new Map<string, Sections>()
const queues = new Map<string, Promise<unknown>>()
const logs: ApiLog[] = []
let attempt = 0
export const mockSkjemaStatusId = (school: School) => `demo:${school.id}:${school.year}`
const delay = () => new Promise(resolve => setTimeout(resolve, 450))
export function getApiLogs(id: string) { return logs.filter(log => log.skjemaStatusId === id).slice(-30).reverse() }
export async function getGsiSkjemaStatus(skjemaStatusId: string): Promise<GsiSkjemaStatus> {
  // Entirely in-memory demo. No network, credentials, or browser persistence.
  await delay()
  await queues.get(skjemaStatusId)?.catch(() => undefined)
  const [, schoolId, year] = skjemaStatusId.split(':')
  return { skjemaStatusId, schoolId, year: Number(year), del2: { ...emptyDel2, ...store.get(skjemaStatusId)?.[2] } }
}
export function grunnskoleSave(skjemaStatusId: string, del: 2, data: Partial<Del2Data>): Promise<SaveResponse> {
  const payload = { ...data }
  const run = async (): Promise<SaveResponse> => {
    await delay()
    const timestamp = new Date().toISOString()
    // Predictable occasional failures make retries easy to demonstrate.
    if (++attempt % 7 === 0) {
      const message = 'Simulert lagringsfeil. Prøv igjen.'
      logs.push({ schoolId: skjemaStatusId.split(':')[1], skjemaStatusId, section: del, operation: 'GrunnskoleSave', payload, response: { ok: false, message }, timestamp })
      throw new Error(message)
    }
    const sections = store.get(skjemaStatusId) ?? {}
    const next: Del2Data = { ...emptyDel2, ...sections[2], ...payload }
    const dependentOperations = dependentClears(payload, next)
    sections[2] = { ...next }
    for (const operation of dependentOperations) {
      if (!operation.warning) sections[operation.del] = { ...sections[operation.del], ...operation.payload }
    }
    store.set(skjemaStatusId, sections)
    const response: SaveResponse = { ok: true, savedAt: timestamp, dependentOperations }
    logs.push({ schoolId: skjemaStatusId.split(':')[1], skjemaStatusId, section: del, operation: 'GrunnskoleSave', payload, response, timestamp })
    return response
  }
  // Serialize the full change and its dependent updates per school/year, even across remounts.
  const result = (queues.get(skjemaStatusId) ?? Promise.resolve()).catch(() => undefined).then(run)
  queues.set(skjemaStatusId, result)
  return result
}
