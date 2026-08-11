# OpenSource Weather Dashboard: Cypress E2E Framework

A Cypress end-to-end testing framework and demo app for a weather dashboard. Built in plain JS (no TypeScript) to show data-driven testing, UI plus API validation, and deterministic mocking with fixtures.

## What's in this repo

- Cypress specs covering an alert-creation flow and a data-driven add-city flow (Hyderabad, Calgary)
- Fixtures for two weather APIs (OpenWeatherMap and Open-Meteo), used to keep tests fast and deterministic
- A json-server mock backend (`scripts/start-mock-backend.js`) for auth, alerts, and city persistence
- A minimal static demo frontend (`app/`) so the specs have something to run against
- An accessibility check (cypress-axe) wired into the alert spec as a working example

## Setup

Prerequisites: Node.js 18.x (LTS) and npm 8+.

```
npm install --legacy-peer-deps
npm run start:mock          # mock backend on http://localhost:4000/api
npx http-server ./app -p 3000   # demo frontend, in a second terminal
npx cypress open            # or: npx cypress run
```

Environment variables (see `.env.example`):

- `OPENWEATHER_KEY`: only needed if you run live integration tests (`MOCK_EXTERNAL=false`)
- `API_BASE_URL`: default `http://localhost:4000/api`
- `BASE_URL`: default `http://localhost:3000`
- `MOCK_EXTERNAL`: `true` by default, uses fixtures instead of live API calls

## Tests

**create-alert.spec.js**: opens the alert modal, fills it in, saves it, and checks the POST went through and the alert was persisted via a follow-up GET. Also runs `cy.injectAxe()` / `cy.checkA11y()` against the page.

**data-driven/cities.spec.js**: loads `cities.json` and, for each city, adds it through the UI, intercepts both the OpenWeatherMap and Open-Meteo calls with city-specific fixtures, and checks the city was persisted on the backend and rendered in the UI.

Both specs default to mocked external APIs (`MOCK_EXTERNAL=true`). Set it to `false` and provide `OPENWEATHER_KEY` to hit the real API instead, useful for occasional integration runs but not for regular CI since it's slower and rate-limited.

## UI + API validation pattern

The specs follow one pattern throughout: trigger a UI action, wait on the intercepted request, then confirm the result both in the intercepted response and via a direct `cy.request` to the backend. That way a test catches whether the UI called the right endpoint and whether the server actually persisted it, not just one or the other.

## Accessibility and visual regression

cypress-axe is wired in and used in `create-alert.spec.js`. Add `cy.injectAxe()` / `cy.checkA11y()` to other specs the same way as you add flows.

Visual regression isn't set up. If you want it later, Percy (`@percy/cypress`) is a straightforward hosted option with a free tier.

## Good practices this repo follows

- Register `cy.intercept()` before the action that triggers the request, not after. Registering it late can miss the request and make the test flaky.
- Use `data-cy` attributes for selectors instead of CSS classes, so tests don't break when styling changes.
- Keep tests isolated: seed and clear data through the mock API's `/api/testing/clear` endpoint rather than relying on test order.

## Contributing

LICENSE (MIT) is in place. CONTRIBUTING.md, issue/PR templates, and a GitHub Actions workflow aren't set up yet, those are open follow-ups if this repo grows.

## Troubleshooting

- `npm ci` fails: make sure `package-lock.json` exists, or run `npm install --legacy-peer-deps` once and commit the generated lockfile.
- Cypress can't connect to the base URL: start the demo frontend with `npx http-server ./app -p 3000`.
- A test fails on a selector: check the `data-cy` attribute exists in `app/index.html` and matches the spec.
- External API returns 401: check `OPENWEATHER_KEY` is set and hasn't hit its rate limit.

## License

MIT, see [LICENSE](LICENSE).
