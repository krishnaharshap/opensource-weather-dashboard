```markdown
# opensource-weather-dashboard (local-only skeleton)

Purpose:
- Demo Cypress E2E framework (JS) for a Weather Dashboard app.
- Current Implementation Focus: scaffolding, core Cypress config, basic UI + API integration tests.
- Uses free public APIs: OpenWeatherMap (free key) and Open-Meteo (no-key).

How to run locally:
1. In project root: npm ci
2. Start the mock backend (scripts/start-mock-backend.js) if you want stable tests:
   node scripts/start-mock-backend.js
3. In another terminal, run Cypress:
   npx cypress open     # interactive
   npx cypress run      # headless

Environment:
- Add keys (if you want to use live OpenWeatherMap) to environment variables or to .env (local only).
- See .env.example for variable names.

Notes:
- This skeleton uses js-based Cypress tests and fixtures for deterministic runs.
- Use mockExternalApis=true in cypress.config.js env for fully stubbed external API responses.
```
