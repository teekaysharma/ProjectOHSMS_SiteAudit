# OHS Site Audit Tool: Gap, Security, Vulnerability, and MVP Plan

## 1) Executive Summary
The current application is a capable single-page audit tool, but it is not yet production-ready for enterprise or regulated deployment. The largest risks are:

1. **Stored/DOM XSS exposure** from dynamic HTML construction with unescaped user-controlled values.
2. **No authentication/authorization model** and full reliance on browser `localStorage`.
3. **Dependency vulnerabilities** in the current toolchain (`vite`, `rollup`, `esbuild`).
4. **Lack of service/API boundary**, making multi-user collaboration, governance, and auditability difficult.
5. **Operational gaps** (no automated tests, no CI quality gates, and limited error resilience).

## 2) Key Gaps and Obstructions

### Product & Architecture Gaps
- **Single-user, browser-local data model** blocks multi-user workflows and centralized records.
- **No backend persistence/API** prevents role-based access, data retention policies, and integration with enterprise systems.
- **No formal tenancy/project isolation beyond client-side structures**, increasing accidental data-mix risk.

### Security Gaps
- **Unsafe dynamic HTML rendering** appears in multiple UI paths where project/site names are interpolated directly into `innerHTML` and inline event handlers.
- **Untrusted content can flow into report HTML and popup windows** via `document.write`, increasing script injection risk.
- **No authentication, session controls, or server-side authorization**.
- **Data at rest is unencrypted in `localStorage`** and is accessible to any script executing in the same origin.

### Delivery/Engineering Gaps
- **No automated unit/integration/e2e test suite** to protect regression-sensitive features.
- **No CI/CD checks** (lint, tests, dependency scanning, SAST).
- **No performance budgets or telemetry/observability hooks**.

### Operational Obstructions
- **Browser popup/download restrictions** create inconsistent report UX.
- **Local-only storage and exports** create manual, error-prone backup and data-sharing workflows.
- **No migration/version governance for evolving schemas** beyond client-side constants.

## 3) Security Issues & Vulnerabilities (Prioritized)

## Critical
1. **Potential Stored XSS in management lists and selectors**
   - Dynamic option/list HTML is built using raw project/site names and injected with `innerHTML`.
   - Inline `onclick` handlers interpolate unescaped names, creating script-breakout vectors.
   - Impact: account/session compromise (if auth is added later), data manipulation, export poisoning.

## High
2. **Report rendering surface vulnerable to HTML/script injection**
   - Generated report HTML is written into a new window via `document.write`.
   - If report fields contain injected markup/scripts, execution risk propagates into report contexts.

3. **Dependency vulnerabilities in build/dev toolchain**
   - `npm audit` reports:
     - `rollup` high severity advisory (path traversal / arbitrary file write class).
     - `vite` moderate advisory (`server.fs.deny` bypass on Windows).
     - `esbuild` moderate advisory (dev server request exposure risk).

## Medium
4. **Insecure client-side persistence for sensitive audit data**
   - Full audit payload saved directly to `localStorage` without encryption, integrity control, or expiry.
   - Risk: data leakage on shared devices, exposure through XSS, weak forensic traceability.

5. **No RBAC or permission model**
   - Any user with page access can modify configuration, project metadata, and exported outputs.

## Low
6. **Limited failure-hardening and governance controls**
   - Inconsistent validation and sanitization policy.
   - Limited immutable audit trail for who changed what and when.

## 4) MVP Scope Recommendation (Secure, Deliverable)

### MVP Goal
Deliver a **secure single-tenant web MVP** that supports:
- Project/site creation and audit scoring
- Dashboard summaries
- Basic report export (HTML/PDF)
- Role-based access (Admin/Auditor/Viewer)
- Centralized persistence with audit logging

### In-MVP Functional Scope
- Authentication (email/password + reset flow)
- Role-based authorization for CRUD/report actions
- API-backed project, site, template, and audit data
- Safe report generation pipeline (escaped templating)
- Import/export with schema validation and limits

### In-MVP Non-Functional Scope
- OWASP-aligned input validation and output encoding
- CSP + security headers + trusted-types strategy (where feasible)
- CI pipeline: lint, tests, dependency scan, SAST
- Daily backup and restore verification
- Basic observability: error logging + key business metrics

## 5) MVP Delivery Plan (Suggested 6 Weeks)

### Week 1: Foundation & Risk Burn-down
- Freeze feature churn; define MVP acceptance criteria.
- Patch dependencies and lock secure versions.
- Introduce linting, formatting, and baseline tests.
- Implement centralized encoding/sanitization helpers.

### Week 2: Security Core
- Implement authentication and role model.
- Add API/service layer and move persistence server-side.
- Add server-side validation (schema-based).

### Week 3: Data & Domain Stabilization
- Migrate project/site/audit operations to API.
- Add audit logs for create/update/delete actions.
- Add migration scripts for existing localStorage exports.

### Week 4: Reporting Hardening
- Replace `document.write` report flow with safe rendering/export pipeline.
- Enforce escaped output in templates.
- Add report integrity metadata (generator version, hash, timestamp).

### Week 5: Quality & Compliance
- Add e2e tests for core user journeys.
- Add negative security tests (XSS payload attempts).
- Add privacy/compliance checks and retention policies.

### Week 6: UAT, Hardening, and Release
- UAT with auditors and project managers.
- Performance tuning and bug fixes.
- Release checklist, rollback plan, and runbook.

## 6) Immediate Backlog (Top 12)
1. Replace unsafe `innerHTML` paths with DOM-safe builders (`createElement`, `textContent`).
2. Remove inline `onclick` string interpolation; use delegated event listeners.
3. Add centralized `escapeHtml` and input validation for all free-text fields.
4. Upgrade `vite`/`rollup`/`esbuild` to non-vulnerable versions and re-lock.
5. Add authentication + session handling.
6. Introduce backend API for persistence and authorization.
7. Add audit trail table/log for changes and exports.
8. Add schema validation for imported JSON/CSV and file-size limits.
9. Implement CSP, `X-Content-Type-Options`, `Referrer-Policy`, frame protections.
10. Add automated tests (unit + e2e) for create/edit/score/export flows.
11. Add CI gates (`npm audit`, lint, tests) with fail-on-threshold policy.
12. Add backup/restore and disaster recovery drills.

## 7) MVP Exit Criteria
- No Critical/High vulnerabilities open in app code or dependencies.
- Core flows pass automated tests + UAT sign-off.
- AuthN/AuthZ enforced for all data-modifying actions.
- Reports generated without script execution vectors.
- Operational runbook and rollback validated in staging.

## 8) Pending Gaps (Post-hardening Check)

The following items remain pending after the latest hardening changes and should be treated as MVP blockers or near-blockers.

### Blockers (Must close before MVP sign-off)
1. **No authentication and authorization**
   - Current app is effectively anonymous; no login, role model, or permission boundaries.
2. **No server-side persistence/API**
   - Audit data remains browser-local and mutable by any script in origin.
3. **No immutable audit trail**
   - Changes to scores/config/reports are not forensically attributable to a user/session.
4. **No policy-grade input validation layer**
   - Sanitization was improved in key paths but is not centralized and uniformly enforced.

### High Priority (Should close in MVP cycle)
5. **Remaining dynamic HTML and inline handlers in UI paths**
   - Several rendering functions still use `innerHTML` and inline `onclick` templates.
6. **Legacy `document.write` report flow still present**
   - Report rendering remains popup-window HTML injection based.
7. **No CSP / strict content policy**
   - Vite headers exist, but no robust CSP + nonce/hash strategy is in place.
8. **No automated quality gates**
   - No CI pipeline for lint/test/security scan enforcement.

### Important (Close by MVP+1 if needed)
9. **No backend backup/restore and retention policy**
10. **No observability baseline (error telemetry, audit metrics)**
11. **No structured release/runbook and rollback automation**

## 9) Phased Fix Plan to Reach MVP

### Phase 0 (1 week) — Stabilize & De-risk Frontend
**Goal:** close remaining client-side injection surfaces and standardize validation.

- Replace remaining `innerHTML` + inline `onclick` UI templates with DOM-safe renderers + delegated events.
- Introduce a shared validation/encoding module and apply to all free-text inputs.
- Replace report `document.write` with safe template rendering/export path.
- Add regression checks for duplicate IDs and forbidden patterns (`onclick=`, unsafe template interpolation).

**Exit Criteria**
- Zero inline `onclick=` in app templates.
- Zero unreviewed `innerHTML` sinks for user-controlled content.
- Report generation works without `document.write` execution path.

### Phase 1 (2 weeks) — Security Core (AuthN/AuthZ/API)
**Goal:** move from anonymous local app to controlled single-tenant MVP.

- Add backend service (Node/Express or equivalent) with REST API for projects/sites/audits/templates.
- Add authentication (email/password) and session/token lifecycle.
- Implement RBAC roles: Admin, Auditor, Viewer.
- Move persistence from localStorage to database-backed API.

**Exit Criteria**
- All mutating actions require authenticated user + role checks.
- Client can no longer modify authoritative data without API authorization.

### Phase 2 (1–2 weeks) — Governance & Compliance Baseline
**Goal:** make data operations auditable and recoverable.

- Add append-only audit log events for create/update/delete/export.
- Add backup/restore scripts and daily snapshot policy.
- Add schema versioning/migrations for data model.
- Implement retention rules and purge workflow.

**Exit Criteria**
- Every write operation emits an audit event with actor/time/object.
- Restore drill succeeds in staging from backup.

### Phase 3 (1 week) — CI, Security Gates, and Hardening
**Goal:** enforce quality continuously.

- CI pipeline: lint, unit tests, e2e smoke tests, `npm audit`, and SAST.
- Add security headers and CSP at server/reverse-proxy layer.
- Add dependency update cadence with PR checks.

**Exit Criteria**
- Merge is blocked on failing tests/security thresholds.
- CSP deployed with no blocking regressions for core flows.

### Phase 4 (1 week) — UAT + Release Readiness
**Goal:** production-like MVP sign-off.

- UAT with auditors and project managers on core flows.
- Validate report generation/export and project/site CRUD under role constraints.
- Finalize runbook: deploy, rollback, incident response, backup restore.

**Exit Criteria**
- UAT sign-off completed.
- Release checklist and rollback tested end-to-end.

## 10) MVP Readiness Checklist (Practical)
- [ ] AuthN/AuthZ enforced on all mutating endpoints.
- [ ] Server-backed persistence enabled; localStorage not authoritative.
- [ ] Audit log and backup/restore verified.
- [ ] No critical/high dependency or app vuln open.
- [ ] CI gates required for merge.
- [ ] UAT completed with documented pass criteria.
