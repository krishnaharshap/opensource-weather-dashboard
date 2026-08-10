// Central intercepts registration
const mockMode = Cypress.env("mockExternalApis") === true || Cypress.env("mockExternalApis") === "true";

Cypress.Commands.add("registerIntercepts", () => {
  // Intercept backend POST /alerts and return mocked id for deterministic tests if desired
  cy.intercept("POST", "/api/alerts", (req) => {
    if (req.body && req.body.name) {
      req.reply({
        statusCode: 201,
        body: { id: `alert-${Date.now()}`, ...req.body }
      });
    } else {
      req.continue();
    }
  }).as("createAlert");

  // Intercept backend GET /alerts to allow test validation via api endpoint
  cy.intercept("GET", "/api/alerts", (req) => {
    req.continue();
  }).as("getAlerts");

  // Intercept OpenWeatherMap calls to stub fixture if mockMode
  cy.intercept({ method: "GET", url: /api.openweathermap.org\/data\/2.5\/weather.*/ }, (req) => {
    if (mockMode) {
      req.reply({ fixture: "weather-openweather-london.json" });
    } else {
      req.continue();
    }
  }).as("openWeather");

  // Intercept Open-Meteo calls to stub fixture if mockMode
  cy.intercept({ method: "GET", url: /api.open-meteo.com\/v1\/forecast.*/ }, (req) => {
    if (mockMode) {
      req.reply({ fixture: "weather-open-meteo-london.json" });
    } else {
      req.continue();
    }
  }).as("openMeteo");
});

// Register by default so tests can rely on intercepts being set up
Cypress.Commands.add("autoRegisterIntercepts", () => {
  cy.registerIntercepts();
});
