const express = require("express");
const cors = require("cors");
const globalErrorHandler = require("./middleware/errorHandler");
const AppError = require("./utils/AppError");

const userRoutes = require("./routes/userRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Hello World! :)");
});

app.use("/api/v1/users", userRoutes);

app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// // Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
