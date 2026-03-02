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
