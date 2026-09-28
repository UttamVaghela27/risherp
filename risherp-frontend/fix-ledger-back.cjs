const fs = require('fs');
let c = fs.readFileSync('e:/erp/risherp-frontend/src/pages/ledger/LedgerPage.jsx', 'utf8');

// Add useLocation to imports if not already there
if (!c.includes('useLocation')) {
  c = c.replace("import { useNavigate } from 'react-router-dom';", "import { useNavigate, useLocation } from 'react-router-dom';");
}

// Add useLocation hook if not already there
if (!c.includes('const location = useLocation()')) {
  c = c.replace('const navigate = useNavigate();', 'const navigate = useNavigate();\n  const location = useLocation();');
}

// Pass from state when navigating
c = c.replace(
  "navigate(`/ledger/customer/${party.id}`)",
  "navigate(`/ledger/customer/${party.id}`, { state: { from: location.pathname } })"
);
c = c.replace(
  "navigate(`/ledger/supplier/${party.id}`)",
  "navigate(`/ledger/supplier/${party.id}`, { state: { from: location.pathname } })"
);

fs.writeFileSync('e:/erp/risherp-frontend/src/pages/ledger/LedgerPage.jsx', c);
console.log('Done');
