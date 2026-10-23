import type { LeakEvent } from "./schema";
import { baselineScore, equityAwareScore } from "./scoring";

export const STALE_AFTER_HOURS = 24;
export type UnresolvedFlag = "Sin responsable" | "Sin siguiente acción" | "Ticket estancado";
export function unresolvedFlags(event: LeakEvent, now = new Date()): UnresolvedFlag[] {
  const flags: UnresolvedFlag[] = [];
  if (!event.owner) flags.push("Sin responsable");
  if (!event.nextAction) flags.push("Sin siguiente acción");
  if (now.getTime() - Date.parse(event.createdAt) > STALE_AFTER_HOURS * 60 * 60 * 1000 && event.status !== "outcome_verified" && event.status !== "verified_not_leak") flags.push("Ticket estancado");
  return flags;
}

export type BiasFlag = { eventId: string; label: "Posible sesgo de priorización"; explanation: string; delayedBy: number };
export function findBiasFlags(events: LeakEvent[]): BiasFlag[] {
  return events.flatMap((vulnerable) => {
    if (vulnerable.communityVulnerabilityScore < 75) return [];
    const delayed = events.filter((lower) =>
      lower.id !== vulnerable.id &&
      equityAwareScore(lower) > equityAwareScore(vulnerable) &&
      lower.communityVulnerabilityScore < vulnerable.communityVulnerabilityScore &&
      baselineScore(lower) - baselineScore(vulnerable) < 40
    );
    if (delayed.length < 2) return [];
    return [{eventId:vulnerable.id,label:"Posible sesgo de priorización" as const,delayedBy:delayed.length,explanation:`${vulnerable.id} tiene vulnerabilidad ${vulnerable.communityVulnerabilityScore}/100 y queda detrás de ${delayed.length} eventos menos vulnerables. La diferencia de pérdida/factibilidad frente a esos casos no supera el umbral explicativo de 40 puntos base; requiere revisión humana.`}];
  });
}
