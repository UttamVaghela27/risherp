const fs = require('fs');
let c = fs.readFileSync('e:/erp/risherp-frontend/src/components/outstanding/OutstandingTable.jsx', 'utf8');
// Remove duplicate isCustomer line
c = c.replace(/const isCustomer = type === 'CUSTOMER';\s*const isCustomer = type === 'CUSTOMER';/, "const isCustomer = type === 'CUSTOMER';");
fs.writeFileSync('e:/erp/risherp-frontend/src/components/outstanding/OutstandingTable.jsx', c);
console.log('Done');
