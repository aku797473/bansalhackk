import p from '@phosphor-icons/react';
import fs from 'fs';
const content = fs.readFileSync('src/pages/SOS.jsx', 'utf8');
const match = content.match(/import\s+{([^}]+)}\s+from\s+['"]@phosphor-icons\/react['"]/);
if (match) {
  match[1].split(',').map(i => i.trim()).filter(Boolean).forEach(i => {
    if (!p[i]) console.log('MISSING:', i);
  });
}
