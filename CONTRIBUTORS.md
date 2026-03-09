# Contributors

Thank you to everyone who has contributed to this project.

---

## Developers

| Name                      | Role                | Cohort          | Profile                                                            |
| ------------------------- | ------------------- | --------------- | ------------------------------------------------------------------ |
| Fernando Pinto Villarroel | Creator & Developer | Cohort I – 2023 | [LinkedIn](https://www.linkedin.com/in/fernando-pinto-villarroel/) |

---

## How to Contribute

Contributions are welcome. Whether it is a bug report, a feature suggestion, a translation improvement, or a code change, all thoughtful input is appreciated.

### Reporting Issues

Open an issue on GitHub with a clear title, a description of the problem or suggestion, and steps to reproduce if applicable.

### Submitting a Pull Request

1. Clone the repository to your computer
2. Create a branch from `main` with a descriptive name (e.g., `fix/grade-rounding`, `feat/export-pdf`)
3. Make your changes following the conventions described below
4. Push your commits and branch to the repository
5. Open a pull request with a clear description of what was changed and why
6. Assign me (Fernando Pinto Villarroel) for review

### Code Conventions

This project follows these conventions, please respect them in any contribution:

- **Language (General):** All code, variable names, comments, and commit messages must be in **English**
- **No comments or emojis in code (General)** — write self-documenting code; use Lucide React icons for visual indicators
- **No server-side storage (General)** — all user data must remain exclusively in `localStorage`; do not introduce any API routes that store personal data
- **Types (General)** — TypeScript strict mode is enforced; avoid `any`
- **Architecture (Client):** Feature-based structure under `client/src/features/`, `client/src/core/`, and `client/src/shared/` — place new code in the appropriate layer
- **Styling (Client):** Tailwind CSS v4 utility classes; no inline styles or separate CSS files unless strictly necessary
- **i18n (Client):** Any user-facing string must be added to all three translation files (`messages/en.json`, `messages/es.json`, `messages/pt.json`) — no hardcoded UI text
- **Responsiveness (Client)** — all UI changes must be tested on both desktop and mobile layouts

You can use AI to generate the code for new features or bug-fixing, but please manually review the code and ensure no new bugs are silently introduced.

### Running the Project Locally

See the [Getting Started](README.md#getting-started) section in the README.

---

## Beta Testers

The following students acted as real users that validated the app during early development:

| Name                                   | Cohort           |
| -------------------------------------- | ---------------- |
| Luciana Elizabeth Flores Torrico       | Cohort I – 2023  |
| Daniel López Ayala                     | Cohort I – 2023  |
| Irwin Luna Perez                       | Cohort I – 2023  |
| Hugo Fernando Monteiro da Silva Junior | Cohort II – 2023 |
| Pedro Catriel Pereira Torrez           | Cohort I – 2024  |
| Karen Ivonne Cruz Alvarez              | Cohort I – 2025  |
| Jhaziel Mamani Marca                   | Cohort II – 2025 |
| Adriano Pereira da Silva               | Cohort I – 2026  |

---

_This file will be updated as new contributors join the project._
