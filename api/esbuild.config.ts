import { build } from 'esbuild'

build({
    entryPoints: ['src/lambda.ts'],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: 'dist/lambda.mjs',
    format: 'esm',
    banner: {
        js: `
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
        `.trim()
    },
})