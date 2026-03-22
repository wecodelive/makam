import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const handler = require('./handler-impl.cjs');

export default handler;
