import { EvidenceSchema, LeakStatusSchema, type Evidence, type LeakStatus } from "./schema";

export const VALID_TRANSITIONS: Record<LeakStatus, readonly LeakStatus[]> = {
  suspected: ["physically_confirmed", "verified_not_leak"],
  physically_confirmed: ["repaired", "reopened"],
  repaired: ["outcome_verified", "reopened"],
  outcome_verified: ["reopened"],
  verified_not_leak: ["reopened"],
  reopened: ["physically_confirmed", "verified_not_leak"],
};

export type TransitionResult = { ok: true; status: LeakStatus } | { ok: false; errors: string[] };
export function transitionStatus(current: LeakStatus, next: LeakStatus, evidence: Evidence): TransitionResult {
  const parsedNext = LeakStatusSchema.safeParse(next);
  const parsedEvidence = EvidenceSchema.safeParse(evidence);
  if (!parsedNext.success || !parsedEvidence.success) return { ok:false, errors:["Estado o campos de evidencia inválidos."] };
  if (!VALID_TRANSITIONS[current].includes(next)) return { ok:false, errors:[`Transición no permitida: ${current} → ${next}.`] };
  if (next === "outcome_verified") {
    const errors: string[] = [];
    if (!evidence.physicalConfirmation) errors.push("Falta confirmación física.");
    if (!evidence.repairEvidence) errors.push("Falta evidencia de reparación.");
    if (!evidence.postRepairVerification) errors.push("Falta verificación posterior a la reparación.");
    if (!evidence.lossReduced) errors.push("La reducción de pérdida no está verificada como verdadera.");
    if (errors.length) return {ok:false,errors};
  }
  return {ok:true,status:next};
}
