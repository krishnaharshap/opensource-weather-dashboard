// Data-driven spec: iterates cities from fixtures/cities.json and validates UI + API mapping
// JS-based Cypress spec suitable for the opensource-weather-dashboard skeleton.
//
// Test assumptions:
// - mockExternalApis=true to use fixtures for external APIs (configured in cypress.config.js or env)
// - The app exposes a search UI with selectors used below (data-cy attributes).
// - Backend mock (json-server) is running at Cypress.env('apiBaseUrl') and supports /api/users/demo-user/cities
// - Adjust selectors if your UI differs.

describe('Data-driven: Add city and verify UI + backend persistence (Hyderabad, Calgary)', () => {
  before(() => {
    // ensure a clean state before the data-driven suite
    cy.clearData();
  });

  beforeEach(() => {
    cy.visit('/');
    cy.initApp();
    cy.apiLogin();
  });

  it('iterates cities from fixture and validates add-city flow', () => {
    cy.fixture('cities.json').then((cities) => {
      cities.forEach((city) => {
        // For each city create a test step block to improve logging
        cy.log(`Testing city: ${city.name} (${city.country})`);

        // Ensure intercepts are prepared to reply with the correct fixture depending on API call
        // Intercepts were registered in support/intercepts.js; here we override reply per city when needed.
        // OpenWeatherMap pattern:
        cy.intercept({ method: 'GET', url: /api.openweathermap.org\/data\/2.5\/weather.*/ }, (req) => {
          req.reply({ fixture: city.openweatherFixture });
        }).as('openWeatherDynamic');

        // Open-Meteo pattern:
        cy.intercept({ method: 'GET', url: /api.open-meteo.com\/v1\/forecast.*/ }, (req) => {
          req.reply({ fixture: city.openMeteoFixture });
        }).as('openMeteoDynamic');

        // Use the UI to add the city (adjust selectors if your app differs)
        cy.get('[data-cy=city-search-input]').clear().type(city.name);
        cy.get('[data-cy=city-search-submit]').click();

        // Wait for the external API call and assert it occurred
        cy.wait('@openWeatherDynamic').its('response.statusCode').should('eq', 200);

        // Wait for the backend add city POST (alias registered as addCity in support/intercepts.js)
        // If you used a different alias, update accordingly
        cy.intercept('POST', '/api/users/*/cities').as('addCityDynamic');
        cy.wait('@addCityDynamic').then((interception) => {
          expect(interception.response.statusCode).to.be.oneOf([200, 201]);
          // verify backend payload contains city name or lat/lon mapping
          const body = interception.request.body;
          expect(body).to.exist;
          // body may include name or lat/lon; check at least one
          expect(body.name || (body.lat && body.lon)).to.exist;
        });

        // Verify UI shows the added city card
        // Use a stable selector pattern. The spec assumes data-cy attribute pattern: city-card-{id}
        // If your app uses different ids, change accordingly.
        cy.get(`[data-cy=city-card-${city.name}]`).should('be.visible').within(() => {
          cy.contains(city.name);
          cy.get('[data-cy=temp]').should('exist');
        });

        // Validate persistence via direct API call
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiBaseUrl')}/users/demo-user/cities`,
          headers: { Authorization: `Bearer ${window.localStorage.getItem('authToken') || ''}` }
        }).then((resp) => {
          expect(resp.status).to.be.oneOf([200, 201, 204]);
          if (Array.isArray(resp.body)) {
            const found = resp.body.find((c) => {
              return c.name === city.name || (c.lat === city.lat && c.lon === city.lon);
            });
            expect(found, `city ${city.name} should be persisted in backend`).to.exist;
          } else {
            cy.log('Backend returned non-array result when verifying persisted cities; adjust assertions as needed.');
          }
        });

        // Clean up per-city if needed (optional)
        // For deterministic runs you may want to clear data between iterations:
        cy.request({ method: 'POST', url: `${Cypress.env('apiBaseUrl')}/testing/clear`, failOnStatusCode: true });
      });
    });
  });
});