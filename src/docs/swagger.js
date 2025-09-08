// src/docs/swagger.js
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

function setupSwagger(app) {
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Stanbic Authentication System API",
        version: "1.0.0",
        description: "API documentation for SAS endpoints",
      },
      servers: [
        {
          url: "http://localhost:3000", // adjust if different
        },
      ],
    },
    apis: ["./src/routes/*.js"], // will read JSDoc comments in your routes
  };

  const swaggerSpec = swaggerJsdoc(options);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;
