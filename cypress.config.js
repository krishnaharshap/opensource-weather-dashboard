module.exports = {
  e2e: {
    baseUrl: process.env.BASE_URL || "http://localhost:3000",
    supportFile: "cypress/support/e2e.js",
    specPattern: "cypress/e2e/{alerts,data-driven}/**/*.spec.js",
    setupNodeEvents(on, config) {
      // register visual snapshot plugin if needed later
      try {
        require("cypress-image-snapshot/plugin")(on, config);
      } catch (e) {
        // plugin optional
      }
      return config;
    },
    env: {
      apiBaseUrl: process.env.API_BASE_URL || "http://localhost:4000/api",
      openWeatherKey: process.env.OPENWEATHER_KEY || "",
      mockExternalApis: process.env.MOCK_EXTERNAL !== "false"
    }
  },
  reporter: "mochawesome",
  reporterOptions: {
    reportDir: "reports/mochawesome",
    overwrite: false,
    html: true,
    json: true
  }
};
