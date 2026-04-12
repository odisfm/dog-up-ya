import { build } from 'esbuild'

build({
    entryPoints: ['src/lambda.ts'],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: 'dist/lambda.mjs',
    format: 'esm',
})