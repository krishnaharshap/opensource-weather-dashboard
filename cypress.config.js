module.exports = {
  e2e: {
    baseUrl: process.env.BASE_URL || "http://localhost:3000",
    supportFile: "cypress/support/e2e.js",
    specPattern: "cypress/e2e/{alerts,data-driven}/**/*.spec.js",
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
