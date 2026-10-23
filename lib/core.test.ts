import { describe, expect, it } from "vitest";
import { LeakEventSchema, OverrideReasonSchema, PriorityOverrideSchema } from "./schema";
import { simulatedEvents } from "./events";
import { baselineScore, equityAwareScore, rankEvents } from "./scoring";
import { findBiasFlags, STALE_AFTER_HOURS, unresolvedFlags } from "./adversarial";
import { transitionStatus } from "./state-machine";
import type { LeakEvent } from "./schema";

const base: LeakEvent = {id:"AR-999",syntheticLocation:"Zona ficticia de prueba",lat:19.4,lng:-99.1,estimatedLossLps:5,serviceInterruptionScore:30,repairFeasibilityScore:60,communityVulnerabilityScore:50,sensorConfidence:.8,createdAt:"2026-10-22T12:00:00.000Z",lastUpdated:"2026-10-22T12:00:00.000Z",owner:"Turno prueba",nextAction:"Inspección simulada",status:"suspected",resolutionRecord:null};
const evidence={physicalConfirmation:true,repairEvidence:true,postRepairVerification:true,lossReduced:true};

describe("validation and simulated records",()=>{
  it("rejects malformed simulated events",()=>expect(LeakEventSchema.safeParse({...base,id:"bad"}).success).toBe(false));
  it("rejects invalid coordinates",()=>expect(LeakEventSchema.safeParse({...base,lat:0,lng:0}).success).toBe(false));
  it("rejects out-of-range vulnerability and feasibility scores",()=>{expect(LeakEventSchema.safeParse({...base,communityVulnerabilityScore:101}).success).toBe(false);expect(LeakEventSchema.safeParse({...base,repairFeasibilityScore:-1}).success).toBe(false)});
  it("has no ability-to-pay field and strict parsing rejects one",()=>{expect("abilityToPay" in base).toBe(false);expect(LeakEventSchema.safeParse({...base,abilityToPay:100}).success).toBe(false)});
});

describe("transparent scoring",()=>{
  it("is deterministic",()=>expect(baselineScore(base)).toBe(baselineScore(base)));
  it("baseline ranks a high-loss case first",()=>{const high={...base,id:"AR-001",estimatedLossLps:10};const low={...base,id:"AR-002",estimatedLossLps:2};expect(rankEvents([low,high],baselineScore)[0].event.id).toBe("AR-001")});
  it("equity-aware ranking can change order",()=>{const lowLoss={...base,id:"AR-001",estimatedLossLps:2,communityVulnerabilityScore:100,serviceInterruptionScore:100};const highLoss={...base,id:"AR-002",estimatedLossLps:5,communityVulnerabilityScore:0,serviceInterruptionScore:0};expect(rankEvents([highLoss,lowLoss],equityAwareScore)[0].event.id).toBe("AR-001")});
  it("vulnerability raises the equity score",()=>expect(equityAwareScore({...base,communityVulnerabilityScore:90})).toBeGreaterThan(equityAwareScore({...base,communityVulnerabilityScore:40})));
});

describe("adversarial checks",()=>{
  it("flags a high-vulnerability event unjustifiably displaced",()=>{const atRisk={...base,id:"AR-001",estimatedLossLps:0,repairFeasibilityScore:0,communityVulnerabilityScore:100,serviceInterruptionScore:0};const lower=[2,3,4].map(n=>({...base,id:`AR-00${n}`,estimatedLossLps:4,repairFeasibilityScore:0,communityVulnerabilityScore:5,serviceInterruptionScore:0}));expect(findBiasFlags([atRisk,...lower]), JSON.stringify(lower.map(x=>[x.id,baselineScore(x),equityAwareScore(x)]))).toHaveLength(1)});
  it("does not flag a low-vulnerability event on vulnerability alone",()=>expect(findBiasFlags([{...base,communityVulnerabilityScore:10}])).toEqual([]));
  it("flags missing owner",()=>expect(unresolvedFlags({...base,owner:null},new Date(base.createdAt))).toContain("Sin responsable"));
  it("flags missing next action",()=>expect(unresolvedFlags({...base,nextAction:null},new Date(base.createdAt))).toContain("Sin siguiente acción"));
  it("uses a 24-hour stale-ticket threshold",()=>{const fresh=unresolvedFlags(base,new Date(Date.parse(base.createdAt)+STALE_AFTER_HOURS*3600000));const stale=unresolvedFlags(base,new Date(Date.parse(base.createdAt)+(STALE_AFTER_HOURS*3600000)+1));expect(fresh).not.toContain("Ticket estancado");expect(stale).toContain("Ticket estancado")});
});

describe("verified outcome state machine and human overrides",()=>{
  it("blocks suspected directly to outcome_verified",()=>expect(transitionStatus("suspected","outcome_verified",evidence).ok).toBe(false));
  it("blocks verification without physical confirmation",()=>expect(transitionStatus("repaired","outcome_verified",{...evidence,physicalConfirmation:false}).ok).toBe(false));
  it("blocks verification without repair evidence",()=>expect(transitionStatus("repaired","outcome_verified",{...evidence,repairEvidence:false}).ok).toBe(false));
  it("blocks verification without post-repair verification",()=>expect(transitionStatus("repaired","outcome_verified",{...evidence,postRepairVerification:false}).ok).toBe(false));
  it("blocks verification without confirmed loss reduction",()=>expect(transitionStatus("repaired","outcome_verified",{...evidence,lossReduced:false}).ok).toBe(false));
  it("keeps repaired distinct from outcome_verified",()=>expect(transitionStatus("physically_confirmed","repaired",evidence)).toEqual({ok:true,status:"repaired"}));
  it("accepts a fully evidenced verification only from repaired",()=>expect(transitionStatus("repaired","outcome_verified",evidence)).toEqual({ok:true,status:"outcome_verified"}));
  it("requires a written override reason",()=>expect(OverrideReasonSchema.safeParse("").success).toBe(false));
  it("bounds override reason length",()=>{expect(OverrideReasonSchema.safeParse("Corto").success).toBe(false);expect(OverrideReasonSchema.safeParse("x".repeat(241)).success).toBe(false)});
  it("validates a persisted override record",()=>expect(PriorityOverrideSchema.safeParse({eventId:"AR-101",previousPriority:2,newPriority:1,reason:"Impacto de servicio documentado",timestamp:"2026-10-23T12:00:00.000Z"}).success).toBe(true));
});

it("validates every bundled synthetic feed record",()=>expect(simulatedEvents).toHaveLength(5));
