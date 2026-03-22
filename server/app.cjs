const cookies = require("cookie-parser");
const express = require("express");

require("dotenv").config();
const app = express();

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
];

const envOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([...defaultOrigins, ...envOrigins]);

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  
  if (!requestOrigin) {
    return next();
  }

  const isAllowed = allowedOrigins.has(requestOrigin);
  const isSameOriginRequest = !requestOrigin.includes('localhost') && !requestOrigin.includes('127.0.0.1');

  if (isAllowed || isSameOriginRequest) {
    res.header("Access-Control-Allow-Origin", requestOrigin);
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    );
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(cookies());

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is up" });
});

const userRoutes = require("./routes/userRouters.jsx");
app.use("/api", userRoutes);

app.use((error, req, res) => {
  console.error("Unhandled API error:", error);
  res.status(500).json({ success: false, message: "Internal server error" });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

module.exports = app;
