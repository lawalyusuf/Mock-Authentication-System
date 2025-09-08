const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Stanbic Authentication System (SAS) API",
      version: "1.0.0",
      description: "Auth API: register, login, MFA, RBAC",
    },
  },
  apis: ["./src/routes/*.js"],
};

const spec = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));
}

module.exports = setupSwagger;
