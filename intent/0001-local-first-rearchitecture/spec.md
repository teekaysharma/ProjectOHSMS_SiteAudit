# OHSMS Site Audit — Local-First Rearchitecture

**Date:** 2026-08-27
**Status:** Design — awaiting approval
**Supersedes:** `MVP_GAP_SECURITY_PLAN.md` (hosted multi-user direction, abandoned)
**Intent:** [`intent.md`](./intent.md) · **Plan:** [`plan.md`](./plan.md)

> This document reconciles two brainstorming conversations that forked in the UI on
> 2026-08-27. Neither transcript was authoritative on its own: one branch established the
> *why* (evidence-grade records, device constraints), the other established the *domain*
> (scope-differentiated concurrent work, phase trees). This spec is the merge point.

---

## Flagged concerns (added 2026-09-24)

Raised while moving this spec into the intent home. The owner resolves each one before
accepting the spec, or carries it forward explicitly. Nothing below changes the design.

- **C1. Offline persistence on iPad is assumed, not verified.** The design keeps drafts,
  events and photos in IndexedDB for a page opened from local storage. §11.3 tests that the
  built file *opens* from `file://`; nothing yet tests that data *survives* closing and
  reopening the browser, or how an iPad opens a local HTML file at all (Files app preview
  versus Safari). Proposed: add "record survives browser restart" to the §12 manual
  checklist on all four platforms, and run it at the end of Stage 1, not Stage 5.
  Status: inference from the design, not tested on a device.
- **C2. Web Crypto on `file://`** (§7.4) remains unverified on the four platforms. The
  pure-JS SHA-256 fallback covers it. Carried forward, no change.
- **C3. Disclaimer wording** (§10.1) is still a draft and must be reconciled with
  VisualRiskAssessor. Owner decision.
- **C4. Section-to-phase binding** is derivable from the salvaged material but needs owner
  confirmation (`docs/salvage/README.md`). Owner decision, needed before Stage 2.
- **C5. The live legacy report bands scores differently from §5.4.** Verified in code:
  `public/js/reportGeneration.js:1318-1323` colours report scores with its own four-band
  scale (`>= 80` excellent, `>= 70` good, `>= 50` fair, else poor) applied to percentages
  already rounded with `Math.round`, while the dashboard (`main.js:68-72`) uses the §5.4
  strict bands. A site at exactly 80% is styled "excellent" in the HTML report and rated
  Satisfactory on the dashboard. The Stage 4 port of `reportGeneration.js` must not carry
  this forward: bands apply to the unrounded percentage, from one function. Whether to
  patch the live legacy app now is an owner decision.
- **C6. Management audit scope reverses an earlier owner request.** During the legacy
  build the owner asked for management questions to be project-based, not site-based
  (`docs/legacy-app-notes.md`). §6.3 records the Management System Audit per assignment,
  with "copy from another assignment" for uniform answers. The design reasons are stated
  in §6.3; the owner confirms the change explicitly when accepting this spec.
  Evidence for the choice: CoP 53.1 §1(c) calls the OSH-CMP "a site-specific plan", and
  CoP 53.0 §3.3.3(a)(v) allows only one Principal Contractor for the construction work at
  any time. Where one project runs several sites under one PC and one OSH-CMP, a project
  answer fits; where scopes or PCs differ, a per-assignment answer fits.

C7 to C14 were raised after the owner stressed that errors from this tool can contribute
to injury or death on site. The score scale is categorical (legacy `main.js:26-31`):
0 Not Applicable/Not Observed, 1 Major Non-Conformance, 2 Minor Non-Conformance,
3 Observation/Improvement, 4 Conformance, 5 Best Practice. §5.4 averages it. The cases
below were computed with the §5.4 formula.

- **C7. An average can hide a Major Non-Conformance.** Nine items at 5 and one Major NC
  at 1 give 92%, rated **Excellent**. If that one item is site question 3.4 ("Excavation
  atmosphere testing (O2, H2S, LEL) before entry"), the report reads Excellent while a
  potentially fatal failure is open. The spec has no concept of a critical finding,
  imminent danger or stop-work, and no rule that an NC needs a comment or photo.
  Proposed, without touching the bands: every open Major NC is listed first on every
  dashboard and report, and no band is ever shown without the count of open Major NCs
  beside it; scores 1 and 2 require a comment before Finalize; a separate "imminent
  danger" flag, independent of the score, is shown above everything. Owner decision.
  Evidence (`docs/references.md`): the codes themselves define stop conditions, e.g. CoP
  1.1 §3.24.1 Table 1 "Stop removal work" at 0.02 fibres/mL or more, and §3.28.2.2(d)
  "Work shall not proceed" while an enclosure leaks. A question whose failure the code
  treats as a stop condition can carry that as a catalogue attribute with its clause
  citation, so the flag rests on the code rather than on each auditor's judgement alone.
  Further stop conditions in the codes: Elements v4.0 Element 1 §3.2.5(b)(viii) (employees
  empowered to stop work on imminent exposure); CoP 53.0 §3.3.5(i)(ii) (PC stops a
  non-compliant person's work); CoP 21.0 §3.13(a) (scope change: work ceases) and §3.14
  (emergency: all permits suspended); CoP 34.0 §3.6.6(e) (lifting ceases at wind of
  38 km/h or gusts above it) and §3.1.3(a)(vii) (loss of communication: lifting
  suspended); CoP 23.0 §3.3(a)(ii) (work stops while people cross the exclusion zone);
  CoP 27.0 §3.10(b) (no confined space entry until every permit condition is met and
  verified) and §3.8(a) (no entry without rescue arrangements). From the third set: CoP
  26.0 §3.9(a) (a partly erected or dismantled scaffold carries a "not to be used" notice
  and its access is blocked), §3.12.2(a) (ladders as uprights for a platform "strictly
  prohibited"), §3.13(a)(x)-(xi) (no person on a tower scaffold while it is moved, never
  moved in windy conditions); CoP 17.0 §3.10.1(d) (a manoeuvre is discontinued when the
  operator cannot continue safely); CoP 2.0 §2(f) (an employee who fails the PPE
  competency test does not do the task); CoP 22.0 §3.6.1(a)(ii) (defective barricade
  components withdrawn and tagged "Dangerous, Do Not Use"); CoP 28.0
  v4.1 §3.2(a) (no hot work outside a designated area without a hot work permit) and
  §3.4(a)(i), (ix) (permit before hot work in a hazardous area; flammable gas or vapour
  below 5% LEL); CoP 36.0 §3.1.1(b)(xi) and §3.9(a) (unsafe or damaged plant stopped or
  withdrawn); CoP 39.0 §3.5.2(b)(v) (a damaged underground service: everyone leaves the
  area) and §3.4.3(b)(v) (plant able to exceed the goalpost height prohibited under
  overhead lines); CoP 33.0 v4.1 §3.4(d)(iii)(3) (busy or high-speed lanes never crossed
  on foot); CoP 37.0 v4.1 §3.10(a)(ii) (no metal or wire-reinforced ladder within 6 m of
  live 1500 V overhead supplies or high voltage equipment, directly relevant to an HV
  site) and §3.3(b) (self-made ladders prohibited).
  ISO/IEC 17021-1:2015 §3.12 Note 1 adds that several minor nonconformities on the same
  requirement can show a systemic failure and so a major nonconformity; the tool could
  flag repeated 2s on one question across visits (C11, continued non-conformance).
- **C8. Score 0 mixes Not Applicable with Not Observed.** Both are excluded from the
  average. One item at 5 with nine Not Observed gives 100%, rated **Excellent**, on 10%
  coverage. Not Applicable means the hazard does not exist; Not Observed means the auditor
  did not check it. Proposed: split 0 into two values, show coverage ("rated 1 of 10
  applicable items") beside every percentage, and withhold the band below a coverage
  threshold the owner sets. This changes the score scale the owner set, so owner decision.
  Sources for the scale (read 2026-09-24, detail in `docs/references.md`): ISO 19011:2018
  §6.4.8 allows grading nonconformities 1 to 5 or minor/major by the organization's
  context and risks. ISO/IEC 17021-1:2015 §3.12 and §3.13 define major and minor
  nonconformity in terms of the management system's capability to achieve its intended
  results, which fits the Management System Audit but not a physical hazard found on a
  site walk. Neither standard defines Not Observed, Observation or Best Practice as a
  grade, or averages grades into a percentage. 17021-1 §9.4.5.2 forbids recording a
  nonconformity as an opportunity for improvement: a failed requirement is never a 3.
  Owner decision: written definitions for each score on each audit type.
- **C9. Question content carries technical limits that need a competent person's check.**
  Examples from the salvaged catalogue: 3.1 "depths >1.5m", 3.3 "benching/sloping (1.5:1
  minimum)", 3.5 "minimum 2m setback". The tool imports the text verbatim (§11.1), so it
  cannot correct these, and software tests cannot confirm them. Proposed: catalogue v1 is
  reviewed against current primary sources and signed off by a named competent person
  before field use; any correction becomes catalogue v2 through `catalogue_updated`, so
  the history shows who changed what. Owner decision on reviewer and sources.
  The codes themselves need care. CoP 23.0 sets different limits for different
  situations: guardrails at edges with a fall of 2 m or more (§3.11.1(a)) but a standard
  railing on open-sided floors and platforms from 1.2 m (§3.14.1(a)); a guardrail load of
  1.25 kN (§3.11.2(f)) but 90 kg for a standard railing (§3.14.1(f)). Ladders at scaffolds
  extend 1.05 m (5 rungs) above the platform (CoP 26.0 §3.12.3(a)(iii)); ladders in
  excavations project 1 m above ground (CoP 29.0 §3.11(a)(iii)); portable ladders in
  general slope 70° to 80° and extend at least 1 m above the highest access point (CoP
  37.0 v4.1 §3.7(b)(i)-(ii)), while scaffold ladders are set at 75°. A question must cite
  the clause for its situation. CoP 26.0 §3.4.7 agrees with CoP 23.0 §3.11.2 on guardrail
  height (950 mm), toe board (150 mm) and rail gaps (470 mm).
  Citations that conflict and need a competent person's ruling. In the v4.0 texts, CoP
  34.0 §2.1(e)-(f) cited the deleted "Mechanism 8.0", and CoP 23.0 §3.13.2, 24.0
  §3.1.1(b) and 34.0 §3.11 cited "Ministerial Order No. 37/2 (1982)" or "No. 32 of 1982".
  The v4.1 texts (27 February 2026) replace these: CoP 34.0 §2(e)-(f) require an approved
  third-party training provider; CoP 23.0 §3.13.2(a)(i) and CoP 24.0 §3.1.1(b) cite MOHRE
  Administrative Decision No. (19) of 2023; CoP 34.0 §3.11(a)-(b) cite QCC ADS 22/2018 and
  require thorough examination by third-party inspection bodies approved by QCC, where
  v4.0 said engineers approved by the Ministry of Labour. CoP 17.0 is still v4.0 and its
  §3.1.1(b) still cites Ministerial Order No. 32 of 1982; whether that order is superseded
  by the 2023 decision is not stated in any code read. CoP 53.1 §3.1 item 5.16 cites CoP 22.0 and CoP 37.0 for scaffolds and ladders, but
  CoP 22.0 is Barricading of Hazards and the scaffolding code is CoP 26.0 (CoP 26.0
  §3.7(a)(iv) names both), so a criterion copied from CoP 53.1 would cite the wrong code.
  Mechanism 7.0 has two titles: the body text of CoP 2.0, 17.0 and 26.0 calls it
  "Occupational Safety and Health Practitioner and Service Provider Registration", while
  the amendment records of CoP 2.0 and 17.0 say it was renamed "Public and Preventive
  Health Practitioner and Service Provider Accreditation".
  Elements v4.0 Element 9 §3.4 makes controlled documents subject to approval before
  issue and revision control, which the catalogue version sign-off above satisfies.
  Checked against the codes (text search plus full reading):
  - Question 3.3 "benching/sloping (1.5:1 minimum)" can pass an unsafe slope. CoP 29.0
    v4.0 §3.5 Table 1 gives safe temporary slopes in degrees by ground type, dry and wet
    (read here as ranges whose upper figure is the steepest allowed). 1.5 horizontal to 1
    vertical is 33.7°, steeper than the table's upper figure for wet gravel (30°), wet
    sand (30°), wet silt (20°), dry soft clay (30°), wet soft clay (20°) and wet firm clay
    (25°); read as 1.5 vertical to 1 horizontal it is 56.3°, steeper than every entry.
    A single ratio cannot stand for a table that depends on ground and water.
  - Question 3.1 ">1.5m" and question 3.5 "minimum 2m setback" do not appear in CoP 29.0.
    Its depth triggers are support for excavations over 1.2 m deep where material may
    fall (§3.7(a)) and rigid 950 mm barriers where a fall exceeds 2 m (§3.11(a)(iv)-(v));
    it sets no spoil setback distance.
  - Question 3.4 matches CoP 27.0 v4.0 §3.10(e): oxygen 19.5% to 23.5%, flammable gas
    below 5% LEL. CoP 27.0 sets no hydrogen sulphide limit, so the H2S part needs another
    source.
  - Questions 10.2 and 10.3 monitor a "Heat Index"; CoP 11.0 v4.0 never mentions a heat
    index and requires the Thermal Work Limit (§3.1.1(e)-(f), §3.2(b)(ii)). An auditor
    could score Conformance for heat index readings while the required TWL assessment is
    missing. The "1 per 25 workers" in 10.4 and "within 200m" in 10.5 are not in CoP 11.0,
    which says drinking water is provided "close to the worksite" (§3.2(b)(v)).
  - Sections 7 and 9 (HV installation, testing and commissioning) cannot be checked
    against CoP 15.0: its §1(m) places requirements for overhead lines, underground
    cables and substations in the procedures of the relevant competent authorities.
    **Owner decision (2026-09-24):** the distribution company's rules are not available;
    the questions in sections 7 to 9 are used as predefined, and their own text is the
    audit criterion. These items then rest on no primary source. Proposed, owner to
    decide: their criterion (C13) reads "catalogue question text, owner decision
    2026-09-24", so no report implies a code was checked, and the competent person
    sign-off above still covers them.
  - Question 2.3 "Site perimeter fencing (min 2.4m)": CoP 22.0 v4.0 §3.5.6(a)(ii) places
    fencing requirements in the relevant Building Code and the Abu Dhabi construction
    regulations. The 2.4 m figure is not in CoP 22.0 and its source has not been read.
  - Question 4.8 "rigid barriers (not tape)" is stricter than CoP 22.0, which sets the
    barricade type by risk assessment: soft barricading where the risk is low
    (§3.4.1(a)), hard barricading where the assessment calls for a physical barrier
    (§3.4.2(a)). The criterion must say which rule the auditor applies.
  - Question 6.1 matches CoP 17.0 v4.0 §3.4(f), which requires Arabic and English on all
    OSH signs, not only at HV areas. Question 6.2 "at all entry points" is the question's
    own wording; CoP 2.0 v4.0 §3.7(b) requires signs in all areas where PPE is required.
    "Illuminated" in 6.3 and "reflective materials" in 6.4 are in neither CoP 17.0 nor
    CoP 22.0. CoP 17.0 §3.9(c) places fire safety signs under the Abu Dhabi Building Codes
    and the Civil Defence UAE Fire and Life Safety Code; CoP 22.0 §3.5.5(a) requires
    warning lights on barricades in darkness where the risk assessment calls for them.
  - Question 11.5 "competent person certification": CoP 26.0 v4.0 §2(f) requires a
    Scaffolding Competency Certificate from an approved third-party provider for scaffolds
    over 10 m and all suspended scaffolds, and from a registered trainer below 10 m;
    mobile tower erectors are trained to PASMA or equivalent (§2(d)). An auditor needs the
    height split to score the question.
  - Section 12 ratings have no source among the documents received. CoP 2.0 and CoP 15.0
    §3.3(d) require protective equipment to be appropriate, maintained and used, and name
    no rating. "Cat 2-4" (12.1), "Class E" (12.2) and "EH marking" (12.4) are, recalled
    and not verified here, classes from US standards (NFPA 70E, ANSI/ISEA Z89.1, ASTM
    F2413). CoP 2.0 §3.2(b) requires PPE to meet Cabinet Resolution No. (3) of 2016 and
    ESMA-approved standards. That Resolution's Annex (the copy read; Art. 10(1) lets ESMA
    amend it) makes 111 standards mandatory and names none of these classes: helmets
    under ISO 3873 with no electrical class, footwear under ISO 20345 to 20347 with no
    electrical-hazard class, heat and flame clothing under ISO 11612 and ISO 14116 with no
    arc rating. Question 12.3 does have a mandatory source: insulating gloves under GSO
    IEC 60903:2014 (Annex item 109). A criterion that asks for a US class the UAE scheme
    does not name may fail PPE that is lawful here, or pass PPE with no ECAS certificate
    (Art. 10(9)); a competent person decides what each question checks. Question 12.7
    (SF6): CoP 2.0 §3.9(d) requires a written Respiratory Protection Program with fit
    testing wherever respirators are required, evaluated annually (§3.9(j)); no document
    received sets an SF6 exposure limit, and §3.9(a) refers to limits set by federal or
    local regulations.
  - Question 11.4 "min 1 per 25 workers" is stricter than CoP 4.0 v4.0 §3.2.1(a): at
    least one first aider per worksite per shift below 50 employees, and one per 50
    employees above. The criterion must say which ratio the auditor applies.
  - Question 13.3 "AED units ... (max 3-minute response time)": CoP 4.0 §3.4(a) says
    employers "should consider" AEDs on the basis of risk assessment, and the 3-minute
    limit in §3.2.2(a)(i) applies to initial first aid anywhere on site, not to AEDs. The
    question turns a recommendation into a requirement.
  - Section 4 (plant) against CoP 36.0 v4.1: question 4.10 matches §3.15.1(b)
    (preventative maintenance schedule). CoP 36.0 sets no ROPS/FOPS requirement (4.4) and
    no daily pre-use check signed by a competent person (4.3); §3.1.1(b)(x) requires
    "appropriate tests, checks and inspections" without a frequency.
  - Section 5 (traffic) against CoP 44.0 and CoP 33.0 v4.1: "minimum 6m wide" (5.1) is in
    neither; CoP 44.0 §3.3.2(a) requires routes wide enough for the vehicles, and CoP 33.0
    §3.5.1(a)(v) recommends 2.75 m one-way and 5.5 m two-way for traffic past road works.
    "Max 20km/h" (5.3) is an example; CoP 44.0 §3.3.2(c)(ii) sets limits by risk
    assessment. "Certified training" (5.4) is stricter than CoP 44.0 §3.3.4(a)
    ("appropriately trained"), which also makes marshals for reversing a last resort
    (§3.3.5(c)). "CCTV and 24/7 monitoring" (5.8) is in neither code; CoP 22.0
    §3.5.6(a)(iii) requires an out-of-hours guard only where unauthorised access is a
    higher risk. Question 5.2 matches CoP 44.0 §3.1.1(b)(ii)-(iii) and §3.3.3(a), and 5.7
    matches §3.3.2(b).
  - Question 6.4 "reflective materials" has a source for road works: CoP 33.0 v4.1
    §3.6.1(a)(vi) requires reflective signs where there is no lighting.
  - Sections 7 to 9 (owner decision above) are not wholly without an ADOSH source. CoP
    39.0 v4.1 sets requirements for work near overhead lines and underground cables:
    written isolation confirmation from the service provider (§3.4.2(b)), crossings under
    lines at most 10 m wide with goalposts and at least 6 m clearance where reasonably
    practicable (§3.4.3(b)(i)-(iii)), jib restrictors (§3.4.3(b)(vi)), no mechanical
    excavation within 0.5 m of a known service and a banksman between 3 m and 0.5 m
    (§3.5.3(c)(i)-(ii)). Where a section 7 to 9 question concerns work near existing
    services, CoP 39.0 can be its criterion; the owner decides whether that changes the
    decision.
- **C10. Record dates come from the device clock.** The event envelope's `ts` and the
  visit `date` are taken from the tablet. A wrong clock puts a wrong date on evidence used
  in disputes, and the spec has no check. Proposed: show device date and time for the
  auditor to confirm at Finalize, and flag any event whose `ts` is earlier than the
  previous event in the same device chain. Owner decision on scope for v1.
- **C11. Findings have no follow-up.** The spec records non-conformances but has no
  corrective action, owner, due date or close-out verification. Either v1 tracks them, or
  every report states that corrective action is tracked outside this tool. Owner decision.
  Evidence: CoP 53.1 v4.0 §3.1 item 4.9 requires "timelines, for responding to
  non-compliance findings" from audits and inspections, and lists non-compliance and
  corrective action reports; CoP 1.1 §3.11(h) sets action fields (immediate actions,
  timescales, owner). An audit record without a response deadline leaves that
  requirement to be met elsewhere.
  Stronger evidence from Elements v4.0: Element 8 §3.5(b) "where actions are identified to
  correct a non-conformance, timescales and individual responsibilities are assigned";
  §3.5(a)(vii) requires the effectiveness of corrective action to be reviewed at
  close-out; §3.3.1(b) requires an action plan with timescales for every major
  non-compliance from the annual third-party audit. Element 1 §4(d) grants immunity from
  prosecution for non-compliance found internally and corrected "within a reasonable
  time frame", so the date a finding was raised and the date it was closed carry legal
  weight. CoP 53.0 §3.3.4(a)(viii) requires "identified continued non-conformance" to be
  reported to the developer or client immediately. Recommended for v1, owner to decide:
  each Major or Minor NC records the action, the responsible person, the due date, the
  close-out date and the effectiveness check; a finding that stays open, or recurs on the
  same question at the next visit, is flagged as continued non-conformance.
- **C12. The salvaged catalogue does not cover every CoP 53.1 hazard topic.** It is
  written for an HV substation project (ADWEA, power plant interface, HV sections).
  Reading site sections 1 and 2 in full and searching all 208 questions found no site
  question for hot work, confined space entry, asbestos, housekeeping, manual handling,
  formwork, demolition, piling or temporary works design checks, all listed in CoP 53.1
  Section 5. Management question 8.3 checks that a permit system exists; no site question
  verifies permits in use. Site question 2.5 checks RCD protection and earthing, while
  CoP 53.1 item 5.10 requires temporary installations on 110 V. Keyword search can miss
  differently worded questions, so a competent person confirms the gap list. Owner
  decision: one catalogue per project type, or one general catalogue with phase and
  project-type applicability.
  Checkable site conditions in the codes read so far, with no matching site question:
  permits (CoP 21.0: validity at most 12 hours or one shift §3.6(d), work party signatures
  before work §3.10(b), original permit displayed at the worksite §3.10(c), permit holder
  not the issuer §3.5.3(a)); work at height (CoP 23.0: guardrail height 950 mm and toe
  board 150 mm §3.11.2(a)-(b), net inspections weekly §3.12.2(f), harness inspections
  6-monthly §3.13.2(f), platforms inspected at intervals not exceeding 7 days §3.15(c));
  lifting (CoP 34.0: lifting plan §3.3, written appointment of the Appointed Person
  §3.2(c), anemometer on site §3.6.6(a), SWL marked on every accessory §3.6.2(b),
  equipment register and daily and weekly inspections §3.12, thorough examination at
  least every 12 months and every 6 months for accessories and man-lifting §3.11, which
  v4.1 places under QCC ADS 22/2018).
  Further, from the second set of codes: excavations inspected before work, at least
  daily and before each shift, and thoroughly examined weekly with a record (CoP 29.0
  §3.13); ladders at 4:1 projecting 1 m above ground (§3.11(a)(ii)-(iii)); confined space
  signs "CONFINED SPACE – PERMIT REQUIRED – DO NOT ENTER" in Arabic and English (CoP 27.0
  §3.4(b)), stand-by man (§3.10(e)(ii)), rescue arrangements before entry (§3.8(a));
  temporary supplies and tools on 110 V (CoP 15.0 §3.13(a), §3.5(i)), which confirms the
  gap in question 2.5; locks used wherever the isolating device accepts one and tags in
  Arabic and English (CoP 24.0 §3.3(b), (h)(ii)); heat: programme where 35 °C is
  foreseeable (CoP 11.0 §3.1.1(e)), acclimatization of 5 to 7 days (§3.2(b)(i)), a
  personal water container of at least one litre and no shared cups (§3.2(b)(vi)),
  refillable containers sealed with a dated tape and refilled daily (§3.2(g)), no lone
  work in heat stress areas (§3.2(e)), the Ministry of Labour midday break (§3.1.1(g)).
  From the third set: no site question checks scaffold condition. CoP 26.0 requires
  inspection before first use, at least every 7 days, after alteration or repair and
  after events such as strong winds, with records on site (§3.14(a)(vi); records are
  §3.14(a)(vii) in v4.1); each scaffold marked with date erected, use, loading, last
  inspection and inspector (§3.14(b)); a
  handover certificate kept on site (§3.14(a)(iv)); an engineer's design drawing for
  scaffolds over 10 m (§3.2.3(a)); guardrail 950 mm, toe board 150 mm, mid-rail above
  2 m, rail gaps at most 470 mm (§3.4.7); board gaps at most 25 mm each and 50 mm in
  total (§3.4.3(a)(ii)); sole boards at least 225 mm by 450 mm (§3.4.2(a)(iv)); ladders
  at 75° with a landing every 9 m (§3.12.3(a)(iii), §3.4.8(a)(i)); tower height at most
  three times the minimum base unless the manufacturer states otherwise, castors locked
  (§3.13(a)(iii), (vii)). Barricading (CoP 22.0): weekly documented inspection
  (§3.6.1(a)(iii)); signs giving the responsible supervisor's name, phone number and
  expected duration (§3.5.2(a)(ii)); tape at least 2 m back from an edge with a fall of
  less than 2 m (§3.5.3(a)(ii)); top edge between 900 mm and 1200 mm (§3.5.4(a)(i)); not
  tied off to electric cables or air hoses (§3.5.1(a)(vii)); entry points that do not
  lead straight into the hazard (§3.5.1(a)(vi)). PPE (CoP 2.0): section 12 covers
  electrical PPE only; no site question checks basic PPE in use, PPE for visitors
  (§3.2(c)), PPE at no cost to employees (§3.1.1(c)), storage (§3.6), the inspection
  regime (§3.5(b)) or training records naming the PPE issued (§2(h)(vi)). Signs (CoP
  17.0): signs unobstructed and maintained (§3.5), containers and pipes labelled (§3.8),
  a competent signaller and one signaller at a time (§3.10(b), §3.10.1(c)).
  Hot work (CoP 28.0 v4.1): combustibles cleared within 10 m (§3.3.5(a)(ii)), a
  continuous fire watch during the work and for at least an hour after (§3.3.5(a)(vii)),
  extinguishers nearby (§3.3.5(a)(viii)), welding machines on RCD-protected, earthed
  circuits (§3.3.4(a)(ii)), oxygen cylinders stored at least 6 m from fuel gas cylinders
  (§3.7.1).
  First aid (CoP 4.0): certificates from the listed providers only (§2.1(b)), CPR and AED
  refresher at least annually (§2.1(d)), first aid kits inspected at least monthly
  (§3.3(e)), emergency numbers posted (§3.2.2(a)(v)), an EMT or paramedic on site where
  ambulance response exceeds 15 minutes for high hazard work (§3.2.2(a)(iii)).
  Traffic (CoP 44.0 v4.1): walkways checked daily at the start of each shift (§3.3.3(b)),
  reversing alarms and amber beacons (§3.3.5(b)(iii)), separate vehicle and pedestrian
  entrances (§3.1.1(b)(iv)), a site Traffic Management Plan (§3.4), pallets stacked at
  most 3 high (§3.5.2(b)(ii)). Services (CoP 39.0 v4.1): NOCs and permit clearances
  (§3.2(b)), warning signs at 250, 100, 50 and 25 m either side of overhead lines
  (§3.4.3(b)(iv)), locators then hand digging before excavation (§3.5.1(a)), no pick-axes
  or forks near services (§3.5.3(c)(iii)). Plant (CoP 36.0 v4.1): a schedule of plant on
  site (§3.15.1(a)), maintenance records kept at least 5 years (§3.15.1(h)).
  Ladders (CoP 37.0 v4.1): industrial rated (§3.3(a)(i)), daily user inspection and a
  weekly documented formal inspection (§3.13(b)), ladders of 3 m or longer secured at base
  or top (§3.8), person plus tools at most 120 kg (§3.6(a)(xiii)).
- **C13. Questions carry no audit criterion.** Elements v4.0 Element 8 §3.1(a)(iii)(1)
  and §3.1(b) require documented audit criteria covering legislation, ADOSH-SF and other
  requirements. The salvaged questions state what to check but not which clause requires
  it. Element 8 §2 also separates an OSH MS audit (per ISO 19011:2018) from an OSH
  inspection (a physical walk-through against requirements): the Management System Audit
  in this tool is the former, the Site Performance Audit the latter, and each has its own
  program requirements (§3.1, §3.2). Proposed: every catalogue question carries its
  criterion (document, version, clause), shown beside the question and in reports; the
  UI and reports use the Element 8 terms. Owner decision on naming.
- **C14. Records must outlive the device.** Elements v4.0 Element 9 §3.5(a)(iii) requires
  OSH records to be kept at least 5 years. The design stores records in browser storage
  and exported files. Proposed: the tool never deletes or expires a record, every export
  states its `formatVersion`, and each future version must import every earlier format
  (a test per format), so a file exported today opens in 5 years. Owner decision on who
  keeps the master copy.

When the owner decides C1 to C14, each accepted decision becomes a numbered safety
requirement in this spec, and every plan names the test that proves each one it touches.

---

## 1. Context and goals

`ProjectOHSMS_SiteAudit` is a Vite/vanilla-JS OHS audit tool: a project-wide Management
System Audit plus site-specific Site Performance Audits, scored 0–5, with dashboards and
printable reports.

It is being rearchitected into a **single-file, fully local, portable** tool for field HSE
auditors. Goals, in priority order:

1. **No platform lock-in.** No Render, Railway, Vercel, or any hosted backend. The
   deliverable is one HTML file that runs from local storage on a tablet or laptop.
2. **Evidence-grade records.** Audits are used in disputes on construction sites. Records
   must be defensible, attributable, and not silently editable after the fact.
3. **Many-to-many projects and sites**, with scope-differentiated concurrent engagements.
4. **Full traceability across all audits**, including how status and applicability changed
   over time.
5. **Offline-first.** No network calls at any point during normal operation.
6. **Dead-simple UX.** Auditors see Export and Import. All log, merge, and hash mechanics
   stay invisible.

### Device constraints

The device fleet cannot be dictated — iPad, Android tablets, Windows and Mac laptops are
all in play. This rules out any approach requiring installation, and rules out the File
System Access API (unsupported on Safari/iOS and Firefox).

---

## 2. Non-goals

- **AI hazard detection.** Explicitly out of scope. Assessors are trained HSE personnel who
  identify hazards themselves. `VisualRiskAssessor` remains a separate standalone tool
  producing an addendum report. This tool needs only manual photo attachment.
- **Multi-user server, authentication, RBAC.** Deleted, not hardened.
- **Live sync.** Reconciliation is by file exchange — a shared cloud folder where one is
  available (§7.2.1), or USB/email/AirDrop hand-off where it is not. The tool itself never
  talks to a network.
- **Cryptographic non-repudiation.** See §7 for the honest limits of what is provided.

---

## 3. Findings from the current codebase

Verified against `main` at commit `d71f683`.

| Finding | Location | Consequence |
|---|---|---|
| Sites nested inside projects, keyed by mutable display names | `dataManagement.js`, `projectManagement.js` | A site cannot belong to two projects. Many-to-many is impossible without a data-model rebuild. |
| Re-auditing overwrites scores in place | `projectManagement.js` (`selectSite`, `addNewProject`) | Zero audit history exists today. |
| Rename = delete-key / insert-key | `projectManagement.js:34-42`, `:62-71` | Any future foreign-key relation breaks silently on rename. |
| Questions identified by their text string | `{name, score, comment}` throughout | Rewording a question orphans all its history. |
| Import fully replaces state | `importAllAuditData()` | No merge path for multiple auditors. |
| Score items have no evidence field | `{name, score, comment}` | Photo attachment is additive. |
| Express/JWT/bcrypt/Render/Railway/Docker layer | `server.js`, `apiClient.js`, deploy configs | Contradicts local-only goal. To be deleted. |
| Unescaped `innerHTML` and `document.write` in report path | `uiManagement.js`, `reportGeneration.js` | XSS risk; matters because merged files are semi-trusted input and reports get shared. |

---

## 4. Architecture

An **event-sourced log** is the single source of truth. All current state — site lists,
phase statuses, applicable questions, scores, dashboards — is *derived* by replaying the
log into in-memory projections. Nothing is stored as separately-mutated state.

```
          ┌──────────────────────────────────┐
          │   Event log (append-only)         │  ← authoritative
          │   hash-chained per device         │
          └───────────────┬──────────────────┘
                          │ replay once on load,
                          │ update incrementally
                          ▼
          ┌──────────────────────────────────┐
          │   Projections (in memory)         │
          │   sites · projects · assignments  │
          │   phase trees · active question   │
          │   sets · visit history · scores   │
          └───────────────┬──────────────────┘
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
        Dashboards / UI            Reports
```

**Photos are not in the replay path.** At runtime they live in a separate IndexedDB object
store keyed by `photoId`; events reference the ID plus a content hash. Replaying hundreds
of visits never touches image bytes. On export they are inlined so the file stays
self-contained.

### Why event sourcing rather than a join-table refactor

It is doing three jobs at once, each of which was independently required:

1. **Evidence.** Immutability and attribution fall out of the model rather than being
   bolted on.
2. **Merge.** Union of events by ID is correct, order-independent and idempotent. A mutable
   entity model would need per-field conflict resolution across auditors' devices.
3. **Traceability of change.** Status trajectories and applicability changes are recorded
   for free, which is exactly what §1.4 requires and what a snapshot model loses.

---

## 5. Data model

### 5.1 Entities

**Site** — a physical location in a global registry. Exists independently of any project.
Fields: `siteId`, `name`, `location`, `notes`.

**Project** — a scope-of-work engagement. Fields: `projectId`, `name`, `client`,
`leadAuditor`, `projectDirector`, `subPhasesEnabled` (chosen at project setup; when false
the phase tree is capped at one level below the assignment).

**Assignment** — the project × site join, carrying its own attributes. This is the fat join
that makes concurrent scope-differentiated work representable: Site X can run
"Earthmoving & Foundation" under Project A while simultaneously running "Cable Laying &
Instrumentation" under Project B, each with independent phases, statuses and audit history.
Fields: `assignmentId`, `projectId`, `siteId`, `scopeName`, `startDate`, `endDate`.

**Phase** — a node in the assignment's phase tree, to a maximum depth of three levels
(assignment → phase → sub-phase). Fields: `phaseId`, `assignmentId`, `parentPhaseId`,
`name`, `statusId`.

**AuditVisit** — one auditor's completed, finalized visit. Immutable once recorded.

All entities carry stable generated IDs. Names are display attributes and may change freely
without breaking any relation.

### 5.2 Status vocabulary

Statuses are an editable, ordered list, not a hardcoded enum, so labels can match each
client's terminology:

```js
[ { statusId, label, order, isTerminal } ]
```

Default: Not Started (0) → Active (1) → Complete (2, terminal) → Handed Over (3, terminal).

All rollup logic keys off `order` and `isTerminal`. It never references label text.

### 5.3 Status rollup

A parent phase's status is **computed, never set directly**. This implements the
requirement that a handed-over part can sit inside a still-in-progress larger stage.

- **Leaf phase:** its own explicitly-set status.
- **Parent with children:** the **lowest-ordered status among its children**, computed
  bottom-up so nested sub-phases resolve first.
- An assignment's overall status is the rollup of its top-level phases. An assignment with
  no phases carries an explicitly-set status.

This single rule is vocabulary-agnostic — it never references a status by label — and
produces every required behavior:

| Children | Parent | Why it is right |
|---|---|---|
| all Handed Over (3) | Handed Over (3) | nothing outstanding |
| Complete (2) + Handed Over (3) | Complete (2) | not fully handed over yet |
| **Active (1) + Handed Over (3)** | **Active (1)** | **a handed-over part inside a still-in-progress larger stage** |
| all Not Started (0) | Not Started (0) | nothing begun |

Setting a status directly on a parent that has children is rejected by the UI.

### 5.4 Score calculation and banding

- Score 0 ("Not Applicable / Not Observed") is excluded from all averages.
- `averageScore = totalScore / ratedItemsCount`; `percentage = (averageScore / 5) * 100`.
- Ratings: `> 90` Excellent, `> 80` Good, `> 70` Satisfactory, `> 50` Low, `≤ 50`
  Unacceptable.

**These bands are not to be altered.** They were set on expert advice and carry HSE
consequences — a band understates or overstates risk to human life and limb, so the
boundaries are a professional judgement, not an implementation detail. The strict `>`
comparison is part of that judgement and is retained exactly: exactly 90.0% rates Good, not
Excellent. No band boundary may be "corrected", rounded, or made inclusive during
implementation.

**Consultants may define their own banding**, and doing so is their professional
responsibility, not a defect in the defaults. Banding is therefore a configurable workspace
setting shipped with the above as its default — but it is deliberately placed behind a
warning in Settings rather than presented as a routine preference.

### 5.4.1 Banding changes must not rewrite history

Because banding is configurable, it carries a trap worth closing explicitly: if a consultant
changes the bands, every previously finalized audit would silently re-render under the new
thresholds, retroactively changing what a past audit "said". For a record intended to
withstand dispute, that is unacceptable.

Therefore banding is **versioned and event-sourced**, exactly like the question catalogue:

- Changing it emits a `banding_updated` event creating a new banding version.
- Every `audit_visit` records the `bandingVersionId` in force when it was finalized.
- Reports render each visit under **the banding that applied at the time it was signed**,
  never under current settings.
- Where a report spans visits under different banding versions, it says so.

The percentage and raw scores are invariant; only the band label depends on the version.

---

## 6. Event types

Every event shares an envelope:

```js
{ eventId, type, ts, deviceId, actor, prevHash, hash, payload }
```

`prevHash` chains to the previous event **from the same `deviceId`**, so independently
working tablets each maintain their own verifiable chain and merging never invalidates one.

| Event | Payload |
|---|---|
| `site_created` | `siteId, name, location` |
| `site_updated` | `siteId, changedFields` |
| `project_created` | `projectId, name, client, leadAuditor, projectDirector, subPhasesEnabled` |
| `project_updated` | `projectId, changedFields` |
| `assignment_created` | `assignmentId, projectId, siteId, scopeName, startDate` |
| `assignment_updated` | `assignmentId, changedFields` |
| `phase_added` | `phaseId, assignmentId, parentPhaseId, name` |
| `phase_updated` | `phaseId, name` |
| `phase_status_changed` | `phaseId, statusId, note` |
| `phase_removed` | `phaseId, reason` |
| `question_activated` | `assignmentId, target {type: section\|question, id}, phaseId` |
| `question_closed` | `assignmentId, target, reason` |
| `question_reopened` | `assignmentId, target, reason` |
| `adhoc_question_created` | `questionId, assignmentId, sectionId, text` |
| `adhoc_question_promoted` | `questionId, catalogueVersionId` |
| `catalogue_updated` | `catalogueVersionId, changes` |
| `status_vocabulary_updated` | `statuses[]` |
| `banding_updated` | `bandingVersionId, bands[]` (see §5.4.1) |
| `audit_visit` | see §6.1 |
| `audit_correction` | `correctionId, correctsVisitId, reason, items[]` |

### 6.1 `audit_visit`

```js
{
  visitId, assignmentId,
  auditType: "management" | "site",
  date, auditorName,
  phasesCovered: [phaseId],
  catalogueVersionId,
  bandingVersionId,        // §5.4.1 — bands are rendered as they stood at signing
  items: [
    { questionId, sectionId,
      textAsShown,           // fidelity: what the auditor actually read
      score, comment,
      photos: [ { photoId, contentHash, caption } ] }
  ],
  signature: { photoId, contentHash, signedName, signedAt } | null
}
```

`textAsShown` is stored alongside `questionId` deliberately. The ID links a question across
time for trend analysis; the stored text proves what was actually put to the auditee even
if the catalogue is reworded years later.

### 6.1.1 Signature binding

The auditor's signature is captured **inside the app at Finalize** — drawn with finger or
stylus on the tablet, or an uploaded scan — stored like any other image, and included in the
event's hashed payload via its `contentHash`.

This matters because a signature pasted onto a finished PDF proves nothing about the scores
beneath it; the same image can be lifted onto any document. Binding it into the hashed event
ties the signature to *those specific findings at that moment*. If a score is altered
afterwards, the chain breaks and the signature demonstrably no longer covers what is being
displayed.

Combined with `auditorName` and `date`, the record supports a clear claim: this named
auditor signed off on exactly these findings, and nothing has been altered since.

A signature is not required to finalize — some visits are recorded before sign-off is
obtained — so the field is nullable, and reports state plainly when a visit is unsigned
rather than leaving the absence unexplained.

### 6.2 Drafts versus events

Work in progress is a **draft**, held in IndexedDB and autosaved on every change. A draft is
mutable, is not part of the event log, and is not authoritative. Pressing **Finalize**
emits one immutable `audit_visit` event.

There is at most one draft per `(assignmentId, auditType)`.

Corrections to a finalized visit never edit it. They emit an `audit_correction` event
referencing the original, and both appear in the record. Reports show the corrected values
with the original visible on drill-down.

### 6.3 Management System Audit scope

The Management System Audit is recorded per assignment, not per project. A project whose
sites carry very different scopes can therefore hold different management-system answers
per site. Where answers are genuinely uniform, the UI offers "copy from another assignment
in this project" as a convenience — which emits a normal `audit_visit`, so the copy is
recorded as its own attributable event rather than a shared reference.

---

## 7. File format, merge, and tamper-evidence

### 7.1 File format

One pretty-printed JSON file. Human-skimmable at the top, authoritative log below.

```js
{
  "formatVersion": "2.0.0",
  "generatedAt": "2026-08-27T14:00:00Z",
  "generator": "OHS Audit Tool 3.0.0",
  "index": { "projects": [...], "sites": [...], "assignments": [...] },
  "statusVocabulary": [...],
  "catalogue": { "versions": [...] },
  "events": [ ... ],
  "photos": { "<photoId>": "data:image/jpeg;base64,..." },
  "chainHeads": { "<deviceId>": "<hash>" }
}
```

`index` is a **derived convenience cache**, regenerated on every export and never read as
authoritative. If it disagrees with the event log, the log wins and the index is rebuilt.

`photos` is a top-level map rather than inline blobs inside each event. This deduplicates
images referenced more than once, keeps the events section readable, and mirrors the
runtime IndexedDB layout. The file remains fully self-contained — export leaves nothing
behind.

Photos are downscaled client-side before storage: longest edge 1600px, JPEG quality 0.7.

`formatVersion` follows semver and gates future migrations.

### 7.2 Merge

Merge is a union of events by `eventId`:

- Importing the same file twice changes nothing (idempotent).
- Import order does not affect the result (commutative).
- Photos merge by `photoId`, with `contentHash` verified on arrival.
- Two events sharing an `eventId` but differing in content is an integrity failure. The
  import is rejected and reported; it is never silently resolved.
- After merge, every device chain is re-verified.

Because auditors work on different assignments, merge is overwhelmingly union rather than
conflict resolution. The conflict path exists to detect corruption and tampering, not as a
routine workflow.

### 7.2.1 Reconciliation via a shared folder

The default reconciliation workflow is a **shared cloud folder** — OneDrive, Dropbox, Google
Drive, iCloud, whichever the consultancy already uses — rather than emailing files around.

Each device writes only its **own** file, named `events-<deviceId>.json`. The folder
accumulates one file per auditor. Any device reads all files present and unions their events
into a complete picture.

The property that makes this work without any server is that **no two devices ever write the
same file**, so there are no write conflicts to resolve — the sync provider is only moving
whole files, never merging their contents. The event-union model in §7.2 does the rest.

Work continues fully offline against IndexedDB regardless of connectivity; the export simply
lands in the folder the next time the device is online. On desktop browsers exposing the File
System Access API this can be automated as a progressive enhancement; on iPad the auditor
uses the same Export button and picks the synced folder in the Files app.

This deliberately introduces **no dependency on any particular provider**. The artefacts are
ordinary JSON files, so switching providers, or dropping back to USB hand-off entirely, works
without any change to the tool.

Note also what this does *not* provide: a folder under the consultancy's own control is not a
trusted third party, and gains no evidentiary weight over a USB stick. It is a workflow
convenience only. See §7.3.

### 7.3 Tamper-evidence, and its limits

**Threat model (decided 2026-08-27).** The record must be defensible against **outsiders** —
a contractor or third party disputing what an audit found. The consultancy and its own
auditors are trusted. Defending against an insider altering findings after the fact is
explicitly **not** a requirement, because it cannot be met without a trusted third party,
and every option for that either reintroduces the client-server architecture the project
exists to avoid or imposes key management on non-technical users in the field.

This decision is what makes the limits below acceptable. It should be revisited if the tool
is ever used where the consultancy's own impartiality is the thing in question.

Each event carries `hash = SHA-256(canonicalJSON(envelope-without-hash))`, where photo bytes
are represented by their `contentHash` rather than included directly — so verifying a chain
never requires rehydrating images.

This detects: post-hoc edits to recorded audits, deletion of events from the middle of a
chain, reordering, and swapped photos.

**It is explicitly not cryptographic non-repudiation.** There are no per-auditor private
keys, so anyone with the file and the tool could in principle rebuild a whole chain from
scratch. It raises tampering from "trivial and invisible" to "requires deliberate effort and
tooling", which is proportionate for internal dispute defence. If formally evidentiary use
is ever required, per-auditor signing keys are the upgrade path, and the envelope has room
for a `signature` field.

This limitation must be stated plainly in user-facing documentation. It must not be
described to clients as "tamper-proof".

### 7.4 Hashing implementation

`crypto.subtle.digest` is used where available. Availability of Web Crypto on `file://`
origins varies by browser and **must be verified on all four target platforms during
implementation**. A ~100-line pure-JS SHA-256 fallback ships alongside it so the design has
no single point of failure on an unverified platform assumption.

---

## 8. Question lifecycle

The applicable question set is not static — it tracks physical reality on site. Once a
permanent roof is cast and the temporary structure struck, temporary-works questions become
irrelevant and close; other questions arise.

**Closure is forward-only.** This is the rule that protects the evidence chain. If a
question scored 2 in March and closes in June, the March record keeps that 2 permanently.
Closure affects only which questions appear on *subsequent* visits. Past `audit_visit`
events are immutable and already carry their own snapshot of what was asked.

**Questions go live** either automatically when a phase activates (bringing that phase's
default set, via `appliesToPhases` on the catalogue section) or by explicit auditor action.

**Closure requires a reason.** "Why did you stop auditing temporary structures?" is exactly
what gets challenged in a dispute, so `question_closed` records who, when, and why —
*"permanent roof cast and load-bearing, temporary structure struck 12 June"*. This converts
a gap in the record into a defensible justification.

**Closure is not terminal.** Temporary works can return for a later phase; `question_reopened`
exists for that.

**Closure can target a section or a single question.** The event stores the intent — "Temporary
Works Safety section closed" — rather than dissolving into unrelated per-question closures,
which reads far better in a report.

**Ad-hoc questions.** An auditor facing an unlisted hazard can add a question on the spot. It
is marked `adHoc: true` and scoped to that assignment only, so cross-site comparability is
visibly protected. The lead consultant can later promote a good one into the master
catalogue via `adhoc_question_promoted`, after which it behaves as a standard question.

### 8.1 Consequence for trend analysis

Once the question set changes over time, overall-score trends stop being comparable — 45
questions in March against 38 in June, with a different mix. A naive chart reports
improvement that is really composition change.

Therefore:

- Trend views compare **like-for-like on the intersection** of questions live in both periods.
- Points where the question set changed are **visibly marked** on the chart.
- Headline percentages carry a footnote whenever composition shifted between compared periods.

Producing quietly misleading evidence is the worst available failure mode for this tool, so
this behavior is a requirement, not a refinement.

---

## 9. UI flow

**Selection.** Pick a project, then a site within it — the site list filters to sites
actually assigned to that project, and the header displays the assignment's `scopeName`, so
"Site X / Cable Laying" is unambiguous when the same site also runs civils under another
project.

**Tabs.** Dashboard · Audit · Phases · History · Reports · Settings.

- **Audit** merges the former Management System and Site Performance tabs into one screen
  with a toggle, since both now hang off the assignment. Only questions live for currently
  active phases are shown.
- **Phases** presents the phase tree with status controls and rollup display.
- **History** lists finalized visits for the assignment, with corrections shown against
  their originals.
- **Settings** holds the site registry, projects, catalogue management, status vocabulary,
  and the Export / Import buttons.

**Field ergonomics.** The 0–5 score `<select>` is replaced with a six-button segmented
control — dropdowns are poor on a tablet and worse with gloves. Each question carries a
camera button capturing straight to the item. Every change autosaves to IndexedDB; there is
no save button to forget under field pressure.

**Finalize.** Finalizing presents a summary, an optional signature pad (finger, stylus, or
uploaded scan, per §6.1.1), and a clear warning that the visit becomes part of the permanent
record and can afterwards only be amended by a visible correction — never a silent edit.

**Auditor-facing surface** is Export and Import only. Log, merge, and hash mechanics are
never surfaced.

---

## 10. Reports

All reports are computed by replaying and filtering the event log. None are stored.

**Scopes:**

- Single assignment (one site under one project).
- Project-wide (all assignments under a project).
- **Site-wide across all projects** — every engagement at one physical site regardless of
  project. This is new, impossible in the current model, and is the clearest safety picture
  of a shared site.
- Assignment comparison.
- Progress over time for one assignment.

**Content:** inline photos, the phase status tree, and the closed-question log with reasons,
so the record explains its own gaps rather than appearing to have holes. Trend sections
carry the §8.1 composition markers.

**Signatures** are rendered against the visits they belong to, with the auditor's name and
date. Where a visit was finalized without one, the report says so explicitly — an unexplained
blank signature block invites exactly the challenge the record exists to withstand.

**Output:** HTML export and print-to-PDF, as today. `document.write` is replaced with
escaped DOM construction, closing the injection hole flagged in the superseded security plan.

**Verification block:** each report embeds event count, chain head hashes, and generation
timestamp, so a printed report can be checked back against the file it came from.

### 10.1 Disclaimer

Every generated report carries a disclaimer, and it is not suppressible. It also appears in
the application's About screen.

Final wording is the user's to set, and **must be reconciled with the disclaimer used by
`VisualRiskAssessor`** so the two tools do not make inconsistent claims when their outputs
are presented together (this tool's report plus the AI hazard-detection addendum). That
wording was not available to this session; the following is a draft to be replaced, not
approved text:

> This report records observations made by the named auditor at the stated site on the
> stated date. It supports, and does not replace, the judgement of a competent person.
>
> Scores reflect only what was observed at the time of the audit. The absence of a finding
> is not evidence of the absence of a hazard. Items scored 0 were not applicable or not
> observed, and are excluded from all averages.
>
> This report is not a certification, and is not a determination of statutory or regulatory
> compliance.
>
> Performance bands are a professional judgement. Where an organisation has configured its
> own banding, responsibility for the appropriateness of those thresholds rests with that
> organisation.
>
> Records in this tool are tamper-evident, not tamper-proof: alteration after signing is
> detectable, but the tool does not provide cryptographic proof of authorship.

The last two paragraphs are load-bearing rather than boilerplate — the first because §5.4
permits consultants to override expert-set HSE thresholds, the second because §7.3 sets a
deliberate limit that must never be overstated to a client.

---

## 11. Migration

### 11.1 Data

**There is no field data to migrate.** The tool has not been used on a live engagement, so
no audit records exist that need preserving (confirmed with the user, 2026-08-27).

This removes audit-data migration from scope entirely, and with it the `migrated` and
`dateApproximate` flags. No record will ever need to be marked second-class in reports, and
the evidence chain starts clean from first real field use.

What *is* worth carrying forward is the **question catalogue**:

- The built-in default template (currently hardcoded in `loadDefaultTemplate()`) becomes
  catalogue version 1, with stable question IDs generated once at build time so that they
  are identical across every install. This matters: if IDs were generated per-install,
  two auditors' files could not be compared question-for-question after merging.
- Custom template files previously exported from the old tool — `exportConfiguration()`
  emits `{ management: {...}, site: {...} }` — can be imported as a new catalogue version.
  A small self-contained importer: section and question text in, stable IDs generated on
  arrival, re-import of the same file idempotent.

Legacy `ohsAuditToolData` in localStorage is ignored and left untouched. It is not read, not
migrated, and not cleared.

**This does not affect consolidating auditors' data.** Consolidation is the event-union
merge in §7.2, operating on files produced by the new tool. It has no relationship to
legacy migration.

### 11.2 Code

**Delete:** `server.js`, `public/js/apiClient.js`, the auth modal in `index.html`,
`Dockerfile`, `docker-compose.yml`, `render.yaml`, `railway.json`, all `DEPLOYMENT_*.md`,
`RENDER_DEPLOYMENT.md`, `QUICK_DEPLOY_RENDER.md`, `START_HERE.md`, `ENVIRONMENT_VARIABLES.md`,
`MVP_GAP_SECURITY_PLAN.md`, `.env.example`, `tests/api.test.js`, the `.playwright-cli/`
dumps, and Vite starter leftovers (`counter.js`, `javascript.svg`, `vite-starter-main.js`,
`test_report_functions.html`, duplicate `style.css` / `styles.css`).

**Drop dependencies:** express, jsonwebtoken, bcryptjs, cors, helmet, express-rate-limit,
bytes, supertest.

**Keep:** vite, chart.js. **Add:** vite-plugin-singlefile.

**Rewrite:** `dataManagement.js` → `eventStore.js` + `projections.js` + `merge.js` +
`hashChain.js`. `projectManagement.js` → `entities.js` + `assignments.js` + `phases.js`.

**Port onto projections:** `uiManagement.js`, `chartManagement.js`, `reportGeneration.js`,
`recommendations.js`, `comparison-chart-extension.js`, `questionEvaluation.js` — these are
adapted to read projections rather than `project.sites[siteName]`, not rewritten.

**Fix throughout:** escape all interpolated values; no unescaped `innerHTML` with
user-controlled content.

Work proceeds on a branch. `main` is left untouched until parity is demonstrated.

### 11.3 Build

`vite-plugin-singlefile` produces one self-contained HTML file (~1–2 MB with Chart.js
inlined).

The build **must emit a classic script, not an ES module** (`rollupOptions.output.format:
'iife'` with `inlineDynamicImports`). ES module scripts and dynamic imports are unreliable
from `file://` origins. Opening the built file directly from the filesystem on all four
target platforms is an explicit acceptance test, not an assumption.

---

## 12. Testing

The valuable logic is pure functions, testable without a browser using `node --test`
(already present; no new dependency).

**Unit:**

- Replay determinism — same events in any order produce identical projections.
- Merge idempotence — importing the same file twice changes nothing.
- Merge union — two auditors' files combine correctly.
- Merge conflict — same `eventId` with different content is rejected, not resolved.
- Hash chain — detects edits, deletions, and reordering.
- Status rollup — terminal child with an active sibling keeps the parent active; all-terminal
  children yield the lowest-ordered terminal status.
- Forward-only closure — closing a question leaves past visits unaltered.
- Trend like-for-like — composition change is detected and marked.
- Score calculation — score 0 excluded; band boundaries behave **exactly** as specified in
  §5.4, including that 90.0% rates Good. This test exists specifically to catch a
  well-meaning "fix" to the comparison operators.
- Banding versioning — a visit finalized under banding v1 still renders its v1 band after
  banding v2 is created (§5.4.1).
- Signature binding — altering any score in a signed visit invalidates the chain, so the
  signature can never appear to cover findings it did not.
- Catalogue import — a legacy `exportConfiguration()` fixture yields the expected sections
  and questions with stable IDs; re-importing the same file does not duplicate them.

**Manual checklist** (not worth automating at this size): photo capture on each target
device, export/import round-trip between two devices, print output fidelity, and opening the
built file from `file://` on iPad Safari, Android Chrome, Windows, and Mac.

---

## 13. Deferred — explicitly out of scope for v1

These are decisions to exclude, not open questions:

- Per-auditor cryptographic signing keys (§7.3 upgrade path).
- Third-party timestamping of chain heads (RFC 3161). This is the cheapest route to genuine
  independent proof if the §7.3 threat model ever widens to insiders — one HTTP call when
  online, no server of your own, no lock-in — but it is unnecessary under the current
  threat model and adds a network dependency to a deliberately offline tool.
- Legacy audit-data migration — there is nothing to migrate (§11.1).
- Live sync or any networked reconciliation beyond the shared-folder workflow in §7.2.1.
- Playwright end-to-end suite — the manual checklist covers v1.
- Promotion of the tool to multi-tenant or hosted use.
- Integration with `VisualRiskAssessor`, which stays a separate addendum tool.

---

## 14. Approval and sequencing

Design agreed in brainstorming across two conversation branches, 2026-08-27. Implementation
planning follows via the writing-plans skill once this document is reviewed.

This design is too large for a single implementation pass. The plan should sequence it as:

1. **Core** — event store, hash chain, projections, merge. Pure logic, fully unit-tested,
   no UI. Nothing else is trustworthy until this is.
2. **Catalogue** — default catalogue v1 with build-time stable IDs, plus the legacy config
   importer (§11.1). Small, and everything downstream depends on question identity.
3. **Audit capture** — assignment/phase management, the audit screen, photos, finalize.
4. **Reports and dashboards** — ported onto projections.
5. **Single-file build and cross-device acceptance** — including the `file://` test on all
   four target platforms (§11.3), which is a gate, not a formality.

Each stage should be usable and testable before the next begins.
