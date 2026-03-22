import { createRequire } from "node:module";
import serverless from "serverless-http";

const require = createRequire(import.meta.url);
const app = require("../../server/app.jsx");

export const handler = serverless(app);
