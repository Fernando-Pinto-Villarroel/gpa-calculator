# Changelog

All notable changes to the Jala University GPA Calculator are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-10-05

Version 2 adds a second program, the **ESP (English for Specific Purposes for Software Engineers) certificate**, alongside the Commercial Software Engineering degree, plus a Canvas course playground and a large round of accuracy and usability fixes. Grades saved with version 1 carry over automatically: the browser storage format is unchanged.

### Added

#### ESP certificate program
- Career selector in the header to switch between Commercial Software Engineering and the ESP certificate. Each program keeps its own grades, cohort, GPA, statistics and forecast, and has its own accent color.
- ESP grade entry organized in Levels 1–3 (instead of terms) following catalog v5.1 and the ESP program head's rules.
- Placement level selector (Level 1 or Level 2). In modules M2–M5 only the version for your level is shown and counted (ESP 1 / Lab M2L2, Lab M3L1 / M3L2, Lab M4L1 / M4L2, ESP 2 / Lab M5L2). Grades entered for the other level are kept and come back if you switch. The level is detected from your grades when possible, remembered per cohort, and a warning appears when grades exist on both levels.
- ESP GPA as an equal-weight average of every course and lab, since the program carries no credits.
- ESP completion based on the ESP courses of your level (6 at Level 1, 4 at Level 2): labs count toward the ESP GPA but never block completion, and Special Labs M12–M16 count only if you take them.
- Labs cannot be retaken, and ESP retakes have no credits field.
- Cohort I - 2023 without ESP module 2 (no ESP 1 and no Lab M2L2), matching how that cohort took the program.
- ESP-specific dashboard (Completed ESP Courses, Completed ESP Labs, Levels Completed, Starting Level), statistics, forecast, About sections and guided tour steps, all worded in levels instead of terms ("Level GPA", Level scope in the forecast).

#### Canvas Course Playground
- Per-course playground to simulate a course grade from its assignments, assignment groups and weights.
- Import a course directly from a Canvas grades PDF, and back up or restore a playground as JSON.
- Canvas PDF import also reads courses whose assignment groups are not written in capitals and whose items are pending (for example Practicum II), in both the print-button and browser-print layouts.
- New assignments are added at the end of the list, and any assignment can be duplicated.
- A score can be left pending with `-` (shown as `- / 18`) and only counts in the total once it has a number; arrow keys and the stepper go below 0 to `-`.

#### Grades, standing and rules
- Cohort II - 2026 for Commercial Software Engineering (8 cohorts, I - 2023 through II - 2026).
- Rate of Progress (credits passed ÷ credits attempted) on the Commercial SE dashboard. Academic standing now follows both SAP conditions of the student catalog: SAP Risk below a 2.00 GPA or a 67% rate of progress, Academic Risk between 2.00 and 2.50 or between 67% and 75%, with a message explaining which one triggered it.
- Three-attempt limit per course from the student catalog: the retake dialog warns after the second failed attempt, flags dismissal after the third and stops adding attempts, and the dashboard shows an alert for any course with three failed attempts. The forecast never plans a fourth attempt.
- Info tooltips on every dashboard card explaining what each metric means, opened by hover, tap or keyboard.
- "Satisfactory Academic Progress (SAP)" card on the About page for Commercial SE, and an "Academic standing in ESP" card for ESP.
- Backup import that recognizes which program each grade belongs to and restores Commercial SE, ESP or both, naming the affected program(s) in the confirmation.
- SIS PDF import now imports ESP grades too (including retake attempts) and sets the placement level from the transcript.

#### Offline mode
- The app works without a connection after the first visit, installed as a PWA or in the browser: every page in every language is cached, grades keep saving locally, and while online each page is always fetched fresh so nobody gets stuck on an old release. Each deploy ships a new service worker that removes the previous release's cache. Any caching failure falls back to the network, browsers without service workers simply run online, and if an app file fails to load while online the offline cache resets itself once.

#### Guided tour
- Change the tour language from inside the tour.
- "Skip this page" (continue on the next page) in addition to "Skip tour".
- Tour steps for the career selector, the ESP grades page and the Canvas playground.
- One-time "What's new in version 2" prompt for people who already finished the version 1 tour, with a shortcut to take the new tour.

### Changed
- The grades page moved from `/config` to `/grades`. Old links and bookmarks redirect automatically.
- Much faster navigation between pages: every page is now prerendered and preloaded, so switching pages no longer waits for the server, and the forecast and statistics charts appear sooner.
- The "Remaining Credits" dashboard card was replaced by "Rate of Progress", since remaining credits can already be read from "Earned Credits … of …".
- Dashboard card titles wrap onto a second line instead of being cut off, and on narrow screens the icon sits above the text.
- Language, theme and "Restart tour" moved into a header actions menu.
- The About page explains that a failed attempt still counts toward the cumulative GPA after a retake, and shows the GPA formula as a fraction with the quality-points sub-formula.
- UI/UX and IoT courses are swapped starting from cohort I - 2024, matching the updated curriculum.
- SIS PDF import recognizes the COMM course codes used by the 2025 cohorts.
- Import and export icons on the grades page are no longer swapped.
- Clearer wording for the cumulative GPA and a better placement for the grade-combinations step of the guided tour.

### Deprecated
- The command-line prototype in `cli/` is no longer maintained (see `cli/DEPRECATED.md`).

### Fixed
- A course graded F or D- as a single grade counted as passed in Completed Subjects, Earned Credits, Terms Completed and completion statistics.
- The "Passed" toggle in the retake dialog could mark a failing attempt as passed, and overriding the credits of a failed course turned it into a passed course.
- A student whose every grade was F (GPA 0.00) saw no academic-risk badge or alert.
- GPAs that display as a threshold value (for example 3.50) could narrowly miss honors, Dean's List or forecast targets because of floating-point rounding.
- SIS PDF import deleted grades entered manually for courses that were not in the PDF.
- The grade distribution chart counted every attempt of a retaken course as a separate course.
- Dashboard card titles were truncated ("Completed…") on mobile and when zooming in.
- "Projected Honor" on the Statistics page and several dashboard tooltips were always shown in English.
- The app was advertised as working offline, but reloading or navigating without a connection failed because only the icons were cached.
- The service worker could log an uncaught "Failed to fetch" error when a request failed.

## [1.1.0] - 2026-03-29

### Added
- GPA forecast page with term and cumulative targets, quick scenarios and an optimal grade-combination finder.
- Multiple attempts per course (retakes), where every attempt counts toward the GPA and only the passed one counts toward completion.
- Guided tour for new users.
- SIS report-card PDF import with course-code mapping and credit adjustment across cohorts.
- JSON import validation for malformed backups.
- Separate cumulative and per-term GPA progression charts, and the current honor highlighted on the dashboard.

### Changed
- "Academic failure" renamed to "SAP risk".
- Statistics charts use logarithmic spacing for readability.

### Fixed
- SIS PDF reading on mobile.
- Course codes and credits for several cohorts (II - 2023, I - 2024 and others).
- Spanish and Portuguese translations.

[2.0.0]: https://github.com/Fernando-Pinto-Villarroel/gpa-calculator/compare/v1.1.0...v2.0.0
[1.1.0]: https://github.com/Fernando-Pinto-Villarroel/gpa-calculator/releases/tag/v1.1.0
