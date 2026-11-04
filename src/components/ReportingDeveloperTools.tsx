import { lazy, Suspense } from 'react'
const Tools=__DEV_FIELD_METADATA__?lazy(()=>import('./DevFieldTooltip')):null
export function ReportingDeveloperTools(){return Tools?<Suspense fallback={null}><Tools/></Suspense>:null}
