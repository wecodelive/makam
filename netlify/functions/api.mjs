import serverless from "serverless-http";
import app from "../../server/app.cjs";

export const handler = serverless(app);
