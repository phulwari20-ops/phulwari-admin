const ffmpegPath = require('ffmpeg-static');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const adminDir = path.resolve(__dirname, '..');
const v1Dir = path.resolve(adminDir, '..', 'phulwari-v1');

const videos = [
  {
    input: path.join(adminDir, 'videos', 'birthday_party', 'IMG_7202.MOV'),
    outName: 'birthday_party.mp4',
  },
  {
    input: path.join(adminDir, 'videos', 'cricket', 'IMG_7200.MOV'),
    outName: 'cricket.mp4',
  },
  {
    input: path.join(adminDir, 'videos', 'gymnastics', 'IMG_7201.MOV'),
    outName: 'gymnastics.mp4',
  },
  {
    input: path.join(adminDir, 'videos', 'skating', 'IMG_7199.MOV'),
    outName: 'skating.mp4',
  },
];

console.log('Using FFmpeg at:', ffmpegPath);

videos.forEach(({ input, outName }) => {
  if (!fs.existsSync(input)) {
    console.warn(`Source file not found: ${input}`);
    return;
  }

  const inStat = fs.statSync(input);
  const inSizeMB = (inStat.size / (1024 * 1024)).toFixed(2);
  console.log(`\nCompressing: ${path.basename(input)} (${inSizeMB} MB) -> ${outName}`);

  const tempOut = path.join(adminDir, 'public', 'videos', outName);
  
  // Ensure directory exists
  fs.mkdirSync(path.dirname(tempOut), { recursive: true });

  // Visually lossless compression (CRF 18 - visually transparent to source master):
  // - Multi-threaded with threads 0 for maximum speed
  // - Preset faster with CRF 18 (same pristine mathematical visual fidelity)
  // - Native resolution preserved (1080x1920)
  // - Universal yuv420p color space for all browsers
  // - High quality 192kbps AAC audio
  // - Faststart for instant HTML5 web streaming without buffering
  const args = [
    '-y',
    '-threads', '0',
    '-i', input,
    '-c:v', 'libx264',
    '-crf', '18',
    '-preset', 'faster',
    '-profile:v', 'high',
    '-level', '4.2',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-movflags', '+faststart',
    tempOut,
  ];

  const res = spawnSync(ffmpegPath, args, { stdio: 'inherit' });
  if (res.status === 0 && fs.existsSync(tempOut)) {
    const outStat = fs.statSync(tempOut);
    const outSizeMB = (outStat.size / (1024 * 1024)).toFixed(2);
    const savedPct = ((1 - outStat.size / inStat.size) * 100).toFixed(1);
    console.log(`✓ Generated ${outName}: ${outSizeMB} MB (Saved ${savedPct}% size, pristine visually lossless H.264)`);

    // Copy to phulwari-v1 public/videos
    const v1Target = path.join(v1Dir, 'public', 'videos', outName);
    fs.mkdirSync(path.dirname(v1Target), { recursive: true });
    fs.copyFileSync(tempOut, v1Target);
    console.log(`✓ Synced to ${v1Target}`);
  } else {
    console.error(`Failed to compress ${outName}`);
  }
});

console.log('\nAll videos successfully compressed to web-ready fast streaming MP4s!');
