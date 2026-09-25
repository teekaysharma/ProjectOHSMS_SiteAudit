# Source text extracts

Plain-text extracts of the public documents the catalogue criteria are checked against,
so a future session can re-read a clause without re-downloading. `docs/references.md`
records what each document requires of the tool; these files hold the text itself.

Rules for this folder:
- Verbatim machine extracts. Never edit them; if a better copy is found, replace the
  whole file and say so in the commit.
- Public government documents only. No ISO or ISO/IEC text (licensed to the owner), no
  ICC-based building code text (ADIBC), no news articles. Those are cited by clause in
  `docs/references.md` only.
- Extraction: pypdf text layer, except CoP 26.0 v4.1, which came through a web connector
  as markdown. Tables and figures may be out of order or missing; images are absent.
  Check the original PDF before quoting a table value.
- Retrieved 2026-09-24. Current versions are those on the ADPHC list that day.

| File | Document | Version | Original |
|---|---|---|---|
| `adphc/Elements-v4.0.txt` | ADOSH-SF Management System Elements 1 to 9 | v4.0, 15 July 2024 | owner upload |
| `adphc/CoP-01.0-Hazardous-Materials-v4.0.txt` | CoP 1.0 Hazardous Materials | v4.0 | owner upload |
| `adphc/CoP-01.1-Asbestos-v4.1.txt` | CoP 1.1 Management of Asbestos Containing Materials | v4.1 | owner upload |
| `adphc/CoP-02.0-PPE-v4.0.txt` | CoP 2.0 Personal Protective Equipment | v4.0 | owner upload |
| `adphc/CoP-04.0-First-Aid-v4.0.txt` | CoP 4.0 First Aid and Medical Emergency Treatment | v4.0 | owner upload |
| `adphc/CoP-11.0-Safety-in-the-Heat-v4.0.txt` | CoP 11.0 Safety in the Heat (file name says v3.1) | v4.0 | owner upload |
| `adphc/CoP-15.0-Electrical-Safety-v4.0.txt` | CoP 15.0 Electrical Safety | v4.0 | owner upload |
| `adphc/CoP-17.0-Safety-Signage-v4.0.txt` | CoP 17.0 Safety Signage and Signals (Appendices 1 and 2 are images) | v4.0 | owner upload |
| `adphc/CoP-21.0-Permit-to-Work-v4.0.txt` | CoP 21.0 Permit to Work Systems | v4.0 | owner upload |
| `adphc/CoP-22.0-Barricading-v4.0.txt` | CoP 22.0 Barricading of Hazards | v4.0 | owner upload |
| `adphc/CoP-23.0-Working-at-Height-v4.1.txt` | CoP 23.0 Working at Height | v4.1, 16 February 2026 | owner upload |
| `adphc/CoP-24.0-LOTO-v4.1.txt` | CoP 24.0 Lock-out / Tag-out (Isolation) | v4.1 | owner upload |
| `adphc/CoP-26.0-Scaffolding-v4.1.txt` | CoP 26.0 Scaffolding | v4.1 | adphc.gov.ae via web connector |
| `adphc/CoP-27.0-Confined-Spaces-v4.0.txt` | CoP 27.0 Confined Spaces | v4.0 | owner upload |
| `adphc/CoP-28.0-Hot-Work-v4.1.txt` | CoP 28.0 Hot Work Operations | v4.1 | owner upload |
| `adphc/CoP-29.0-Excavation-v4.1.txt` | CoP 29.0 Excavation Work (running headers read "CoP 14.0") | v4.1 | owner upload |
| `adphc/CoP-33.0-Road-Works-v4.1.txt` | CoP 33.0 Working On or Adjacent to a Road | v4.1 | owner upload |
| `adphc/CoP-33.1-Traffic-Incident-Site-v4.0.txt` | CoP 33.1 Traffic Incident Site Management (not used by the catalogue) | v4.0 | owner upload |
| `adphc/CoP-34.0-Lifting-v4.1.txt` | CoP 34.0 Safe Use of Lifting Equipment and Lifting Accessories | v4.1 | owner upload |
| `adphc/CoP-36.0-Plant-and-Equipment-v4.1.txt` | CoP 36.0 Plant and Equipment | v4.1 | owner upload |
| `adphc/CoP-37.0-Ladders-v4.1.txt` | CoP 37.0 Ladders | v4.1 | owner upload |
| `adphc/CoP-39.0-Overhead-Underground-Services-v4.1.txt` | CoP 39.0 Overhead and Underground Services | v4.1 | owner upload |
| `adphc/CoP-44.0-Traffic-Management-v4.1.txt` | CoP 44.0 Traffic Management and Logistics | v4.1 | owner upload |
| `adphc/CoP-53.0-OSH-Management-Construction-v4.0.txt` | CoP 53.0 OSH Management during Construction Work | v4.0 | owner upload |
| `adphc/CoP-53.1-OSH-CMP-v4.1.txt` | CoP 53.1 OSH Construction Management Plan | v4.1 | owner upload |
| `adphc/CoP-54.0-Waste-v4.0.txt` | CoP 54.0 Waste Management | v4.0 | owner upload |
| `adphc/TG-Safety-in-the-Heat-v4.0.txt` | ADOSH-SF Technical Guideline, Safety in the Heat (Table 1 TWL zones and Appendices are images; Table 1 is transcribed in `docs/references.md` R23) | v4.0, 15 July 2024 | owner upload |
| `adphc/TG-Dealing-with-Adverse-Weather-v4.0.txt` | ADOSH-SF Technical Guideline, Dealing with Adverse Weather Conditions | v4.0, 15 July 2024 | owner upload |
| `adphc/TG-Occupational-Air-Quality-v4.0.txt` | ADOSH-SF Technical Guideline, Occupational Air Quality Management | v4.0, 15 July 2024 | owner upload |
| `uae-federal/Cabinet-Resolution-3-2016-PPE-en.txt` | Cabinet Resolution No. (3) of 2016, UAE Scheme for the Control of PPE (English translation; the signed Arabic original is a scan with no text layer) | 14 January 2016 | owner upload |

Download pages: ADPHC codes at https://www.adphc.gov.ae/en/Legislation/Code-of-Practices;
MoIAT legislation at https://moiat.gov.ae/en/about-us/laws-and-legislation/.

Not here, and why: CoP 28.0 was earlier read from the owner's summary (superseded by the
PDF text above); superseded v4.0 texts of the v4.1 codes (the differences are recorded in
`docs/references.md`); MoIAT Resolution 83/2020 and Decisions 63/2024 and 1/2025 (scans or
unreadable Arabic text layers, read as images); ADIBC 2013 (ICC-based, cited only); ISO
19011, ISO/IEC 17021-1, ISO/IEC TS 17021-10, ISO 45001 (licensed); the UAE Fire and Life
Safety Code of Practice 2018 (its page 7 reserves all reproduction rights to the General
Headquarters of Civil Defence, so it is cited by clause only; an extract of its Chapters 4
and 5 was added here on 2026-09-24 and removed on 2026-09-25 on that ground).
