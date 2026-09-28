const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

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

const files = walk(srcDir);
let fixedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // 1. Fix JSX unquoted attributes: prop=theme.palette.x -> prop={theme.palette.x}
  content = content.replace(/([a-zA-Z0-9_]+)=theme\.palette\.([a-zA-Z0-9_.]+)/g, '$1={theme.palette.$2}');
  
  // 2. Fix JSX unquoted attributes for alpha: prop=alpha(theme.palette.x, y) -> prop={alpha(theme.palette.x, y)}
  // This might have commas and spaces inside the alpha call.
  content = content.replace(/([a-zA-Z0-9_]+)=alpha\(([^)]+)\)/g, '$1={alpha($2)}');
  
  // 3. Fix missing commas in imports
  // E.g., 
  //   Alert
  //   useTheme
  // } from '@mui/material';
  // Note: Since I blindly appended `  useTheme\n} from ...`, the previous line might not have a comma.
  content = content.replace(/([a-zA-Z0-9_]+)\s*\n\s*useTheme\n\} from '@mui\/material';/g, '$1,\n  useTheme\n} from \'@mui/material\';');
  content = content.replace(/([a-zA-Z0-9_]+)\s*\n\s*alpha\n\} from '@mui\/material';/g, '$1,\n  alpha\n} from \'@mui/material\';');
  
  // Also handle cases where both were appended:
  //   Alert
  //   useTheme
  //   alpha
  // }
  content = content.replace(/([a-zA-Z0-9_]+)\s*\n\s*useTheme,\n\s*alpha/g, '$1,\n  useTheme,\n  alpha');
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`Fixed: ${file.replace(srcDir, '')}`);
    fixedFiles++;
  }
});

console.log(`Total files fixed: ${fixedFiles}`);
