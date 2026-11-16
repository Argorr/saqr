#!/usr/bin/env node
/* eslint-disable no-console -- command-line script */
/**
 * Turn a clip into a seamless looping web video (used for the turntable film).
 *
 *   FFMPEG=/path/to/ffmpeg node scripts/make-loop.mjs <video> <name> [options]
 *
 * The first and last frames of a generated clip rarely match, so the last
 * `--fade` seconds cross-fade into the first ones: the loop never jumps.
 *
 * Options:
 *   --crop w:h:x:y   crop the source first (e.g. to cut a watermark)
 *   --fade 0.6       cross-fade length in seconds
 *   --width 1280     desktop width (a 720-wide copy is made for phones)
 *   --crf 26         H.264 quality (lower = better and heavier)
 *
 * Writes public/videos/<name>-{1280,720}.mp4 and <name>-poster.jpg.
 */
import {execFileSync} from 'node:child_process';
import {statSync} from 'node:fs';
import path from 'node:path';

const [input, name, ...rest] = process.argv.slice(2);
if (!input || !name) {
  console.error(
    'Usage: node scripts/make-loop.mjs <video> <name> [--crop w:h:x:y] [--fade 0.6]',
  );
  process.exit(1);
}
const opts = {crop: '', fade: 0.6, width: 1280, crf: 26};
for (let i = 0; i < rest.length; i += 2) {
  const key = rest[i].replace(/^--/, '');
  if (!(key in opts)) throw new Error(`Unknown option --${key}`);
  opts[key] =
    typeof opts[key] === 'number' ? Number(rest[i + 1]) : rest[i + 1];
}
const ffmpeg = process.env.FFMPEG || 'ffmpeg';

// `ffmpeg -i` with no output exits with an error, but prints the stream info we need.
function probe(file) {
  try {
    execFileSync(ffmpeg, ['-hide_banner', '-i', file], {stdio: 'pipe'});
  } catch (error) {
    const text = String(error.stderr);
    const d = /Duration: (\d+):(\d+):([\d.]+)/.exec(text);
    const fps = /([\d.]+) fps/.exec(text);
    if (d && fps)
      return {
        duration: Number(d[1]) * 3600 + Number(d[2]) * 60 + Number(d[3]),
        fps: Number(fps[1]),
      };
  }
  throw new Error('Could not read the video duration');
}
const {duration, fps} = probe(input);
const fade = opts.fade;
const crop = opts.crop ? `crop=${opts.crop},` : '';
const out = (suffix) => path.join('public', 'videos', `${name}-${suffix}`);

function encode(width, file) {
  const filter = [
    `[0:v]${crop}scale=${width}:-2,setsar=1,fps=${fps},settb=AVTB,split[a][b]`,
    `[a]trim=start=${fade},setpts=PTS-STARTPTS[main]`,
    `[b]trim=end=${fade},setpts=PTS-STARTPTS[head]`,
    `[main][head]xfade=transition=fade:duration=${fade}:offset=${(duration - 2 * fade).toFixed(3)},format=yuv420p[v]`,
  ].join(';');
  execFileSync(ffmpeg, [
    ...['-hide_banner', '-v', 'error', '-y', '-i', input],
    ...['-filter_complex', filter, '-map', '[v]', '-an'],
    ...['-c:v', 'libx264', '-preset', 'slow', '-crf', String(opts.crf)],
    ...['-movflags', '+faststart', file],
  ]);
  console.log(`${file}: ${(statSync(file).size / 1e6).toFixed(2)} MB`);
}

encode(opts.width, out(`${opts.width}.mp4`));
encode(720, out('720.mp4'));
// Poster: the frame the loop starts on.
execFileSync(ffmpeg, [
  ...['-hide_banner', '-v', 'error', '-y', '-ss', String(fade), '-i', input],
  ...['-frames:v', '1', '-vf', `${crop}scale=${opts.width}:-2`, '-q:v', '4'],
  out('poster.jpg'),
]);
console.log(`${out('poster.jpg')}: done`);
/* eslint-enable no-console */
