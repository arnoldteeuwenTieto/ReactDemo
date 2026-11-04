import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { fieldPresentation } from '../domain/fieldPresentation'
import type { FieldOrigin } from '../domain/fieldPresentation'
interface Metadata { origin?: FieldOrigin; fieldKey?: string; sectionRef?: string; dataType?: string; reportValue?: unknown }
function metadata({fieldKey,sectionRef,dataType}:Metadata){
 return __DEV_FIELD_METADATA__ ? {'data-report-field':fieldKey??'', 'data-report-section':sectionRef??'', 'data-report-type':dataType??''} : {}
}
function MetadataTarget({children,disabled,origin,value,fieldKey,sectionRef,dataType,choice}:Metadata&{children:ReactNode;disabled?:boolean;value?:unknown;choice?:boolean}){
 if(!__DEV_FIELD_METADATA__)return children
 return <span className={`report-field-target${choice?' report-field-target--choice':''}`} data-report-wrapper="" {...metadata({fieldKey,sectionRef,dataType})} {...fieldPresentation(value,origin)} tabIndex={disabled?0:undefined} role={disabled?'group':undefined} aria-label={disabled?`DEV field metadata ${sectionRef??''}`:undefined}>{children}</span>
}
function fieldDisabled(props:object,disabled?:boolean){
 const state=(props as Record<string,unknown>)['data-field-state']
 return disabled||state==='business-disabled'||state==='permission-readonly'
}
export function ReportingInput({origin='user',fieldKey,sectionRef,dataType,reportValue,...props}:InputHTMLAttributes<HTMLInputElement>&Metadata){
 const value=reportValue===undefined?props.value:reportValue
 return <MetadataTarget origin={origin} value={value} fieldKey={fieldKey} sectionRef={sectionRef} dataType={dataType} disabled={fieldDisabled(props,props.disabled)} choice={props.type==='radio'||props.type==='checkbox'}><input {...props} {...fieldPresentation(value,origin)} {...metadata({fieldKey,sectionRef,dataType})} readOnly={origin!=='user'||props.readOnly}/></MetadataTarget>
}
export function ReportingSelect({origin='user',fieldKey,sectionRef,dataType,reportValue,...props}:SelectHTMLAttributes<HTMLSelectElement>&Metadata){
 const value=reportValue===undefined?props.value:reportValue
 return <MetadataTarget origin={origin} value={value} fieldKey={fieldKey} sectionRef={sectionRef} dataType={dataType} disabled={fieldDisabled(props,origin!=='user'||props.disabled)}><select {...props} {...fieldPresentation(value,origin)} {...metadata({fieldKey,sectionRef,dataType})} disabled={origin!=='user'||props.disabled}/></MetadataTarget>
}
export function ReportingTextarea({origin='user',fieldKey,sectionRef,dataType,reportValue,...props}:TextareaHTMLAttributes<HTMLTextAreaElement>&Metadata){
 const value=reportValue===undefined?props.value:reportValue
 return <MetadataTarget origin={origin} value={value} fieldKey={fieldKey} sectionRef={sectionRef} dataType={dataType} disabled={fieldDisabled(props,props.disabled)}><textarea {...props} {...fieldPresentation(value,origin)} {...metadata({fieldKey,sectionRef,dataType})} readOnly={origin!=='user'||props.readOnly}/></MetadataTarget>
}
export function ReportingValue({origin='backend',fieldKey,sectionRef,dataType,reportValue,children,...props}:HTMLAttributes<HTMLElement>&Metadata){
 return <dd {...props} className={`gsi-field-value ${props.className??''}`} {...fieldPresentation(reportValue,origin)} {...metadata({fieldKey,sectionRef,dataType})} tabIndex={__DEV_FIELD_METADATA__?0:undefined}>{children}</dd>
}
