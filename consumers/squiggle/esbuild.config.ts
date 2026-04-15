import { build } from 'esbuild'

build({
    entryPoints: ['squiggle/lambda.ts'],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: 'squiggle/lambda.mjs',
    format: 'esm',
    banner: {
        js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`
    }
})