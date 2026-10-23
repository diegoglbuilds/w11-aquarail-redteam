import { LeakEventSchema, type LeakEvent } from "./schema";

// Synthetic coordinates are abstracted into a fictional service grid.
const rawEvents: LeakEvent[] = [
  { id:"AR-101", syntheticLocation:"Zona ficticia Norte 04", lat:19.48, lng:-99.12, estimatedLossLps:12.4, serviceInterruptionScore:48, repairFeasibilityScore:82, communityVulnerabilityScore:88, sensorConfidence:.91, createdAt:"2026-10-22T13:00:00.000Z", lastUpdated:"2026-10-22T13:00:00.000Z", owner:"Turno Alfa", nextAction:"Inspección visual pendiente", status:"suspected", resolutionRecord:null },
  { id:"AR-102", syntheticLocation:"Zona ficticia Centro 02", lat:19.43, lng:-99.15, estimatedLossLps:18.2, serviceInterruptionScore:35, repairFeasibilityScore:91, communityVulnerabilityScore:31, sensorConfidence:.96, createdAt:"2026-10-23T12:00:00.000Z", lastUpdated:"2026-10-23T12:00:00.000Z", owner:"Turno Bravo", nextAction:"Confirmar acceso con supervisor", status:"physically_confirmed", resolutionRecord:null },
  { id:"AR-103", syntheticLocation:"Zona ficticia Oriente 07", lat:19.40, lng:-99.08, estimatedLossLps:4.6, serviceInterruptionScore:94, repairFeasibilityScore:55, communityVulnerabilityScore:97, sensorConfidence:.73, createdAt:"2026-10-20T08:00:00.000Z", lastUpdated:"2026-10-20T08:00:00.000Z", owner:null, nextAction:"Solicitar inspección de campo", status:"suspected", resolutionRecord:null },
  { id:"AR-104", syntheticLocation:"Zona ficticia Sur 03", lat:19.35, lng:-99.17, estimatedLossLps:7.3, serviceInterruptionScore:61, repairFeasibilityScore:74, communityVulnerabilityScore:66, sensorConfidence:.82, createdAt:"2026-10-19T10:00:00.000Z", lastUpdated:"2026-10-19T10:00:00.000Z", owner:"Turno Charlie", nextAction:null, status:"repaired", resolutionRecord:"Reparación registrada; resultado aún sin verificar" },
  { id:"AR-105", syntheticLocation:"Zona ficticia Poniente 01", lat:19.46, lng:-99.22, estimatedLossLps:2.1, serviceInterruptionScore:20, repairFeasibilityScore:96, communityVulnerabilityScore:18, sensorConfidence:.68, createdAt:"2026-10-22T16:00:00.000Z", lastUpdated:"2026-10-22T16:00:00.000Z", owner:"Turno Alfa", nextAction:"Comparar presión después de reparación", status:"outcome_verified", resolutionRecord:"Pérdida posterior simulada reducida" },
];

export const simulatedEvents = rawEvents.map((event) => LeakEventSchema.parse(event));
