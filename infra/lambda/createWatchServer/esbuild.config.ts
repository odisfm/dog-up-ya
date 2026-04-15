import { build } from 'esbuild'
import fs from 'fs'

build({
    entryPoints: ['lambda/createWatchServer/createWatchServer.ts'],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: 'lambda/createWatchServer/createWatchServer.mjs',
    format: 'esm',
    banner: {
        js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`
    },
    plugins: [
        {
            name: 'sh-loader',
            setup(build) {
                build.onLoad({ filter: /\.sh$/ }, async (args) => {
                    const content = await fs.promises.readFile(args.path)
                    const base64 = content.toString('base64')

                    return {
                        contents: `export default "${base64}"`,
                        loader: 'js',
                    }
                })
            }
        }
    ]
})