// Custom reusable commands (JS-based)
Cypress.Commands.add("apiLogin", (username = "demo-user", password = "password123") => {
  return cy.request({
    method: "POST",
    url: `${Cypress.env("apiBaseUrl")}/auth/login`,
    body: { username, password },
    failOnStatusCode: false
  }).then((resp) => {
    if (resp.status === 200 && resp.body.token) {
      window.localStorage.setItem("authToken", resp.body.token);
    }
    return resp;
  });
});

Cypress.Commands.add("clearData", () => {
  return cy.request({
    method: "POST",
    url: `${Cypress.env("apiBaseUrl")}/testing/clear`,
    failOnStatusCode: false
  });
});
