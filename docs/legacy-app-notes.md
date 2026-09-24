# Legacy app notes

What the legacy app (`index.html`, `main.js`, `public/js/`) was asked to do and what went
wrong while building it. Distilled on 2026-09-24 from the build and test logs left by
earlier AI build tools, which were then deleted from the repo (they remain in git history).
Use this when porting views in Stage 4 of change 0001, so behaviour the owner asked for
is not lost.

## Requirements the owner set during the legacy build

Charts
- Charts fit their containers with axes fully visible, and resize with the screen.
- Scopes: Current Site (site questions only), Management, All Sites, and Project Overview
  (management plus site combined; first named "Total Overview").
- Two views per scope: By Audit Type, and By Sections as a grouped bar chart.
- Site comparison offers Stacked Bar, Grouped Bar and Radar.
- A question is counted once, even when it appears across several sites or projects.

Recommendations
- Generated automatically from the scores, refreshed when data changes, shown with
  priority badges. A sample-data button existed for demonstrations.

Navigation and settings
- One project and one site selector in the header; the site list follows the project.
- Project management lives in System Settings, not on the dashboard.
- System Settings lists projects, sites and questions for editing and removal.
- Questions are managed in two tabs (Management System, Site Performance) and numbered
  hierarchically: `Section.Question`, with full question text shown.
- Management questions belong to the project; site questions belong to the site.

Reports
- Fields: report title, subtitle, company name, description, and a logo upload.
- Outputs: Generate Executive Report, and Export to HTML.
- Layout matches the dashboard, fits A4 with narrow margins, and can be shown full-screen
  for print-to-PDF.

## Problems met, and what they mean for the port

- **Functions shared through `window` globals broke.** The owner hit
  `createExecutiveReportHTML is not defined` and `calculateOverallScore function not
  available` because modules reached each other through `window`. Port with ES module
  imports; the single-file build bundles them.
- **The executive report opened in a new window, and HTML export used a blob download.**
  Automated testing saw the popup blocked and the download event time out; the testing
  log put both down to browser security, without confirming on a real device. For a file
  opened from local storage on a tablet, prefer an in-page report view with the browser's
  own print, and treat download behaviour as a device-test item (spec §12 checklist).
- **Management answers were project-level.** Spec §6.3 changes this to per assignment,
  with a "copy from another assignment" shortcut. That reverses an earlier owner request;
  see spec concern C6.
