import './DevFieldTooltip.css'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import catalog from 'virtual:gsi-field-metadata'
interface Target {element:HTMLElement;column:string;section:string;origin:string;type:string;left:number;top:number}
export default function DevFieldTooltip(){
 const [target,setTarget]=useState<Target|null>(null)
 const tooltipRef=useRef<HTMLDivElement>(null)
 useEffect(()=>{
  let timer:ReturnType<typeof setTimeout>|undefined
  let owner:HTMLElement|null=null
  const cancel=()=>{if(timer)clearTimeout(timer)}
  const hide=()=>{cancel();timer=setTimeout(()=>{owner=null;setTarget(null)},150)}
  const show=(event:Event)=>{const element=event.target;if(!(element instanceof HTMLElement)||!element.matches('[data-report-field]'))return;cancel();owner=element;const r=element.getBoundingClientRect();setTarget({element,column:element.dataset.reportField??'',section:element.dataset.reportSection??'',origin:element.dataset.fieldOrigin??'user',type:element.dataset.reportType??'',left:Math.max(8,Math.min(r.left,innerWidth-328)),top:Math.max(8,Math.min(r.bottom+6,innerHeight-230))})}
  const leave=(event:Event)=>{const e=event as PointerEvent;if(owner===document.activeElement||e.relatedTarget instanceof Element&&e.relatedTarget.closest('#dev-field-tooltip'))return;hide()}
  const close=()=>{cancel();owner=null;setTarget(null)}
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')close()}
  const hover=(event:Event)=>{if((event.target as Element)?.closest?.('#dev-field-tooltip'))cancel()}
  document.addEventListener('pointerover',show);document.addEventListener('focusin',show);document.addEventListener('pointerout',leave);document.addEventListener('focusout',hide);document.addEventListener('pointerover',hover);document.addEventListener('keydown',escape);window.addEventListener('scroll',close,true);window.addEventListener('resize',close)
  const frame=requestAnimationFrame(()=>{if(document.activeElement instanceof HTMLElement)show({target:document.activeElement} as unknown as Event)})
  return()=>{cancel();cancelAnimationFrame(frame);document.removeEventListener('pointerover',show);document.removeEventListener('focusin',show);document.removeEventListener('pointerout',leave);document.removeEventListener('focusout',hide);document.removeEventListener('pointerover',hover);document.removeEventListener('keydown',escape);window.removeEventListener('scroll',close,true);window.removeEventListener('resize',close)}
 },[])
 useLayoutEffect(()=>{const tip=tooltipRef.current;if(!target||!tip)return;const r=target.element.getBoundingClientRect(),height=tip.offsetHeight,belowSpace=innerHeight-r.bottom-16,aboveSpace=r.top-16,below=belowSpace>=height||belowSpace>=aboveSpace;tip.style.maxHeight=`${Math.max(60,below?belowSpace:aboveSpace)}px`;tip.style.top=`${below?r.bottom+6:Math.max(8,r.top-6-Math.min(height,aboveSpace))}px`},[target])
 useEffect(()=>{
  if(!target)return
  const element=target.element,id='dev-field-tooltip'
  const attach=()=>{const ids=(element.getAttribute('aria-describedby')??'').split(/\s+/).filter(Boolean);if(!ids.includes(id))element.setAttribute('aria-describedby',[...ids,id].join(' '))}
  attach()
  const observer=new MutationObserver(attach);observer.observe(element,{attributes:true,attributeFilter:['aria-describedby']})
  return()=>{observer.disconnect();const rest=(element.getAttribute('aria-describedby')??'').split(/\s+/).filter(x=>x&&x!==id).join(' ');if(rest)element.setAttribute('aria-describedby',rest);else element.removeAttribute('aria-describedby')}
 },[target])
 if(!target)return null
 const mapping=catalog[target.column],missing='Mapping not available'
 return createPortal(<div ref={tooltipRef} id="dev-field-tooltip" className="dev-field-tooltip" role="tooltip" style={{left:target.left,top:target.top}}><strong>DEV · Field metadata</strong><dl><dt>SQL column</dt><dd>{mapping?.column??missing}</dd><dt>SQL table</dt><dd>{missing}</dd>{mapping?.source&&<><dt>Source data table (SQL mapping unverified)</dt><dd>{mapping.source}</dd></>}<dt>Section/question</dt><dd>{target.section||missing}</dd><dt>Origin</dt><dd>{target.origin==='user'?'User input':target.origin==='calculated'?'Calculated':'Backend-provided'}</dd><dt>Data type</dt><dd>{target.type||mapping?.type||missing}</dd></dl></div>,document.body)
}
