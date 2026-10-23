# AquaRail Red Team — Session Decisions

## Key decisions

- Build a single-page Next.js operator dashboard with Spanish (Mexico) interface copy and a compact, responsive layout guided by the packet mockup.
- Keep the workflow browser-only. Demo state, evidence, human priority overrides, and blocked false-success attempts persist in `localStorage`, validated with Zod when loaded. There is no database, account system, remote persistence, or API key.
- Use abstract synthetic map pins rather than Leaflet/OpenStreetMap. The coordinates are fictional and do not resolve to addresses; the plotted pattern is illustrative only.
- Treat “modelo de priorización transparente” as deterministic rules. Baseline is estimated loss × 8 + feasibility × 0.1; equity-aware adds service interruption × 0.15 + community vulnerability × 0.25. Human review remains required.
- Make status advancement explicit. `outcome_verified` can only follow `repaired` and requires physical confirmation, repair evidence, post-repair verification, and `lossReduced: true`. Failed attempts retain status and append a visible adversarial flag.
- Make all ticket and evidence edits, overrides, and summary counts local and synthetic. Overrides require a 12–240 character reason and preserve old/new ranks and timestamp.
- Keep the shadow clause in the dashboard: no pay-to-prioritize, punitive household profiling, automated rationing, or automatic major dispatch.

## What changed

- Created the Next.js, React, TypeScript, Tailwind, Zod, and Vitest app shell.
- Added five synthetic events, a coordinate visualization, side-by-side deterministic rankings, bias and unresolved-ticket checks, an evidence-gated state machine, local audit state, and human override controls.
- Added 31 tests. Regression work corrected a bias-check implementation that failed to flag a deliberately displaced high-vulnerability case. UI coverage now checks failed verification and override-reason behavior.
- Updated Next.js and Vitest to patched releases after `npm audit` reported advisories in the initial scaffold dependencies. Final `npm audit` reports zero vulnerabilities.
- No production deployment, GitHub repository, or real utility integration was performed.

## Unresolved risks

- The scoring weights, 24-hour stale threshold, 40-point baseline justification threshold, and bias heuristic are demonstration choices. A utility and community review must set and validate these before operational use.
- The synthetic coordinate plot provides no real geography, network topology, crew routing, hydraulic context, or location accuracy.
- Browser-local state is device-specific and can be cleared or edited by a browser user. It is not a production audit store and has no multi-operator conflict handling.
- The app demonstrates evidence gating but cannot authenticate evidence, inspect sensor provenance, or establish actual loss reduction.
- No real-world persona session has been run yet.

## Security status

- No secrets or `.env` files are required; `.env*` is ignored.
- No household records, exact addresses, worker identities, real telemetry, utility credentials, remote storage, auth, or Supabase are present.
- Zod validates feed records, coordinates, score bounds, statuses, local state, editable evidence, and override reason/history.
- RLS is not applicable without a database.
- `npm audit`: zero known vulnerabilities after dependency updates.

## Sensing, scoring, and geodata status

- Sensing: simulated feed only, clearly labeled in the interface.
- Scoring: deterministic and transparent rules only; no trained or predictive production model is claimed.
- Geodata: synthetic coordinates and an abstract client-rendered scatter/map panel; no real street basemap or utility geography.
- No outcome is presented as real municipal water-loss reduction.

## Tomorrow’s first move

Run a short operator review with the fictional Laura Mendoza persona. Ask whether she can explain each ranking change and distinguish suspected, physically confirmed, repaired, and outcome-verified events; record confusion before tuning any weights.
