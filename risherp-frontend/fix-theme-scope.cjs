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
const files = walk('e:/erp/risherp-frontend/src');

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  let original = c;
  
  // Find all arrow functions that look like components: const Name = (...) => {
  // We need to inject `const theme = useTheme();` right after `{` if it uses `theme.` but doesn't have it.
  
  // Regex to match: const Component = (props) => {
  // This is a naive but effective regex for React components.
  const regex = /(const\s+[A-Z][a-zA-Z0-9_]*\s*=\s*\([^)]*\)\s*=>\s*\{)([^}]*)/g;
  
  c = c.replace(regex, (match, p1, p2) => {
    // If the component body uses `theme.` but doesn't declare `useTheme()`
    if (p2.includes('theme.') && !p2.includes('useTheme(')) {
      return p1 + '\n  const theme = useTheme();' + p2;
    }
    return match;
  });
  
  // Also handle function Component(props) {
  const regexFunc = /(function\s+[A-Z][a-zA-Z0-9_]*\s*\([^)]*\)\s*\{)([^}]*)/g;
  c = c.replace(regexFunc, (match, p1, p2) => {
    if (p2.includes('theme.') && !p2.includes('useTheme(')) {
      return p1 + '\n  const theme = useTheme();' + p2;
    }
    return match;
  });

  if (c !== original) {
    fs.writeFileSync(f, c);
    console.log('Fixed missing theme in:', f);
    count++;
  }
});

console.log('Total files fixed:', count);
