# R1a: score definitions (DRAFT for owner review)

Status: **draft, not accepted.** Written 2026-09-25 to answer request R1a in
`docs/references.md` and spec concerns C7 and C8. Nothing here changes the scale values,
the §5.4 formula or the bands. The owner edits, then accepts or rejects each definition;
accepted text goes into `spec.md` and becomes the criteria auditors see in the tool.

Source labels: **[S]** taken from a standard or code already read (clause given);
**[P]** proposed by the drafter, no source; the owner decides.

## 1. Rules for every score, both audit types

1. A score is given against the question's criterion and the evidence seen at the time of
   the visit, not against what someone says was done. [S: ISO 19011 §3.9, §3.10;
   ISO/IEC 17021-1 §9.4.5.3]
2. A requirement that is not met is scored 1 or 2. It is never scored 3, 4 or 5.
   [S: ISO/IEC 17021-1 §9.4.5.2, a nonconformity "shall not be recorded as" an
   opportunity for improvement]
3. Scores 1 and 2 need a comment stating the requirement, what was seen and where, and
   at least one piece of evidence (photo, document reference or witness).
   [S: ISO/IEC 17021-1 §9.4.5.3; P: the photo/witness rule]
4. Score 5 needs a comment stating what exceeds the requirement. [P]
5. Score 0 needs a reason (see section 4). [P]
6. Where the auditor cannot decide between two scores, the lower score is recorded and
   the doubt is written in the comment. [P; the owner may prefer a different rule]
7. Grading criteria are stated to the auditee at the opening meeting.
   [S: ISO 19011 §6.4.3, §6.4.8]

## 2. Site Performance Audit (physical site inspection)

| Score | Name | Definition | Examples |
|---|---|---|---|
| 1 | Major Non-Conformance | Any one of: (a) a condition that could cause death or serious injury before it is corrected; (b) a condition a code names as a stop condition; (c) a required control is absent altogether; (d) the same requirement fails at several locations or on several visits, showing the control does not work. [P for (a) to (c); (d) adapted from S: ISO/IEC 17021-1 §3.12 Note 1] | Metal ladder within 6 m of HV equipment (CoP 37.0 §3.10); hot work without a permit (CoP 21.0, CoP 28.0); no edge protection at an open edge (CoP 23.0); unsupported excavation wall where CoP 29.0 requires support; High Risk Zone heat controls absent (TG Safety in the Heat Table 1). |
| 2 | Minor Non-Conformance | A requirement is not met, but the control exists and is partly deficient, the failure is isolated, and no one is exposed to death or serious injury before correction. [P, modelled on S: ISO/IEC 17021-1 §3.13] | One extinguisher missing its monthly check (Fire Code Ch. 4 Table 4.4); a safety sign in English only (CoP 17.0 §3.4(f)); one scaffold tag a day past its 7-day inspection with the scaffold otherwise sound (CoP 26.0 §3.14). |
| 3 | Observation / Improvement Opportunity | The requirement is met, but the auditor sees a weakness likely to lead to a non-conformance if left, or a practical improvement. [S: ISO 19011 §3.10 Note 2; limit from §1 rule 2] | Barricade meets CoP 22.0 but sits where plant will soon need the space. |
| 4 | Conformance | The requirement is met in full, with objective evidence seen at the visit. [S: ISO 19011 §3.20] | Permit displayed at the worksite with all signatures (CoP 21.0 §3.10(b), (c)). |
| 5 | Best Practice | The requirement is met and exceeded in a way that lowers risk further, and it is seen across the site, not in one place. [P, name from S: ISO 19011 §6.4.8 "good practices"] | Hard barricading used where the risk assessment allows soft (CoP 22.0 §3.4). |

Stop conditions: where a code requires work to stop, a score of 1 is not enough on its
own; the separate "imminent danger" flag proposed in spec C7 is raised and work is
stopped under the code. [P, from spec C7]

## 3. Management System Audit

| Score | Name | Definition |
|---|---|---|
| 1 | Major Non-Conformance | A nonconformity that affects the capability of the OSH management system to achieve its intended results: a required element is absent or not implemented, or there is significant doubt that a process is controlled, or several minor nonconformities on the same requirement show a systemic failure. [S: ISO/IEC 17021-1 §3.12 and Note 1] Correction and corrective action need a time limit. [S: §9.6.3.2.2] |
| 2 | Minor Non-Conformance | A nonconformity that does not affect that capability. [S: ISO/IEC 17021-1 §3.13] |
| 3 | Observation / Improvement Opportunity | Conforming, with an opportunity for improvement. [S: ISO 19011 §3.10 Note 2; ISO/IEC 17021-1 §9.4.5.2] |
| 4 | Conformance | Fulfilment of the requirement, with objective evidence. [S: ISO 19011 §3.20] |
| 5 | Best Practice | Conforming, and a good practice worth sharing. [S: ISO 19011 §6.4.8; P for the threshold] |

## 4. Score 0 (both audit types): two options

The standards define neither Not Applicable nor Not Observed. [S: see the table under
"Owner's answer on R1" in `docs/references.md`] Today both are score 0 and both are
excluded from the average (spec §5.4, CLAUDE.md). The danger (spec C8): a site with most
items "not observed" can still report Excellent.

- **Option A, keep one score 0, add a required reason.** Reason is one of: "Not
  applicable: the activity or hazard does not exist on this site at this phase" or "Not
  observed: the activity exists but was not seen (not in progress, no access, time)".
  The report lists every Not Observed item and shows coverage (items scored 1 to 5 out
  of items applicable). [P]
- **Option B, split into two codes.** Both stay excluded from the average (the CLAUDE.md
  rule is unchanged), but Not Observed items are counted and listed separately, and a
  band is not shown when coverage is below a threshold the owner sets. [P; this changes
  the scale, so it needs an explicit owner decision]

## 5. Questions for the owner

1. Accept, edit or reject each definition in sections 2 and 3.
2. Rule 6 (lower score when in doubt): keep, or replace?
3. Score 0: Option A or Option B? If B, what coverage threshold hides the band?
4. Should a single score 1 on a stop-condition question cap the report band, or only be
   listed first with the count of open Major NCs (spec C7)? The bands themselves are not
   to be changed (CLAUDE.md).
5. Does the same definition set apply to every project type, or does each catalogue
   carry its own examples (spec C12)?
