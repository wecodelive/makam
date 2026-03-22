const serverless = require("serverless-http");
const path = require("path");

const app = require(path.join(__dirname, "../../server/app.jsx"));

exports.handler = serverless(app);
