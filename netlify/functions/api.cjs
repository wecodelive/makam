const serverless = require("serverless-http");
const app = require("../../server/app.cjs");

module.exports.handler = serverless(app);
