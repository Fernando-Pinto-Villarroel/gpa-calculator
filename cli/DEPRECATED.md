# Deprecated: GPA Calculator CLI

> **This CLI is no longer maintained.** It is the original prototype of the project, equivalent to a **version 0.1**, and it predates both released versions of the web app. Use the web app in [`client/`](../client) instead.

The `version` field in `cli/package.json` says `1.1.0`, but that number was never tied to what the CLI can do: its feature set stayed at the prototype stage while the web app moved on to version 1.x and then 2.0.0.

## Why it is kept

It is kept only as a historical reference of the first calculation logic (quality points, cumulative GPA, remaining credits and a simple target-GPA estimate). It is not updated, tested or deployed, and its results should not be relied on.

## What it does

- Reads a single, hard-coded course list with grades from `src/data/data.ts`. There is no cohort selection: you edit the file by hand.
- Prints curriculum totals, the current GPA, attempted credits and remaining credits.
- Asks for a target GPA and estimates how many remaining courses would need each grade to reach it.

## What it does not have

Compared with the web app, the CLI is missing almost everything, including:

| Area | Web app v1 | Web app v2 | CLI |
|---|---|---|---|
| Cohort catalogs (pre-loaded credits per cohort) | Yes | Yes (8 cohorts) | No, one hand-edited list |
| Saving grades between sessions | Yes (browser storage) | Yes | No |
| Course retakes (multiple attempts) | Yes | Yes, with the catalog's 3-attempt limit | No |
| Honors (Latin honors, Dean's and President's List) | Yes | Yes | No |
| Academic standing (SAP) | GPA only | GPA and rate of progress | No |
| Forecast with grade combinations | Yes | Yes | Basic target estimate only |
| Statistics and charts | Yes | Yes | No |
| SIS PDF import and JSON backups | Yes | Yes | No |
| ESP certificate as its own program | No | Yes (own GPA, levels, placement level) | No |
| Canvas Course Playground | No | Yes | No |
| Guided tour, translations (EN/ES/PT), themes | Yes | Yes | No |

It also follows rules that are now known to be inaccurate. For example, it mixes ESP courses into the degree GPA, while the current student catalog states that ESP courses are non-credit and are not calculated into the program GPA.

## Running it anyway

If you still want to try it for reference (requires [Bun](https://bun.sh/)):

```bash
cd cli
bun install
bun run dev
```
