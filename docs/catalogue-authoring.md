# Catalogue authoring guide (legacy format)

> **Status: describes the legacy question-list JSON.** Imported 2026-10-15 from
> `Creating Questionlist JSON.docx` on the old `boltsupported` branch (tip
> `2efa708`; that branch was deleted after this import). The new app gives every
> question a build-time stable ID and changes the catalogue only through `catalogue_updated`
> events (spec §8, §11.1). **Stage 2 must revise this guide** to the new format and the
> sign-off rule in spec C9 before anyone authors catalogue content from it. Until then it
> describes only `docs/salvage/questionlist.json`, which must not be edited (see
> `docs/salvage/README.md`).

## 1. File format
The file must be JSON. Keys are always in double quotes. Values can be strings, numbers,
booleans, arrays or objects.

## 2. Root structure
The top level has two objects:
- `"management"`: policy, planning and administrative questions.
- `"site"`: physical site and regulatory compliance questions.

```json
{
  "management": { },
  "site": { }
}
```

## 3. A section
Each section is a key-value pair inside `"management"` or `"site"`. The key is the section
title. The value is an array of strings, each one question.

```json
"1.0 Health and Safety Policy": [
  "1.1 HS Policy Issued and Displayed",
  "1.2 Health and Safety Policy communicated and understood"
]
```

## 4. Numbering
Sections are numbered `X.0` (1.0, 2.0, 3.0). Questions inside a section are `X.Y` (1.1, 1.2,
2.1). Numbering is sequential, with no duplicates.

## 5. Adding a section
1. Choose `"management"` or `"site"`.
2. Give it the next section number (14.0, 15.0 and so on).
3. Name it clearly.
4. Add an array of sequentially numbered questions.

```json
"14.0 Environmental Monitoring": [
  "14.1 Dust monitoring stations installed and operational",
  "14.2 Noise monitoring records maintained and available"
]
```

## 6. Adding a question to a section
Add a string at the end of the section's array with the next number.

Before:
```json
"1.0 Health and Safety Policy": [
  "1.1 HS Policy Issued and Displayed",
  "1.2 Health and Safety Policy communicated and understood"
]
```
After:
```json
"1.0 Health and Safety Policy": [
  "1.1 HS Policy Issued and Displayed",
  "1.2 Health and Safety Policy communicated and understood",
  "1.3 Health and Safety Policy applicable to all persons on site"
]
```

## 7. Validation
- The file starts with `{` and ends with `}`.
- Keys and string values are in double quotes.
- Arrays are in `[ ]` with items separated by commas; objects are separated by commas.
- No trailing comma after the last item of an array or object.

## 8. Saving
Save with a `.json` extension in UTF-8. Validate with a JSON linter before use.
