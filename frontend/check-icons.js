const fs = require('fs');
const path = require('path');
const p = require('@phosphor-icons/react');

function findJSX(dir, fileList = []) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findJSX(fullPath, fileList);
    } else if (fullPath.endsWith('.jsx')) {
      fileList.push(fullPath);
    }
  });
  return fileList;
}

const files = findJSX('./src');
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const match = content.match(/import\s+{([^}]+)}\s+from\s+['\"]@phosphor-icons\/react['\"]/);
  if (match) {
    const icons = match[1].split(',').map(i => i.trim()).filter(i => i);
    icons.forEach(i => {
      if (!p[i]) {
        console.log('File:', f, 'MISSING:', i);
      }
    });
  }
});
