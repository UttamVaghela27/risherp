const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const skipFiles = [
  'PrintView.jsx',
  'theme.js'
];

const colorMap = {
  '#0f172a': 'theme.palette.text.primary',
  '#1e293b': 'theme.palette.text.primary',
  '#334155': 'theme.palette.text.secondary',
  '#475569': 'theme.palette.text.secondary',
  '#64748b': 'theme.palette.text.secondary',
  '#94a3b8': 'theme.palette.text.secondary',
  '#cbd5e1': 'theme.palette.divider',
  '#e2e8f0': 'theme.palette.divider',
  '#f1f5f9': 'theme.palette.background.default',
  '#f8fafc': 'theme.palette.background.default',
  '#ffffff': 'theme.palette.background.paper',
  '#fff': 'theme.palette.background.paper',
  
  '#ecfdf5': 'alpha(theme.palette.success.main, 0.1)',
  '#d1fae5': 'alpha(theme.palette.success.main, 0.1)',
  '#a7f3d0': 'alpha(theme.palette.success.main, 0.2)',
  '#10b981': 'theme.palette.success.main',
  '#059669': 'theme.palette.success.main',
  
  '#fef2f2': 'alpha(theme.palette.error.main, 0.1)',
  '#fee2e2': 'alpha(theme.palette.error.main, 0.1)',
  '#fecaca': 'alpha(theme.palette.error.main, 0.2)',
  '#ef4444': 'theme.palette.error.main',
  '#dc2626': 'theme.palette.error.main',
  '#b91c1c': 'theme.palette.error.dark',
  
  '#fef3c7': 'alpha(theme.palette.warning.main, 0.1)',
  '#fffbeb': 'alpha(theme.palette.warning.main, 0.05)',
  '#fde68a': 'alpha(theme.palette.warning.main, 0.2)',
  '#f59e0b': 'theme.palette.warning.main',
  '#d97706': 'theme.palette.warning.main',
  '#b45309': 'theme.palette.warning.dark',
  '#92400e': 'theme.palette.warning.dark',
  
  '#eff6ff': 'alpha(theme.palette.info.main, 0.1)',
  '#e0e7ff': 'alpha(theme.palette.info.main, 0.15)',
  '#dbeafe': 'alpha(theme.palette.info.main, 0.1)',
  '#bfdbfe': 'alpha(theme.palette.info.main, 0.2)',
  '#3b82f6': 'theme.palette.info.main',
  '#2563eb': 'theme.palette.info.main',
  '#1d4ed8': 'theme.palette.info.dark',
  '#1e40af': 'theme.palette.info.dark',
  '#1e3a8a': 'theme.palette.info.dark',
  
  'rgba(124, 58, 237, 0.1)': 'alpha(theme.palette.secondary.main, 0.1)',
  '#7c3aed': 'theme.palette.secondary.main',
  '#ddd6fe': 'alpha(theme.palette.secondary.main, 0.2)',
  
  'rgba(30, 58, 138, 0.1)': 'alpha(theme.palette.primary.main, 0.1)',
  'rgba(16, 185, 129, 0.1)': 'alpha(theme.palette.success.main, 0.1)',
  'rgba(245, 158, 11, 0.1)': 'alpha(theme.palette.warning.main, 0.1)',
  'rgba(71, 85, 105, 0.1)': 'alpha(theme.palette.text.secondary, 0.1)'
};

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      if (!skipFiles.some(skip => file.includes(skip))) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(srcDir);

let totalReplaced = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  let hasChanges = false;
  
  for (const [hex, replacement] of Object.entries(colorMap)) {
    // 1. Replace standalone string literals in objects: key: '#hex' -> key: theme.palette...
    // Also handles 'rgba(...)' 
    const isRgba = hex.startsWith('rgba');
    const escapedHex = hex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex chars
    
    // Pattern for strict exact match strings: e.g. color: '#ffffff'
    const exactStringRegex = new RegExp(`(['"\`])${escapedHex}\\1`, 'gi');
    if (exactStringRegex.test(content)) {
      content = content.replace(exactStringRegex, (match) => {
        // Just return the replacement (without quotes)
        // Wait, if it's in a template literal like `border: '1px solid ${isActive ? '#hex' : ...}'`
        // the quotes ARE matched here. Replacing with `replacement` gives:
        // `border: '1px solid ${isActive ? theme.palette... : ...}'`
        // which is perfect.
        return replacement; 
      });
      hasChanges = true;
    }
    
    // 2. Replace embedded hex colors in strings that are NOT exact matches, like '1px solid #e2e8f0'
    // To handle this, we need to turn '1px solid #e2e8f0' into \`1px solid \${theme.palette.divider}\`
    // This is much trickier with regex and prone to syntax errors.
    // For now, let's ONLY do exact matches. I will manually fix complex strings.
  }
  
  if (hasChanges) {
    let needsUseTheme = content.includes('theme.palette');
    let needsAlpha = content.includes('alpha(');
    
    // Add imports if they don't exist
    if (needsUseTheme && !content.includes('useTheme')) {
       // Find MUI import
       content = content.replace(/} from '@mui\/material';/, '  useTheme\n} from \'@mui/material\';');
    }
    if (needsAlpha && !content.includes('alpha')) {
       content = content.replace(/} from '@mui\/material';/, '  alpha\n} from \'@mui/material\';');
    }
    
    // Add const theme = useTheme(); inside component if not there
    if (needsUseTheme && !content.includes('const theme = useTheme()')) {
        // Find the first line after a component declaration
        // e.g. const MyComponent = () => {
        content = content.replace(/(const [A-Z][a-zA-Z0-9_]* = \([^)]*\) => {)/, '$1\n  const theme = useTheme();');
        content = content.replace(/(export default function [A-Z][a-zA-Z0-9_]*\([^)]*\) {)/, '$1\n  const theme = useTheme();');
    }

    fs.writeFileSync(file, content);
    console.log(`Modified: ${file.replace(srcDir, '')}`);
    totalReplaced++;
  }
});

console.log(`Total files modified: ${totalReplaced}`);
