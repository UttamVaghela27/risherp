const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

let count = 0;
walk('e:/erp/risherp-frontend/src').forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  if (c.includes('alpha(')) {
    const original = c;
    c = c.replace(/(import\s+\{[^}]*)(\}\s*from\s+['"]@mui\/material['"])/, (match, p1, p2) => {
      if (!p1.match(/\balpha\b/)) {
        // clean up commas if we blindly append
        let inner = p1.trim();
        if (inner.endsWith(',')) inner = inner.slice(0, -1);
        return inner + ',\n  alpha\n' + p2;
      }
      return match;
    });
    
    // Check if alpha import exists anywhere else if the regex missed it
    if (c !== original) {
      fs.writeFileSync(f, c);
      console.log('Added alpha to:', f);
      count++;
    }
  }
});

console.log('Fixed files:', count);
