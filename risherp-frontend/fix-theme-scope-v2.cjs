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

const files = walk('e:/erp/risherp-frontend/src');
let count = 0;

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  let original = c;
  
  // A simple AST-like parser to find function declarations and verify `theme` scope.
  // Instead, let's use a regex that matches `const Component = (props) => {` 
  // and injects `const theme = useTheme();` into the component if `theme.` is anywhere in the file.
  // Wait, if we inject it into EVERY component in a file that uses `theme.`, it's perfectly safe!
  // It might create an unused `const theme = useTheme()` but eslint can ignore it or we don't care.
  // Let's match all components:
  // `const [A-Z]\w* = \(.*?\) => \{`
  
  const componentRegex = /((?:export\s+)?const\s+[A-Z][a-zA-Z0-9_]*\s*=\s*\([^)]*\)\s*=>\s*\{)/g;
  
  // Does the file use `theme.`?
  if (c.includes('theme.')) {
    c = c.replace(componentRegex, (match, p1) => {
      // Find what immediately follows this match to check if useTheme is already there
      const index = c.indexOf(p1) + p1.length;
      const nextText = c.substring(index, index + 50);
      if (!nextText.includes('useTheme()')) {
        return p1 + '\n  const theme = useTheme();';
      }
      return match;
    });
  }
  
  // Standard functions
  const funcRegex = /((?:export\s+)?function\s+[A-Z][a-zA-Z0-9_]*\s*\([^)]*\)\s*\{)/g;
  if (c.includes('theme.')) {
    c = c.replace(funcRegex, (match, p1) => {
      const index = c.indexOf(p1) + p1.length;
      const nextText = c.substring(index, index + 50);
      if (!nextText.includes('useTheme()')) {
        return p1 + '\n  const theme = useTheme();';
      }
      return match;
    });
  }

  if (c !== original) {
    fs.writeFileSync(f, c);
    console.log('Injected useTheme into:', f);
    count++;
  }
});

console.log('Total fixed:', count);
