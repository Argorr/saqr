#!/usr/bin/env node
/* eslint-disable no-console -- command-line script */
/**
 * Turn a video into a scroll-scrubbed image sequence for <ScrollSequence>.
 *
 *   FFMPEG=/path/to/ffmpeg node scripts/make-sequence.mjs <video> <name> [options]
 *
 * Options:
 *   --frames 90        number of frames to extract (evenly spread)
 *   --start 0          start time in seconds
 *   --duration 0       length in seconds (0 = to the end)
 *   --desktop 1280     desktop frame width
 *   --mobile 720       mobile frame width (portrait 9:16, see --mobile-fit)
 *   --quality 62       WebP quality
 *   --crop w:h:x:y     crop the source first (e.g. to cut a watermark)
 *   --mobile-fit crop  `crop` = 9:16 centre crop, `pad` = whole frame centred
 *                      on black (for objects that must stay fully visible)
 *
 * Writes public/sequences/<name>/{desktop,mobile}/NNN.webp, poster.jpg and
 * manifest.json. FFMPEG defaults to `ffmpeg` on the PATH.
 */
import {execFileSync} from 'node:child_process';
import {mkdirSync, readdirSync, rmSync, statSync, writeFileSync} from 'node:fs';
import path from 'node:path';

const [input, name, ...rest] = process.argv.slice(2);
if (!input || !name) {
  console.error(
    'Usage: node scripts/make-sequence.mjs <video> <name> [--frames 90] [--start 0] [--duration 0]',
  );
  process.exit(1);
}
const opts = {
  frames: 90,
  start: 0,
  duration: 0,
  desktop: 1280,
  mobile: 720,
  quality: 62,
  crop: '',
  'mobile-fit': 'crop',
};
for (let i = 0; i < rest.length; i += 2) {
  const key = rest[i].replace(/^--/, '');
  if (!(key in opts)) throw new Error(`Unknown option --${key}`);
  opts[key] =
    typeof opts[key] === 'number' ? Number(rest[i + 1]) : rest[i + 1];
}
if (!['crop', 'pad'].includes(opts['mobile-fit'])) {
  throw new Error('--mobile-fit must be "crop" or "pad"');
}
const ffmpeg = process.env.FFMPEG || 'ffmpeg';

// `ffmpeg -i` with no output exits with an error, but prints the stream info we need.
function durationOf(file) {
  try {
    execFileSync(ffmpeg, ['-hide_banner', '-i', file], {stdio: 'pipe'});
  } catch (error) {
    const match = /Duration: (\d+):(\d+):([\d.]+)/.exec(String(error.stderr));
    if (match)
      return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
  }
  throw new Error('Could not read the video duration');
}
const length = opts.duration || durationOf(input) - opts.start;
const fps = opts.frames / length;
const pre = `fps=${fps}${opts.crop ? `,crop=${opts.crop}` : ''}`;
const mobileFilter =
  opts['mobile-fit'] === 'pad'
    ? `scale=${opts.mobile}:-2,pad=${opts.mobile}:${Math.round((opts.mobile * 16) / 9)}:(ow-iw)/2:(oh-ih)/2:black`
    : `crop=ih*9/16:ih,scale=${opts.mobile}:-2`;

const out = path.join('public', 'sequences', name);
rmSync(out, {recursive: true, force: true});
for (const dir of ['desktop', 'mobile'])
  mkdirSync(path.join(out, dir), {recursive: true});

const common = [
  '-hide_banner',
  '-v',
  'error',
  '-y',
  '-ss',
  String(opts.start),
  '-t',
  String(length),
  '-i',
  input,
];
// Desktop: full frame, scaled to width.
execFileSync(ffmpeg, [
  ...common,
  '-vf',
  `${pre},scale=${opts.desktop}:-2`,
  '-frames:v',
  String(opts.frames),
  '-c:v',
  'libwebp',
  '-quality',
  String(opts.quality),
  path.join(out, 'desktop', '%03d.webp'),
]);
// Mobile: 9:16 centre crop, or the whole frame padded to 9:16.
execFileSync(ffmpeg, [
  ...common,
  '-vf',
  `${pre},${mobileFilter}`,
  '-frames:v',
  String(opts.frames),
  '-c:v',
  'libwebp',
  '-quality',
  String(opts.quality - 4),
  path.join(out, 'mobile', '%03d.webp'),
]);
// Poster: first frame, used before JavaScript and for reduced motion.
execFileSync(ffmpeg, [
  ...common,
  '-frames:v',
  '1',
  '-vf',
  `scale=${opts.desktop}:-2`,
  '-q:v',
  '4',
  path.join(out, 'poster.jpg'),
]);

const count = readdirSync(path.join(out, 'desktop')).length;
const size = (dir) =>
  readdirSync(path.join(out, dir)).reduce(
    (sum, f) => sum + statSync(path.join(out, dir, f)).size,
    0,
  );
const dims = (dir) => {
  try {
    execFileSync(
      ffmpeg,
      ['-hide_banner', '-i', path.join(out, dir, '001.webp')],
      {stdio: 'pipe'},
    );
  } catch (error) {
    const match = /, (\d+)x(\d+)/.exec(String(error.stderr));
    if (match) return {width: Number(match[1]), height: Number(match[2])};
  }
  return null;
};
const manifest = {
  name,
  count,
  desktop: dims('desktop'),
  mobile: dims('mobile'),
};
writeFileSync(
  path.join(out, 'manifest.json'),
  JSON.stringify(manifest, null, 2) + '\n',
);
console.log(manifest);
console.log(
  `desktop ${(size('desktop') / 1e6).toFixed(1)} MB, mobile ${(size('mobile') / 1e6).toFixed(1)} MB`,
);
/* eslint-enable no-console */
