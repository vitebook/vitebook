import { createRequire } from 'module';

export const esmRequire = () => createRequire(import.meta.url);

export const requireShim = [
  "import __path from 'node:path';",
  "import { fileURLToPath as __fileURLToPath } from 'node:url';",
  "import { createRequire as __createRequire } from 'node:module';",
  'const require = __createRequire(import.meta.url);',
  'const __filename = __fileURLToPath(import.meta.url);',
  'const __dirname = __path.dirname(__filename);',
].join('\n');
