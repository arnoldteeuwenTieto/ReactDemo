import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, HTMLAttributes } from 'react'
import { fieldPresentation } from '../domain/fieldPresentation'
import type { FieldOrigin } from '../domain/fieldPresentation'
interface Metadata { origin?: FieldOrigin; fieldKey?: string; sectionRef?: string; dataType?: string; reportValue?: unknown }
function metadata({fieldKey,sectionRef,dataType}:Metadata){
 return __DEV_FIELD_METADATA__ ? {'data-report-field':fieldKey??'', 'data-report-section':sectionRef??'', 'data-report-type':dataType??''} : {}
}
export function ReportingInput({origin='user',fieldKey,sectionRef,dataType,reportValue,...props}:InputHTMLAttributes<HTMLInputElement>&Metadata){
 return <input {...props} {...fieldPresentation(reportValue===undefined?props.value:reportValue,origin)} {...metadata({fieldKey,sectionRef,dataType})} readOnly={origin!=='user'||props.readOnly}/>
}
export function ReportingSelect({origin='user',fieldKey,sectionRef,dataType,reportValue,...props}:SelectHTMLAttributes<HTMLSelectElement>&Metadata){
 return <select {...props} {...fieldPresentation(reportValue===undefined?props.value:reportValue,origin)} {...metadata({fieldKey,sectionRef,dataType})} disabled={origin!=='user'||props.disabled}/>
}
export function ReportingTextarea({origin='user',fieldKey,sectionRef,dataType,reportValue,...props}:TextareaHTMLAttributes<HTMLTextAreaElement>&Metadata){
 return <textarea {...props} {...fieldPresentation(reportValue===undefined?props.value:reportValue,origin)} {...metadata({fieldKey,sectionRef,dataType})} readOnly={origin!=='user'||props.readOnly}/>
}
export function ReportingValue({origin='backend',fieldKey,sectionRef,dataType,reportValue,children,...props}:HTMLAttributes<HTMLElement>&Metadata){
 return <dd {...props} className={`gsi-field-value ${props.className??''}`} {...fieldPresentation(reportValue,origin)} {...metadata({fieldKey,sectionRef,dataType})} tabIndex={__DEV_FIELD_METADATA__?0:undefined}>{children}</dd>
}
