import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const handlerFunction = require('./handler-impl.cjs');

export default handlerFunction;
