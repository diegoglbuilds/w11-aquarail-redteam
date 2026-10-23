"use client";
import { useState } from "react";
import { simulatedEvents } from "@/lib/events";
import { OverrideReasonSchema, PriorityOverrideSchema, type Evidence, type LeakEvent, type PriorityOverride } from "@/lib/schema";
import { baselineScore, equityAwareScore, rankEvents } from "@/lib/scoring";
import { findBiasFlags, unresolvedFlags } from "@/lib/adversarial";
import { transitionStatus } from "@/lib/state-machine";

export default function Home() {
  const [events, setEvents] = useState<LeakEvent[]>(simulatedEvents);
  const [selectedId, setSelectedId] = useState(events[0].id);
  const [evidence, setEvidence] = useState<Record<string,Evidence>>(()=>Object.fromEntries(events.map(e=>[e.id,{physicalConfirmation:e.status==="outcome_verified",repairEvidence:e.status==="outcome_verified",postRepairVerification:e.status==="outcome_verified",lossReduced:e.status==="outcome_verified"}])));
  const [overrides, setOverrides] = useState<PriorityOverride[]>([]);
  const [falseSuccessAttempts, setFalseSuccessAttempts] = useState<string[]>([]);
  const [formError, setFormError] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [newPriority, setNewPriority] = useState(1);
  const selected = events.find((event) => event.id === selectedId)!;
  const baselineRanking = rankEvents(events, baselineScore);
  const equityRanking = rankEvents(events, equityAwareScore);
  const biasFlags = findBiasFlags(events);
  const unresolvedCount = events.filter(e=>unresolvedFlags(e).length>0).length;
  const selectedEvidence = evidence[selected.id];
  const selectedOverrides = overrides.filter(o=>o.eventId===selected.id);
  const selectedFalseAttempts = falseSuccessAttempts.filter(id=>id===selected.id).length;
  function editEvent(field:"owner"|"nextAction", value:string){setEvents(list=>list.map(e=>e.id===selected.id?{...e,[field]:value.trim()||null,createdAt:new Date().toISOString()}:e));setFormError("")}
  function transition(to:"physically_confirmed"|"repaired"|"outcome_verified"|"verified_not_leak"|"reopened"){
    const result=transitionStatus(selected.status,to,selectedEvidence);
    if(!result.ok){setFormError(result.errors.join(" "));if(to==="outcome_verified")setFalseSuccessAttempts(list=>[...list,selected.id]);return}
    setEvents(list=>list.map(e=>e.id===selected.id?{...e,status:result.status,resolutionRecord:result.status==="outcome_verified"?"Verificación posterior simulada; pérdida reducida":`Actualización de estado registrada: ${statusLabel(result.status)}`,createdAt:new Date().toISOString()}:e));setFormError("");
  }
  function saveOverride(){
    const reason=OverrideReasonSchema.safeParse(overrideReason);
    if(!reason.success){setFormError(reason.error.issues[0]?.message??"Motivo inválido.");return}
    const parsed=PriorityOverrideSchema.safeParse({eventId:selected.id,previousPriority:equityRanking.findIndex(r=>r.event.id===selected.id)+1,newPriority,reason:reason.data,timestamp:new Date().toISOString()});
    if(!parsed.success){setFormError("Prioridad o motivo inválido.");return}
    setOverrides(list=>[...list,parsed.data]);setOverrideReason("");setFormError("");
  }
  return <main className="shell">
    <header className="topbar"><div className="brand">Aqua<span>Rail</span> Red Team</div><div className="top-note">QA adversarial · operaciones municipales · datos ficticios</div></header>
    <div className="layout">
      <section className="hero"><div><div className="eyebrow">Visibilidad de pérdidas · revisión de operaciones</div><h1>Detectar no es reparar. Cerrar no es verificar.</h1><p className="sub">Una herramienta adversarial para encontrar sesgos, tickets estancados y cierres sin evidencia.</p></div><div className="disclosure">● Datos y sensores simulados para esta demostración</div></section>
      <section className="summary">
        <Metric label="Eventos simulados" value={events.length}/><Metric label="Alertas de sesgo" value={biasFlags.length}/><Metric label="Tickets sin resolver" value={unresolvedCount}/><Metric label="Cierres bloqueados" value={falseSuccessAttempts.length}/><Metric label="Cambios humanos" value={overrides.length}/><Metric label="Resultado verificado" value={events.filter(e=>e.status==="outcome_verified").length}/>
      </section>
      <div className="grid">
        <section className="card events"><h2>Eventos prioritarios <span className="pill">FEED SIMULADO</span></h2><p className="section-caption">Zonas y telemetría ficticias · sin domicilios ni hogares reales</p><div className="events-list">{events.map((event, i)=><button className={`event-row ${event.id===selectedId?"active":""}`} key={event.id} onClick={()=>setSelectedId(event.id)}><div><div className="event-title">{event.id} · {event.syntheticLocation}</div><div className="muted">Pérdida estimada {event.estimatedLossLps} L/s · vulnerabilidad {event.communityVulnerabilityScore}/100</div><span className="pill">{statusLabel(event.status)}</span>{unresolvedFlags(event).map(f=><span key={f} className="pill red">{f}</span>)}{biasFlags.some(f=>f.eventId===event.id)&&<span className="pill red">Posible sesgo de priorización</span>}</div><div className="row-right"><span className="pill amber">#{i+1}</span><div className="muted">Confianza {Math.round(event.sensorConfidence*100)}%</div></div></button>)}</div></section>
        <section className="card mapcard"><h2>Geodatos sintéticos</h2><p className="section-caption">Cuadrícula ilustrativa · puntos sin referencia a calles reales</p><div className="map">{events.map((e,i)=><span key={e.id} title={e.id} className="marker" style={{left:`${22+(i*17)%65}%`,top:`${24+(i*23)%60}%`,background:e.id===selectedId?"#1762c4":undefined}}>{i+1}</span>)}</div><div className="legend"><span>● Sospecha simulada</span><span>Seleccionado: {selected.id}</span></div></section>
        <section className="card priority"><h2>Comparación de prioridad <span className="pill">PUNTUACIÓN SIMULADA</span></h2><p className="section-caption">Modelo de priorización transparente, sin predicción entrenada.</p><table className="table"><thead><tr><th>Evento</th><th>Solo pérdida</th><th>Con vulnerabilidad</th></tr></thead><tbody>{events.map(e=><tr key={e.id}><td><b>{e.id}</b><br/><span className="muted">{e.communityVulnerabilityScore}/100 vulnerabilidad</span></td><td><span className="rank">#{baselineRanking.findIndex(r=>r.event.id===e.id)+1}</span> · {baselineScore(e).toFixed(1)}</td><td><span className="rank">#{equityRanking.findIndex(r=>r.event.id===e.id)+1}</span> · {equityAwareScore(e).toFixed(1)}</td></tr>)}</tbody></table><div className="audit" style={{marginTop:12}}><b>Fórmulas</b><br/>Base = pérdida estimada (L/s) × 8 + factibilidad × 0.1.<br/>Equidad = base + interrupción × 0.15 + vulnerabilidad comunitaria × 0.25.<br/><b>Revisión humana obligatoria:</b> puntajes orientan; no autorizan excavación ni despacho.</div></section>
        <section className="card detail"><h2>Ficha de auditoría · {selected.id}</h2><div className="audit"><b>Ubicación:</b> {selected.syntheticLocation}<br/><b>Estado:</b> <span className="status">{statusLabel(selected.status)}</span><br/><b>Última actualización:</b> {new Date(selected.createdAt).toLocaleString("es-MX",{timeZone:"UTC"})} UTC<br/><b>Resolución:</b> {selected.resolutionRecord??"Pendiente"}<br/><b>Sensor:</b> simulado · confianza {Math.round(selected.sensorConfidence*100)}%</div>
          <div className="fields" style={{marginTop:12}}><label>Responsable<input value={selected.owner??""} placeholder="Sin responsable" onChange={e=>editEvent("owner",e.target.value)}/></label><label>Siguiente acción<input value={selected.nextAction??""} placeholder="Sin siguiente acción" onChange={e=>editEvent("nextAction",e.target.value)}/></label></div>
          <div className="audit" style={{marginTop:12}}><b>Evidencia · editable por persona operadora</b></div><div className="fields">{([["physicalConfirmation","Confirmación física"],["repairEvidence","Evidencia de reparación"],["postRepairVerification","Verificación posterior"],["lossReduced","Pérdida reducida"]] as const).map(([key,label])=><label key={key} style={{display:"flex",alignItems:"center",gap:8}}><input type="checkbox" checked={selectedEvidence[key]} onChange={e=>{const parsed=({ ...selectedEvidence,[key]:e.target.checked });setEvidence(all=>({...all,[selected.id]:parsed}));}}/>{label}</label>)}</div>
          <div className="actions"><button className="btn secondary" onClick={()=>transition("physically_confirmed")}>Confirmar físicamente</button><button className="btn secondary" onClick={()=>transition("repaired")}>Registrar reparación</button><button className="btn" onClick={()=>transition("outcome_verified")}>Verificar resultado</button><button className="btn secondary" onClick={()=>transition("verified_not_leak")}>Marcar no era fuga</button><button className="btn secondary" onClick={()=>transition("reopened")}>Reabrir</button></div>
          {formError&&<div className="toast" role="alert">{selectedFalseAttempts>0&&selected.status!=="outcome_verified"&&formError.includes("Transición")?"Cierre no verificado · ":""}{formError}</div>}
          {selectedFalseAttempts>0&&<div className="flag" style={{marginTop:8}}>Cierre no verificado · {selectedFalseAttempts} intento(s) bloqueado(s)</div>}
          <div className="audit" style={{marginTop:14}}><b>Revisión humana de prioridad</b></div><div className="fields"><label>Nueva posición sugerida<input type="number" min={1} max={events.length} value={newPriority} onChange={e=>setNewPriority(Number(e.target.value))}/></label><label>Motivo obligatorio<textarea maxLength={240} value={overrideReason} onChange={e=>setOverrideReason(e.target.value)} placeholder="Explica la decisión (12 a 240 caracteres)"/></label><div className="muted">Recomendación actual: posición #{equityRanking.findIndex(r=>r.event.id===selected.id)+1}. {equityRanking.find(r=>r.event.id===selected.id)?.score.toFixed(1)} puntos · modelo transparente simulado.</div><button className="btn" onClick={saveOverride}>Guardar revisión humana</button></div>
          <div className="history"><b className="audit">Historial de cambios humanos</b>{selectedOverrides.length?selectedOverrides.map((o,i)=><div className="audit" key={i}>Anterior #{o.previousPriority} → nueva #{o.newPriority} · {o.reason} · {new Date(o.timestamp).toLocaleString("es-MX")}</div>):<div className="muted">Sin cambios registrados.</div>}</div>
          <div className="flags" style={{marginTop:12}}>{unresolvedFlags(selected).map(f=><div className="flag" key={f}>{f}</div>)}{biasFlags.filter(f=>f.eventId===selected.id).map(f=><div className="flag" key={f.label}>{f.label}: {f.explanation}</div>)}{!unresolvedFlags(selected).length&&!biasFlags.some(f=>f.eventId===selected.id)&&<span className="muted">Sin banderas adversariales actuales.</span>}</div></section>
        <div className="clause"><b>Cláusula de equidad y autoridad humana</b><br/>La prioridad final requiere revisión humana. No se permite priorizar por capacidad de pago. Sin perfilado punitivo de hogares, racionamiento automatizado ni despacho mayor automático. Una reparación no significa que la reducción de pérdida esté verificada.</div>
      </div>
    </div>
  </main>;
}
function Metric({label,value}:{label:string;value:string|number}){return <div className="metric"><strong>{value}</strong><span>{label}</span></div>}
function statusLabel(status: LeakEvent["status"]){return ({suspected:"Sospechoso",physically_confirmed:"Confirmado físicamente",repaired:"Reparado",outcome_verified:"Resultado verificado",verified_not_leak:"No era fuga",reopened:"Reabierto"})[status]}
