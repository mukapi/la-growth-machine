import * as esbuild from 'esbuild';

// Config
const BUILD_DIRECTORY = 'dist';
const PRODUCTION = process.env.NODE_ENV === 'production';
const ENTRY_POINTS = ['src/swiper-testimonial.js'];

// Create context
const context = await esbuild.context({
  bundle: true,
  entryPoints: ENTRY_POINTS,
  outdir: BUILD_DIRECTORY,
  minify: PRODUCTION,
  sourcemap: !PRODUCTION,
  target: 'es2020',
});

// Build files in prod
if (PRODUCTION) {
  await context.rebuild();
  context.dispose();
  console.log('✅ Build completed successfully!');
}
// Watch files in dev
else {
  await context.watch();
  console.log('👀 Watching for changes...');
}
