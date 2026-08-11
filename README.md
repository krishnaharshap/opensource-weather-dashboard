
# OpenSource Weather Dashboard — Cypress E2E Framework (JS)

A professional, open-source-friendly Cypress end-to-end (E2E) testing framework and demo for a Weather Dashboard application.

This repository contains:
- A JS-based Cypress E2E test framework (no TypeScript).
- Deterministic fixtures (OpenWeatherMap and Open-Meteo) and data-driven tests for cities (Hyderabad, Calgary).
- A json-server mock backend to persist test data for fast, stable runs.
- A minimal demo frontend (static) to exercise E2E flows locally.
- Guidance and examples to combine UI + API validation (cy.intercept + cy.request).
- CI-ready guidance for GitHub Actions (Phase 2), reporting, and safe API-key handling.


## Table of contents
- Project overview
- What this repo provides
- Project structure (visual)
- Quick start (local, dev)
- Detailed local setup
  - Prerequisites
  - Install dependencies
  - Environment variables & secrets
  - Start mock backend
  - Start demo frontend
  - Run Cypress (interactive & headless)
- Tests & examples (what's covered)
- Data-driven testing approach
- Combining UI + API validation (example)
- Mocks, fixtures & deterministic testing
- CI guidance (GitHub Actions) — high level
- Visual regression & accessibility (extensions)
- Release / contribution guidelines (open-source)
- Repository housekeeping & best practices
- Recommended commit message & branch strategy
- FAQ / Troubleshooting
- License

## Project overview
- Purpose: demonstrate a full-featured Cypress E2E framework combining UI and API validation for a Weather Dashboard demo app. This repo is intended to be easily runnable locally, useful for teaching, demos, and as a foundation to adapt for real applications.
- Audience: Senior/Lead QA engineers, QA engineers learning professional frameworks, and contributors interested in Cypress + API testing best practices.

## Repo Summary
- Cypress config and JS-based specs implementing:
  - Alert creation flow: UI submit -> intercept POST /api/alerts -> GET /api/alerts persistence check.
  - Data-driven add-city flows using fixtures: Hyderabad and Calgary.
- Fixtures for external APIs:
  - OpenWeatherMap fixtures: weather-openweather-*.json
  - Open-Meteo fixtures: weather-open-meteo-*.json
  - cities.json driving data-driven tests
- Mock backend (json-server) in scripts/start-mock-backend.js:
  - Endpoints: /api/auth/login, /api/alerts, /api/testing/clear, /api/users/:id/cities, etc.
- Minimal demo frontend (app/) with stable data-cy selectors to run end-to-end locally without a real app.
- cypress/support with intercepts/commands to centralize test helpers and stub patterns.

## Project structure (expected)
- package.json
- package-lock.json (after npm install)
- cypress.config.js
- cypress/
  - e2e/
    - alerts/create-alert.spec.js
    - data-driven/cities.spec.js
  - fixtures/
    - weather-openweather-hyderabad.json
    - weather-openweather-calgary.json
    - weather-open-meteo-hyderabad.json
    - weather-open-meteo-calgary.json
    - weather-openweather-london.json
    - weather-open-meteo-london.json
    - cities.json
  - support/
    - e2e.js
    - commands.js
    - intercepts.js
- scripts/
  - start-mock-backend.js
- app/
  - index.html
  - app.js
  - styles.css
- .env.example
- .gitignore
- README.md (this file)
- reports/ (CI artifacts)
- .vscode/ (local, ignored)

## Quick start (local)
1. Ensure Node.js (LTS recommended, e.g., 18.x) and npm are installed:
   - node -v
   - npm -v

2. From project root:
   - npm install --legacy-peer-deps
     - (first-run: use --legacy-peer-deps to bypass plugin peer conflicts)
   - npm run start:mock
     - Starts the mock backend at http://localhost:4000/api
   - Start demo frontend:
     - npx http-server ./app -p 3000
   - In another terminal, open Cypress:
     - npx cypress open
   - Run the example specs:
     - cypress/e2e/alerts/create-alert.spec.js
     - cypress/e2e/data-driven/cities.spec.js

## Detailed local setup (Initial Phase)

Prerequisites
- Node.js (LTS recommended v18.x)
- npm (v8 or higher)
- On Windows, PowerShell is recommended for the commands provided.

Install dependencies
- Run:
  - npm cache clean --force
  - npm install --legacy-peer-deps
- After a stable tree, commit package-lock.json to maintain reproducible installs in CI.

Environment variables & secrets
- Keep secrets out of the repo.
- Add keys to environment variables (PowerShell session or via .env local file that is gitignored).
- Relevant variables:
  - OPENWEATHER_KEY — your OpenWeatherMap key (only required for live integration tests)
  - API_BASE_URL — default: http://localhost:4000/api
  - BASE_URL — default: http://localhost:3000
  - MOCK_EXTERNAL — true | false (default true; use fixtures when true)
- Example (PowerShell session):
  - $env:OPENWEATHER_KEY = "your_key_here"
  - $env:API_BASE_URL = "http://localhost:4000/api"
  - $env:BASE_URL = "http://localhost:3000"
  - $env:MOCK_EXTERNAL = "true"

Start mock backend
- npm run start:mock
- Validates and exposes:
  - POST /api/auth/login -> returns demo token
  - POST /api/alerts -> persists alerts in json-server
  - POST /api/testing/clear -> resets test data

Start demo frontend
- npx http-server ./app -p 3000
- (Or use VSCode Live Server)
- Ensure it loads in a browser at http://localhost:3000

Run Cypress (interactive & headless)
- Interactive: npx cypress open -> run specs manually
- Headless (CI-like): npx cypress run --spec "cypress/e2e/data-driven/cities.spec.js"

Tests & examples (what's covered)
- create-alert.spec.js
  - UI: open alert modal, enter name/city/threshold, click Save
  - Intercepts: cy.intercept('POST', '/api/alerts') returns id
  - Validation: cy.wait('@createAlert') -> inspect response body -> cy.request GET /api/alerts to verify persistence
  - Accessibility: cy.injectAxe() + cy.checkA11y() run against the page before the flow starts
- data-driven/cities.spec.js
  - Loads cities.json fixture with Hyderabad and Calgary and iterates:
    - Adds city via UI, intercepts both external APIs (OpenWeatherMap and Open-Meteo) and stubs each with a city-specific fixture
    - Waits on both API calls and asserts they happened, then asserts backend persisted the city
    - Validates UI card content

Data-driven testing approach
- Keep test data in fixtures/*.json (cities.json).
- Use cy.fixture('cities.json').then(cities => cities.forEach(...) ) to iterate.
- Benefits:
  - Single test file covers multiple test data sets with consistent behavior.
  - Easier to extend: add more entries to cities.json for more coverage.
  - Keep fixtures realistic and minimal.

Combining UI + API validation (pattern)
1. Perform UI action (e.g., submit create-alert form).
2. Use cy.intercept to alias the outgoing POST request and optionally stub response:
   - cy.intercept('POST', '/api/alerts', { statusCode: 201, body: { id: 'alert-...'} }).as('createAlert')
3. cy.wait('@createAlert').its('response.body').should('include', { name: 'HighTempLondon' })
4. Use cy.request to call the backend persistence endpoint and assert the saved record exists:
   - cy.request('GET', `${Cypress.env('apiBaseUrl')}/alerts`).its('body').should('deep.include', {...})

This verifies:
- The UI triggered the correct API call.
- The server persisted state correctly.
- The UI displays the expected result.

Mocks, fixtures & deterministic testing
- Default test runs should use fixtures and intercepts to be deterministic and fast:
  - Set MOCK_EXTERNAL=true / Cypress env mockExternalApis=true
  - Intercept outgoing external API requests and reply with fixtures (cypress/fixtures/...)
- Integration tests that use live APIs:
  - Set MOCK_EXTERNAL=false and provide OPENWEATHER_KEY via environment variables or CI secret.
  - Keep these tests limited (nightly or gated) to avoid rate limits and flakiness.

## CI guidance (GitHub Actions - high level)
- Use GitHub Actions free tier with the following patterns:
  - job: setup Node, install dependencies (npm ci) — commit package-lock.json to enable npm ci
  - job: start mock backend (node scripts/start-mock-backend.js) & start demo frontend (http-server ./app -p 3000)
  - job: run Cypress headless: npx cypress run --spec "cypress/e2e/**/*.spec.js"
  - artifacts: upload reports (mochawesome), screenshots, videos
  - Secrets: store OPENWEATHER_KEY as a GitHub Actions secret for integration tests (do not commit keys)
- Recommended approach:
  - Pull requests: run fast smoke suite that uses mockExternalApis=true (deterministic)
  - Nightly: run full integration suite that calls real external APIs (uses secrets for keys)

## Visual regression & accessibility
- Accessibility: cypress-axe is already wired in. create-alert.spec.js calls cy.injectAxe() in beforeEach and cy.checkA11y() at the start of the test. Add the same pattern to other specs as you add flows.
- Visual regression: not set up yet. If you want it later, Percy (@percy/cypress) is a hosted option with an easy Cypress plugin and a free tier. Add visual checks for key screens (dashboard, alert modal) and review diffs in CI.

## Release / contribution guidelines (open-source) - TODO
- LICENSE: added (MIT), see the LICENSE file at repo root.
- CONTRIBUTING.md:
  - How to run tests locally
  - Branching model & commit message conventions
  - How to add new tests/fixtures and update snapshots
- ISSUE_TEMPLATE & PR_TEMPLATE: Include templates for bug reports and feature requests focused on tests or framework changes.
- CODE_OF_CONDUCT: Add a standard Contributor Covenant CODE_OF_CONDUCT.md to foster a welcoming community.

Repository housekeeping & best practices
- .gitignore should exclude:
  - node_modules/, cypress/videos/, cypress/screenshots/, .env, cypress.env.json, db.json, .vscode/
- Commit package-lock.json after a successful npm install and keep it updated. Use npm ci in CI for deterministic installations.
- Do not commit keys or secret files. Use .env.example for documentation only.
- Keep tests isolated and idempotent:
  - Use testing endpoints to seed and clear data (e.g., POST /api/testing/clear).
  - Avoid test inter-dependency — each test should prepare its own preconditions via API where possible.
- Use stable selectors:
  - data-cy attributes are recommended (used in demo).
- Register cy.intercept() before the action that triggers the request, not after. Registering it late can miss the request entirely and make the test flaky. We hit this exact bug in cities.spec.js and fixed it.
- Test grouping:
  - Fast smoke tests (run on PRs)
  - Full integration tests (nightly)
  - Visual/a11y checks (PR or nightly with review)


Branch strategy
- Use feature branches per change (feature/e2e-alerts, fix/intercepts, chore/docs).
- Open PRs to main with CI passing and tests verified locally.
- Keep PRs small and focused: either tests, infra (CI), or docs.

## FAQ / Troubleshooting (common issues)
- npm ci fails: ensure package-lock.json exists; otherwise use npm install --legacy-peer-deps the first time and commit package-lock.json.
- Cypress shows "Cannot connect baseUrl": start the demo frontend (npx http-server ./app -p 3000) or point baseUrl to your running app.
- Tests failing due to selectors: confirm data-cy attributes exist and match specs.
- External API 401: verify OPENWEATHER_KEY in env and that it has not exceeded rate limits.

License
MIT, see LICENSE.

Notes:
- This repository is intentionally structured to be a reproducible, demonstrable E2E framework that emphasizes:
  - deterministic testing via fixtures and mock backend,
  - clear UI + API validation patterns,
  - data-driven test design and maintainability,
  - a migration path to integration and visual testing.

Next Steps:
- Add a CONTRIBUTING.md template.
- Add GitHub Actions workflow files for PR smoke tests (mocked) and nightly integration tests.
- Sanitize repo for public release (ensure no secrets committed) and prepare a one-click setup guide for new contributors.

