# IT Equipments - Execution Tracker

## Goal
Upgrade/complete IT Equipment Management system end-to-end (frontend + backend + database) including missing modules/pages, bug fixes, performance improvements, full CRUD integration, reports/export/import/backup integration, and deployment readiness (build/lint/smoke tests).

## Assumptions
- Tooling may not support ripgrep; use list_files/read_file for exploration.
- Backend API is the source of truth for payload shapes and behaviors.

---

## Phase 1 — Repo Audit (Frontend/Backend)
- [ ] 1.1 Inspect shared UI/components: LayoutWrapper, Header, Sidebar, TableWrapper, ActionButtons, dialogs, toasts.
- [ ] 1.2 Inspect module pages: assets, purchases, vendors, departments, deliveries, transfers, returns, maintenance.
- [ ] 1.3 Inspect reports pages + ReportExportButtons integration.
- [ ] 1.4 Inspect import/backup/settings pages and flows.
- [ ] 1.5 Inspect frontend mappers and payload shapes in src/lib/*Mapper.js.

## Phase 2 — Backend/DB Compatibility Check
- [ ] 2.1 Inspect relevant backend endpoints: Assets, Deliveries, Transfers, Returns, Maintenance, Reports, Export/Import/Backup, Approvals, Security.
- [ ] 2.2 Validate DTOs vs frontend request/response usage.
- [ ] 2.3 Validate DB scripts exist for required features and match code expectations.

## Phase 3 — Implement Upgrades / Fixes
- [ ] 3.1 Fix frontend bugs (state handling, navigation, form validation, error/empty/loading states).
- [ ] 3.2 Ensure UI button visibility and route gating (RBAC) are consistent.
- [ ] 3.3 Complete/repair CRUD end-to-end flows for each module (list/add/edit/view/archive/cancel/reject as applicable).
- [ ] 3.4 Fix reports/export/import/backup UI to fully call backend and handle downloads.
- [ ] 3.5 Add missing modules/pages if any are referenced but not implemented.

## Phase 4 — Performance + Reliability
- [ ] 4.1 Reduce unnecessary re-renders; ensure stable keys in lists.
- [ ] 4.2 Add/verify loading skeletons and prevent double-submit.
- [ ] 4.3 Validate optimistic UI behavior (if used) matches backend outcomes.

## Phase 5 — Testing + Help/Docs
- [ ] 5.1 Run frontend: `npm.cmd run lint`.
- [ ] 5.2 Run frontend: `npm.cmd run build`.
- [ ] 5.3 Run backend build.
- [ ] 5.4 Smoke test: login → dashboard → each module open.
- [ ] 5.5 Smoke test: one add/edit/view/delete per module.
- [ ] 5.6 Smoke test: reports + export + print.
- [ ] 5.7 Smoke test: import/backup tracking + snapshot download.
- [ ] 5.8 Update README/DEPLOYMENT/help pages if required.

---

## Progress Log
- [x] Created TODO tracker.

