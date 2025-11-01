import "./commands";
import "./intercepts";
import "cypress-image-snapshot/command";
import "cypress-axe";

// Global helper to initialize before each test
Cypress.Commands.add("initApp", () => {
  // Register intercepts file will run automatically on import
  // Additional init steps could go here
});
