require("dotenv").config();
require("express-async-errors");

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json"); // make sure this exists
const authRoutes = require("./routes/auth.routes"); // path to your auth routes

// Initialize app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// --- Routes ---
// Mount auth routes
app.use("/auth", authRoutes);

// Basic routes
app.get("/", (req, res) => res.send("Home page"));
app.get("/admin", (req, res) => res.send("Admin page"));

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Serve static mock UI
app.use("/", express.static(path.join(__dirname, "../public")));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SAS server listening on port ${PORT}`);
});
