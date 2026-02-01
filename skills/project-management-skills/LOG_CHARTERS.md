# Charters (Cache)

Charters must be **clear and detailed**, capturing objective, scope, guardrails, dependencies, and verification plans.

# OC-YYYYMMDD-0001 — Kernel Governance OS (User)

### Objective
Define and enforce the governance OS for all OpenClaw projects.

### Scope (In)
- Project ID enforcement
- Charter-first workflow
- Conflict detection and logging
- Severity mapping and escalation
- Runtime integration with workspace templates

### Scope (Out)
- Project-specific delivery beyond governance scope
- Bypassing gates or severity handling

### Guardrails
- Safety and correctness are primary.
- Stop-work rules are mandatory.
- Overrides require written records.

### Dependencies
- `LOG_PROJECTS.md`
- `LOG_CONFLICTS.md`
- `LOG_DECISIONS.md`
- `LOG_ACTIVITY.md`
- OpenClaw workspace templates (external to the project management skill)

### Success Criteria
- All work is tied to a Project ID.
- All projects have charters.
- Conflicts are logged and routed.

### Verification Plan
- Audit logs for Project ID usage.
- Check Conflicts for proper routing.

### Non-Goals
- Business-specific delivery requirements.

### Change Control
- All changes recorded in **Decisions**.

---

### Charter Lite Template (Copy/Paste)

# <Project ID> — <Project Name>

#### Objective

#### Scope (In)

#### Scope (Out)

#### Success Criteria

#### Non-Goals

#### Change Control

---

# OC-20260201-0002 — Mog PRD (Fix, Improve, Iterate)

#### Objective
Create a comprehensive PRD to fix, improve, and iterate on Mog (OpenClaw + MoltBook ecosystem), covering product, engineering, and DevOps requirements.

#### Scope (In)
- PRD covering onboarding, feed, search, create, watch, library, share, and core UX flows
- Technical fixes, reliability, observability, and deployment improvements
- OpenClaw + MoltBook integration considerations
- Prioritized roadmap, success metrics, and risks

#### Scope (Out)
- Implementing fixes or shipping code changes
- Brand/marketing strategy beyond product requirements

#### Success Criteria
- PRD is complete, structured, and actionable
- Clear prioritization (P0/P1/P2), owners, and milestones
- Includes acceptance criteria and instrumentation plan

#### Non-Goals
- Detailed implementation tasks or code-level specs

#### Change Control
- Changes logged in LOG_DECISIONS.md with rationale

### Charter Full (Optional Expansion)
- guardrails
- dependencies
- verification plan

---

# OC-20260201-0003 — ApeChain x402 Payouts PRD (Mog + ApeGate)

#### Objective
Define a PRD to enable ApeCoin streaming payouts via x402 for Mog, using ApeGate repo context and senior DevOps + todo planning.

#### Scope (In)
- Product requirements for ApeCoin streaming payouts via x402
- Integration context from ApeGate repo
- DevOps requirements (infra, CI/CD, observability, security)
- Todo plan with milestones and acceptance criteria

#### Scope (Out)
- Implementing code changes
- Non‑ApeChain payment methods

#### Success Criteria
- PRD is complete, structured, and actionable
- Clear scope, milestones, and acceptance criteria
- DevOps and rollout plan included

#### Non-Goals
- Marketing, branding, or non-product strategy

#### Change Control
- Changes logged in LOG_DECISIONS.md with rationale
