// ESM bridge for CommonJS serverless handler
// Vercel requires .js files to be recognized as serverless functions
// This ESM file uses createRequire to load and export the CommonJS handler

import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const handlerFunction = require('./handler-impl.cjs');

export default handlerFunction;
