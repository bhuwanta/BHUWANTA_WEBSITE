# Graph Report - .  (2026-08-29)

## Corpus Check
- Large corpus: 358 files · ~167,646 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 1075 nodes · 1301 edges · 32 communities detected
- Extraction: 63% EXTRACTED · 37% INFERRED · 0% AMBIGUOUS · INFERRED: 476 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Realestate Software|Realestate Software]]
- [[_COMMUNITY_Realestate Software|Realestate Software]]
- [[_COMMUNITY_Leads Leadsclient|Leads Leadsclient]]
- [[_COMMUNITY_Users Areas|Users Areas]]
- [[_COMMUNITY_Hierarchy The|Hierarchy The]]
- [[_COMMUNITY_Areas Projects|Areas Projects]]
- [[_COMMUNITY_Commission Rates|Commission Rates]]
- [[_COMMUNITY_Jsonld Seo|Jsonld Seo]]
- [[_COMMUNITY_Whatsapp Route|Whatsapp Route]]
- [[_COMMUNITY_Payout Shared|Payout Shared]]
- [[_COMMUNITY_Project Specification|Project Specification]]
- [[_COMMUNITY_Claude Project|Claude Project]]
- [[_COMMUNITY_Agents Architecture|Agents Architecture]]
- [[_COMMUNITY_Tsx Public|Tsx Public]]
- [[_COMMUNITY_Plots Shadnagar|Plots Shadnagar]]
- [[_COMMUNITY_Readme Phase|Readme Phase]]
- [[_COMMUNITY_Password Emails|Password Emails]]
- [[_COMMUNITY_Gatedresource Leadpopup|Gatedresource Leadpopup]]
- [[_COMMUNITY_Llms Bhuwanta|Llms Bhuwanta]]
- [[_COMMUNITY_Phase Shared|Phase Shared]]
- [[_COMMUNITY_New Registration|New Registration]]
- [[_COMMUNITY_Modules Realestate|Modules Realestate]]
- [[_COMMUNITY_Phase Registrations|Phase Registrations]]
- [[_COMMUNITY_Phase Areas|Phase Areas]]
- [[_COMMUNITY_Phase Foundation|Phase Foundation]]
- [[_COMMUNITY_Phase User|Phase User]]
- [[_COMMUNITY_Leads Report|Leads Report]]
- [[_COMMUNITY_Phase Commission|Phase Commission]]
- [[_COMMUNITY_Phase Modules|Phase Modules]]
- [[_COMMUNITY_Searchableselect Realestate|Searchableselect Realestate]]
- [[_COMMUNITY_Slug Public|Slug Public]]
- [[_COMMUNITY_Doubts Commission|Doubts Commission]]

## God Nodes (most connected - your core abstractions)
1. `requireRole()` - 110 edges
2. `createServiceClient()` - 72 edges
3. `createClient()` - 49 edges
4. `verifyCaller()` - 30 edges
5. `isAdminPeer()` - 19 edges
6. `GET()` - 18 edges
7. `getSalesRoleOrder()` - 13 edges
8. `POST()` - 13 edges
9. `fetchData()` - 12 edges
10. `requireManagePermission()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `createRegistrationAction()` --calls--> `test()`  [INFERRED]
  src/app/(REALESTATE_SOFTWARE)/REALESTATE_SOFTWARE/role/_shared/registrations/actions.ts → test_query.ts
- `handleSetPassword()` --calls--> `test()`  [INFERRED]
  src/app/(REALESTATE_SOFTWARE)/REALESTATE_SOFTWARE/password/set-password/page.tsx → test_query.ts
- `POST()` --calls--> `test()`  [INFERRED]
  src/app/api/contact/route.ts → test_query.ts
- `checkPasswordsModuleStatusAction()` --calls--> `createServiceClient()`  [INFERRED]
  src/app/(REALESTATE_SOFTWARE)/REALESTATE_SOFTWARE/role/_shared/passwords/actions.ts → src/lib/supabase/server.ts
- `toggleModuleRoleAction()` --calls--> `createServiceClient()`  [INFERRED]
  src/app/(REALESTATE_SOFTWARE)/REALESTATE_SOFTWARE/role/_shared/admin/modules/actions.ts → src/lib/supabase/server.ts

## Communities

### Community 0 - "Realestate Software"
Cohesion: 0.01
Nodes (107): AGMDashboardPage(), AGMAreasProjectsPage(), CEOAreasProjectsPage(), CoreAreasProjectsPage(), DirectorAreasProjectsPage(), DynamicRoleAreasProjectsPage(), GMAreasProjectsPage(), GoverningCouncilAreasProjectsPage() (+99 more)

### Community 1 - "Realestate Software"
Cohesion: 0.04
Nodes (73): NotFound(), POST(), getMyRegistrationsAction(), handleCancel(), handlePay(), load(), getAdminDashboardStatsAction(), getMyEarningsAction() (+65 more)

### Community 2 - "Leads Leadsclient"
Cohesion: 0.03
Nodes (54): generateMetadata(), fetchProjects(), handleDeleteBrochure(), handleFileUpload(), fetchRole(), fetchProjects(), handleDeleteLayout(), handleFileUpload() (+46 more)

### Community 3 - "Users Areas"
Cohesion: 0.04
Nodes (39): createArea(), deleteArea(), getAreas(), updateArea(), handleDelete(), handleSubmit(), AreasPage(), test() (+31 more)

### Community 4 - "Hierarchy The"
Cohesion: 0.05
Nodes (38): 0. Project Overview, 10. Migration sketch (once the above is confirmed), 11. Login credentials (live + test accounts), 12. End-to-End Application Walkthrough (login button → finished sale), 12a. Getting in — the Login button, 12b. The three admin peers — IT, CEO, Governing Council, 12c. The Operation Manager — the only approver, 12d. The sales chain — Director down to LIA (+30 more)

### Community 5 - "Areas Projects"
Cohesion: 0.13
Nodes (23): createAreaAction(), createProjectAction(), deleteAreaAction(), deleteDocumentAction(), deleteProjectAction(), getAreasAction(), getDirectorsListAction(), getDocumentsAction() (+15 more)

### Community 6 - "Commission Rates"
Cohesion: 0.11
Nodes (18): createCommissionRateAction(), createSalesRoleAction(), deleteCommissionRateAction(), getCommissionRatesAction(), getSalesRoleOrderAction(), renameSalesRoleAction(), requireAdminPeer(), slugify() (+10 more)

### Community 7 - "Jsonld Seo"
Cohesion: 0.07
Nodes (13): AboutPage(), generateMetadata(), GalleryPage(), generateMetadata(), HmdaVsDtcpPage(), sanityFetch(), generateMetadata(), ReviewsPage() (+5 more)

### Community 8 - "Whatsapp Route"
Cohesion: 0.11
Nodes (17): POST(), checkSession(), generateKey(), POST(), logLeadActivity(), triggerSalesNotification(), upsertWhatsAppLead(), POST() (+9 more)

### Community 9 - "Payout Shared"
Cohesion: 0.14
Nodes (20): getPayoutRulesAction(), getPreviewRolesAction(), previewPayoutAction(), requireAdminPeer(), setRoleScopeAction(), setUserEarnsCommissionAction(), handleEarnsToggle(), handleScopeChange() (+12 more)

### Community 10 - "Project Specification"
Cohesion: 0.09
Nodes (22): Bhuwanta CRM - Master Project Specification (Phase 1), Business Logic, Conversation Engine, Conversation State, CRUD Requirements, Dashboard, Dashboard Insights, Deliverables (+14 more)

### Community 11 - "Claude Project"
Cohesion: 0.13
Nodes (14): Authentication & Authorization, BHUWANTA Real Estate Platform, Common Commands, Design System — White + Navy Blue + Gold, Environment Variables Required, Important Conventions, Key CSS Classes, Project Overview (+6 more)

### Community 12 - "Agents Architecture"
Cohesion: 0.14
Nodes (13): Architecture Decisions, Authentication, BHUWANTA — Agent Guidelines, Changelog (Session: 2026-04-20), Colors (MUST follow), Component Patterns, Content Architecture, Design System Rules (+5 more)

### Community 13 - "Tsx Public"
Cohesion: 0.15
Nodes (5): generateMetadata(), generateMetadata(), buildProjectPageMetadata(), generateMetadata(), generateMetadata()

### Community 14 - "Plots Shadnagar"
Cohesion: 0.17
Nodes (5): generateMetadata(), buildStaticOgMetadata(), generateMetadata(), generateMetadata(), generateMetadata()

### Community 15 - "Readme Phase"
Cohesion: 0.2
Nodes (9): Deploy on Vercel, Getting Started, How to use this folder, Implementation Plans — IT / CEO / Governing Council, Known constraint carried into every phase, Learn More, or, Phase status (+1 more)

### Community 16 - "Password Emails"
Cohesion: 0.33
Nodes (6): renderButton(), renderEmailShell(), sendRecoveryEmail(), sendSetupPasswordEmail(), sendRecoveryEmailAction(), handleReset()

### Community 18 - "Gatedresource Leadpopup"
Cohesion: 0.25
Nodes (3): fireLeadConversion(), handleVerifyOTP(), handleVerifyOTP()

### Community 19 - "Llms Bhuwanta"
Cohesion: 0.25
Nodes (7): Bhuwanta Developers, Company, Contact, Free Resources, Guides, Landing Pages, Projects

### Community 20 - "Phase Shared"
Cohesion: 0.25
Nodes (7): Explicitly NOT in this phase, Files likely touched, Folder structure — DECIDED (full 11-role structure, not just IT/CEO/GC), Goal, Notes / deviations, Phase 2 — Shared Admin Shell, Routing & Auth, Tasks

### Community 21 - "New Registration"
Cohesion: 0.33
Nodes (3): handleSubmit(), resetForm(), notifyRegistrationsChanged()

### Community 22 - "Modules Realestate"
Cohesion: 0.38
Nodes (5): ensurePasswordsModuleExists(), ensureUserManagementModuleExists(), getModulesAction(), toggleModuleRoleAction(), loadModules()

### Community 23 - "Phase Registrations"
Cohesion: 0.29
Nodes (6): Explicitly NOT in this phase, Files likely touched, Goal, Notes / deviations, Phase 6 — Registrations (oversight), Tasks

### Community 24 - "Phase Areas"
Cohesion: 0.29
Nodes (6): Explicitly NOT in this phase, Files likely touched, Goal, Notes / deviations, Phase 4 — Areas & Projects (+ Base Price/MRP + documents), Tasks

### Community 25 - "Phase Foundation"
Cohesion: 0.29
Nodes (6): Explicitly NOT in this phase, Files likely touched, Goal, Notes / deviations, Phase 1 — Foundation: Schema & Role Migration, Tasks

### Community 26 - "Phase User"
Cohesion: 0.29
Nodes (6): Explicitly NOT in this phase, Files likely touched, Goal, Notes / deviations, Phase 3 — User Management (peer rights + 11-tier list), Tasks

### Community 27 - "Leads Report"
Cohesion: 0.4
Nodes (3): GET(), generateExcelBuffer(), generatePDFBuffer()

### Community 29 - "Phase Commission"
Cohesion: 0.33
Nodes (5): Files likely touched, Goal, Notes / deviations, Phase 5 — Commission Rates, Tasks

### Community 30 - "Phase Modules"
Cohesion: 0.33
Nodes (5): Files likely touched, Goal, Notes / deviations, Phase 7 — Modules + Settings/Security bug fix, Tasks

### Community 31 - "Searchableselect Realestate"
Cohesion: 0.6
Nodes (3): close(), handleEscape(), selectOption()

### Community 34 - "Slug Public"
Cohesion: 0.5
Nodes (1): generateMetadata()

### Community 44 - "Doubts Commission"
Cohesion: 0.67
Nodes (2): Commission/Percentage Structure, Doubts & Questions

## Knowledge Gaps
- **146 isolated node(s):** `Bhuwanta CRM - Master Project Specification (Phase 1)`, `Objective`, `Phase 1 Goals`, `Technology Stack`, `Product Vision` (+141 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Slug Public`** (4 nodes): `generateMetadata()`, `generateStaticParams()`, `page.tsx`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Doubts Commission`** (3 nodes): `doubts.md`, `Commission/Percentage Structure`, `Doubts & Questions`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `requireRole()` connect `Realestate Software` to `Realestate Software`, `Leads Leadsclient`?**
  _High betweenness centrality (0.243) - this node is a cross-community bridge._
- **Why does `createServiceClient()` connect `Realestate Software` to `Realestate Software`, `Leads Leadsclient`, `Users Areas`, `Areas Projects`, `Commission Rates`, `Whatsapp Route`, `Payout Shared`, `Password Emails`, `Modules Realestate`?**
  _High betweenness centrality (0.215) - this node is a cross-community bridge._
- **Why does `createClient()` connect `Leads Leadsclient` to `Realestate Software`, `Realestate Software`, `Users Areas`, `Whatsapp Route`?**
  _High betweenness centrality (0.207) - this node is a cross-community bridge._
- **Are the 109 inferred relationships involving `requireRole()` (e.g. with `GoverningCouncilDashboardPage()` and `GoverningCouncilSettingsPage()`) actually correct?**
  _`requireRole()` has 109 INFERRED edges - model-reasoned connections that need verification._
- **Are the 70 inferred relationships involving `createServiceClient()` (e.g. with `sendRecoveryEmailAction()` and `getDocumentsForProjectsAction()`) actually correct?**
  _`createServiceClient()` has 70 INFERRED edges - model-reasoned connections that need verification._
- **Are the 47 inferred relationships involving `createClient()` (e.g. with `handleSetPassword()` and `requireRole()`) actually correct?**
  _`createClient()` has 47 INFERRED edges - model-reasoned connections that need verification._
- **Are the 29 inferred relationships involving `verifyCaller()` (e.g. with `createClient()` and `createServiceClient()`) actually correct?**
  _`verifyCaller()` has 29 INFERRED edges - model-reasoned connections that need verification._