import type { LeakEvent } from "./schema";

/** Baseline deliberately emphasizes loss: loss L/s × 8 + feasibility × 0.1. */
export function baselineScore(event: LeakEvent): number {
  return round(event.estimatedLossLps * 8 + event.repairFeasibilityScore * 0.1);
}

/** Equity-aware score adds service interruption × 0.15 and vulnerability × 0.25. */
export function equityAwareScore(event: LeakEvent): number {
  return round(baselineScore(event) + event.serviceInterruptionScore * 0.15 + event.communityVulnerabilityScore * 0.25);
}

export function rankEvents(events: LeakEvent[], scorer: (event: LeakEvent) => number) {
  return [...events].map((event) => ({ event, score: scorer(event) })).sort((a, b) => b.score - a.score || a.event.id.localeCompare(b.event.id));
}

export function rankingExplanation(event: LeakEvent) {
  return `Base ${baselineScore(event).toFixed(1)} + interrupción ${event.serviceInterruptionScore}×0.15 + vulnerabilidad ${event.communityVulnerabilityScore}×0.25 = ${equityAwareScore(event).toFixed(1)}.`;
}

function round(n: number) { return Math.round(n * 10) / 10; }
