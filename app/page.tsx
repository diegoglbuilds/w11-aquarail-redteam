"use client";
import { useState } from "react";
import { simulatedEvents } from "@/lib/events";
import type { LeakEvent } from "@/lib/schema";

export default function Home() {
  const [events] = useState<LeakEvent[]>(simulatedEvents);
  const [selectedId, setSelectedId] = useState(events[0].id);
  const selected = events.find((event) => event.id === selectedId)!;
  return <main className="shell">
    <header className="topbar"><div className="brand">Aqua<span>Rail</span> Red Team</div><div className="top-note">QA adversarial · operaciones municipales · datos ficticios</div></header>
    <div className="layout">
      <section className="hero"><div><div className="eyebrow">Visibilidad de pérdidas · revisión de operaciones</div><h1>Detectar no es reparar. Cerrar no es verificar.</h1><p className="sub">Una herramienta adversarial para encontrar sesgos, tickets estancados y cierres sin evidencia.</p></div><div className="disclosure">● Datos y sensores simulados para esta demostración</div></section>
      <section className="summary">
        <Metric label="Eventos simulados" value={events.length}/><Metric label="Alertas de sesgo" value="—"/><Metric label="Tickets sin resolver" value="—"/><Metric label="Cierres bloqueados" value="0"/><Metric label="Cambios humanos" value="0"/><Metric label="Resultado verificado" value={events.filter(e=>e.status==="outcome_verified").length}/>
      </section>
      <div className="grid">
        <section className="card events"><h2>Eventos prioritarios <span className="pill">FEED SIMULADO</span></h2><p className="section-caption">Zonas y telemetría ficticias · sin domicilios ni hogares reales</p><div className="events-list">{events.map((event, i)=><button className={`event-row ${event.id===selectedId?"active":""}`} key={event.id} onClick={()=>setSelectedId(event.id)}><div><div className="event-title">{event.id} · {event.syntheticLocation}</div><div className="muted">Pérdida estimada {event.estimatedLossLps} L/s · vulnerabilidad {event.communityVulnerabilityScore}/100</div><span className="pill">{statusLabel(event.status)}</span>{!event.owner&&<span className="pill red">Sin responsable</span>}{!event.nextAction&&<span className="pill red">Sin siguiente acción</span>}</div><div className="row-right"><span className="pill amber">#{i+1}</span><div className="muted">Confianza {Math.round(event.sensorConfidence*100)}%</div></div></button>)}</div></section>
        <section className="card mapcard"><h2>Geodatos sintéticos</h2><p className="section-caption">Cuadrícula ilustrativa · puntos sin referencia a calles reales</p><div className="map">{events.map((e,i)=><span key={e.id} title={e.id} className="marker" style={{left:`${22+(i*17)%65}%`,top:`${24+(i*23)%60}%`,background:e.id===selectedId?"#1762c4":undefined}}>{i+1}</span>)}</div><div className="legend"><span>● Sospecha simulada</span><span>Seleccionado: {selected.id}</span></div></section>
        <section className="card priority"><h2>Resumen del flujo adversarial</h2><p className="section-caption">La puntuación y las banderas se explican con reglas visibles.</p><div className="audit"><b>Qué revisa AquaRail</b><br/>1. Si el orden de prioridad deja atrás zonas vulnerables sin una justificación operativa clara.<br/>2. Si hay responsable, siguiente acción y actualización oportuna.<br/>3. Si una etiqueta de cierre cuenta con evidencia física y verificación posterior.<br/><br/><b>Autoridad:</b> el sistema señala riesgos; la persona operadora decide prioridad e inspección.</div></section>
        <section className="card detail"><h2>Ficha de auditoría · {selected.id}</h2><div className="audit"><b>Ubicación:</b> {selected.syntheticLocation}<br/><b>Estado:</b> <span className="status">{statusLabel(selected.status)}</span><br/><b>Responsable:</b> {selected.owner??"Sin responsable"}<br/><b>Siguiente acción:</b> {selected.nextAction??"Sin siguiente acción"}<br/><b>Última actualización:</b> {new Date(selected.createdAt).toLocaleString("es-MX",{timeZone:"UTC"})} UTC<br/><b>Evidencia:</b> pendiente de captura<br/><b>Sensor:</b> simulado · confianza {Math.round(selected.sensorConfidence*100)}%</div></section>
        <div className="clause"><b>Cláusula de equidad y autoridad humana</b><br/>La prioridad final requiere revisión humana. No se permite priorizar por capacidad de pago. Sin perfilado punitivo de hogares, racionamiento automatizado ni despacho mayor automático. Una reparación no significa que la reducción de pérdida esté verificada.</div>
      </div>
    </div>
  </main>;
}
function Metric({label,value}:{label:string;value:string|number}){return <div className="metric"><strong>{value}</strong><span>{label}</span></div>}
function statusLabel(status: LeakEvent["status"]){return ({suspected:"Sospechoso",physically_confirmed:"Confirmado físicamente",repaired:"Reparado",outcome_verified:"Resultado verificado",verified_not_leak:"No era fuga",reopened:"Reabierto"})[status]}
