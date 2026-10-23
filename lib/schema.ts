import { z } from "zod";

export const LeakStatusSchema = z.enum(["suspected", "physically_confirmed", "repaired", "outcome_verified", "verified_not_leak", "reopened"]);
export type LeakStatus = z.infer<typeof LeakStatusSchema>;

export const LeakEventSchema = z.object({
  id: z.string().regex(/^AR-[0-9]{3}$/),
  syntheticLocation: z.string().min(3).max(80),
  lat: z.number().min(14).max(33),
  lng: z.number().min(-118).max(-86),
  estimatedLossLps: z.number().min(0).max(100),
  serviceInterruptionScore: z.number().min(0).max(100),
  repairFeasibilityScore: z.number().min(0).max(100),
  communityVulnerabilityScore: z.number().min(0).max(100),
  sensorConfidence: z.number().min(0).max(1),
  createdAt: z.string().datetime(),
  owner: z.string().min(2).max(60).nullable(),
  nextAction: z.string().min(3).max(200).nullable(),
  status: LeakStatusSchema,
  resolutionRecord: z.string().max(300).nullable(),
}).strict();
export type LeakEvent = z.infer<typeof LeakEventSchema>;

export const EvidenceSchema = z.object({
  physicalConfirmation: z.boolean(),
  repairEvidence: z.boolean(),
  postRepairVerification: z.boolean(),
  lossReduced: z.boolean(),
}).strict();
export type Evidence = z.infer<typeof EvidenceSchema>;

export const OverrideReasonSchema = z.string().trim().min(12, "Explica el motivo en al menos 12 caracteres.").max(240, "El motivo no puede superar 240 caracteres.");
export const PriorityOverrideSchema = z.object({ eventId: z.string(), previousPriority: z.number().int().positive(), newPriority: z.number().int().positive(), reason: OverrideReasonSchema, timestamp: z.string().datetime() }).strict();
export type PriorityOverride = z.infer<typeof PriorityOverrideSchema>;
