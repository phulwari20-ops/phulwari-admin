const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, 'public', 'Logo-png.png');
const dest = path.resolve(__dirname, '..', 'phulwari-nextjs-v1', 'public', 'Logo-png.png');

console.log('Copying from:', src);
console.log('Copying to:', dest);

try {
  fs.copyFileSync(src, dest);
  console.log('✅ Logo copied successfully!');
} catch (err) {
  console.error('❌ Failed to copy logo:', err.message);
}
