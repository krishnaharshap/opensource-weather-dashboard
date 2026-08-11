import "./commands";
import "./intercepts";
import "cypress-axe";

// Global helper to initialize before each test
Cypress.Commands.add("initApp", () => {
  // Additional init steps could go here
});

// Intercepts must be registered inside a test context, and don't persist
// across tests, so set them up fresh before every test.
beforeEach(() => {
  cy.autoRegisterIntercepts();
});
