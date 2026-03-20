import { build } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ─── Step 1: Build popup (React + Tailwind) ───────── */
console.log('Building popup...');
await build();

/* ─── Step 2: Build scripts as IIFE bundles ─────────── */
const scripts = ['background', 'leetcode', 'geeksforgeeks', 'authorizeGithub'];

for (const name of scripts) {
  console.log(`Building ${name}.js...`);
  await build({
    configFile: false,
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      rollupOptions: {
        input: path.resolve(__dirname, `src/scripts/${name}.js`),
        output: {
          entryFileNames: `scripts/${name}.js`,
          format: 'iife',
        },
      },
      minify: true,
    },
  });
}

console.log('Build complete!');
