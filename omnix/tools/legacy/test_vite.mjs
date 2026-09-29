import { build } from 'vite';
async function test() {
  try {
    await build({
      root: process.cwd(),
      build: {
        lib: { entry: 'src/pages/Home.tsx', formats: ['es'] },
        outDir: 'dist-test',
        rollupOptions: { external: [/^react/, /^react-router-dom/, /^lucide-react/, /^@tanstack/, /^@supabase/, /^motion/] }
      }
    });
  } catch(err) {
    console.error(err);
  }
}
test();
