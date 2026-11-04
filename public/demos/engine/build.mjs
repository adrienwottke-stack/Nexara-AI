import { createRequire } from 'node:module';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';

const out = dirname(fileURLToPath(import.meta.url));
const original = process.argv[2];
if (!original) throw new Error('Usage: node build.mjs <absolute original engine-playground directory>');
const source = resolve(original);
const requireOriginal = createRequire(join(source, 'package.json'));
const { build } = requireOriginal('esbuild');
const raw = { name: 'original-source-raw', setup(builder) {
  builder.onResolve({ filter: /\?raw$/ }, args => ({ path: resolve(args.resolveDir, args.path.replace(/\?raw$/, '')), namespace: 'original-raw' }));
  builder.onLoad({ filter: /.*/, namespace: 'original-raw' }, async args => ({ contents: `export default ${JSON.stringify(await readFile(args.path, 'utf8'))}`, loader: 'js' }));
  builder.onResolve({ filter: /^engine-playground-original$/ }, () => ({ path: join(source, 'src', 'engine-three.ts') }));
  builder.onResolve({ filter: /^engine-playground-model$/ }, () => ({ path: join(source, 'src', 'model.ts') }));
  // The original 2.5s cache deadline protects a concurrently running native
  // audio process. This standalone, click-loaded demo has no audio process;
  // permit its local 6.5MB cache to finish rather than aborting a valid request.
  builder.onLoad({ filter: /[\\/]engine-geometry-cache\.ts$/ }, async args => ({ contents: (await readFile(args.path, 'utf8')).replace('},2500);', '},12000);'), loader: 'ts', resolveDir: dirname(args.path) }));
} };
await build({ entryPoints: [join(out, 'main.ts')], bundle: true, minify: true, format: 'esm', target: 'es2022', outfile: join(out, 'engine.js'), plugins: [raw], define: { 'import.meta.env.BASE_URL': JSON.stringify('/demos/engine/') }, legalComments: 'inline', sourcemap: false });
await mkdir(join(out, 'models'), { recursive: true });
for (const file of ['m52-piston-reference.glb', 'm52-piston-engine.glb', 'm52-piston-reference.json', 'm54-r11-geometry-cache.bin.gz', 'studio-env.bin', 'studio-env.json']) await copyFile(join(source, 'public', 'models', file), join(out, 'models', file));
await copyFile(join(source, 'LICENSE'), join(out, 'ENGINE_PLAYGROUND_LICENSE.txt'));
await copyFile(resolve(dirname(requireOriginal.resolve('three')), '..', 'LICENSE'), join(out, 'THREE_LICENSE.txt'));
await writeFile(join(out, 'BUILD.json'), JSON.stringify({ builtAt: new Date().toISOString(), originalPackage: JSON.parse(await readFile(join(source, 'package.json'), 'utf8')).version, originalComponents: ['src/engine-three.ts', 'src/model.ts', 'src/engine-3d-model.ts', 'src/native-view.ts', 'src/piston-asset.ts'], localAdaptations: ['Geometry-cache deadline extended from 2500ms to 12000ms in the standalone bundle only; original sources unchanged'], scope: 'Original browser geometry with synthetic crank-angle control, no native process, audio or calibrated physics', originalAssets: ['m52-piston-reference.glb', 'm52-piston-engine.glb', 'm52-piston-reference.json', 'm54-r11-geometry-cache.bin.gz', 'studio-env.bin', 'studio-env.json'] }, null, 2));
console.log('Standalone Engine Playground demo built with local original components and assets.');
