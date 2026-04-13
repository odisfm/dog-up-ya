import { build } from 'esbuild'

build({
    entryPoints: ['src/lambda.ts'],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: 'dist/lambda.mjs',
    format: 'esm',
    banner: {
        js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`
    }
})