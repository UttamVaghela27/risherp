import {
  Box, Card, TableRow, TableCell,
  Typography, Checkbox, TextField, Chip, alpha,
} from '@mui/material';
import AppTable from '../common/AppTable';

/**
 * ReturnableItemsTable
 *
 * Shows all original sale items with:
 *  - Original quantity
 *  - Already returned quantity
 *  - Remaining returnable quantity
 *  - Checkbox to select for return
 *  - Return quantity input (1 – returnableQty)
 *
 * Props:
 *   items              : ReturnableSaleItemResponse[]
 *   selectedItems      : { [saleItemId]: { selected, returnQty, error } }
 *   onToggle(saleItemId): toggle selection
 *   onQtyChange(saleItemId, qty): update return quantity
 */
const ReturnableItemsTable = ({ items = [], selectedItems = {}, onToggle, onQtyChange }) => {
  if (!items.length) return null;

  const headContent = (
    <TableRow sx={{ bgcolor: 'background.default' }}>
      <TableCell padding="checkbox" />
      <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Item</TableCell>
      <TableCell sx={{ fontWeight: 700, width: 80 }}>Code</TableCell>
      <TableCell align="right" sx={{ fontWeight: 700, width: 100 }}>Sold Qty</TableCell>
      <TableCell align="right" sx={{ fontWeight: 700, width: 110 }}>Returned</TableCell>
      <TableCell align="right" sx={{ fontWeight: 700, width: 110 }}>Returnable</TableCell>
      <TableCell align="right" sx={{ fontWeight: 700, width: 100 }}>Rate</TableCell>
      <TableCell align="right" sx={{ fontWeight: 700, width: 140 }}>Return Qty</TableCell>
      <TableCell align="right" sx={{ fontWeight: 700, width: 120 }}>Return Amt</TableCell>
    </TableRow>
  );

  return (
    <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden', mb: 2.5 }}>
      <Box sx={{ px: 2.5, py: 1.5, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Typography variant="subtitle2" fontWeight={700}>
          Step 3 — Select Items to Return
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Check items you want to return and enter return quantities. Only returnable quantities are allowed.
        </Typography>
      </Box>
      <AppTable headContent={headContent} hidePagination={true}>
        {items.map((item) => {
          const sel = selectedItems[item.saleItemId] || { selected: false, returnQty: '', error: '' };
          const isFullyReturned = item.fullyReturned;
          const returnableNum = Number(item.returnableQuantity || 0);

          // Calculate preview return amount
          let returnAmt = 0;
          if (sel.selected && sel.returnQty && !isNaN(Number(sel.returnQty))) {
            const qty = Number(sel.returnQty);
            const origQty = Number(item.originalQuantity);
            const lineTotal = Number(item.lineTotal);
            if (origQty > 0) {
              returnAmt = (qty / origQty) * lineTotal;
            }
          }

          return (
            <TableRow
              key={item.saleItemId}
              sx={{
                opacity: isFullyReturned ? 0.5 : 1,
                bgcolor: sel.selected ? 'action.selected' : 'inherit',
                '&:hover': { bgcolor: isFullyReturned ? undefined : 'action.hover' },
              }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  size="small"
                  checked={sel.selected}
                  disabled={isFullyReturned}
                  onChange={() => !isFullyReturned && onToggle(item.saleItemId)}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>{item.itemNameSnapshot}</Typography>
                <Typography variant="caption" color="text.secondary">{item.unitSnapshot}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>
                  {item.itemCodeSnapshot}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">{Number(item.originalQuantity).toFixed(3)}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" color={Number(item.alreadyReturnedQuantity) > 0 ? 'warning.main' : 'text.secondary'}>
                  {Number(item.alreadyReturnedQuantity).toFixed(3)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                {isFullyReturned ? (
                  <Chip size="small" label="Fully Returned" color="default" variant="outlined" sx={{ fontSize: '0.68rem' }} />
                ) : (
                  <Typography variant="body2" fontWeight={700} color="success.dark">
                    {returnableNum.toFixed(3)}
                  </Typography>
                )}
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">
                  ₹ {item.originalQuantity > 0 ? Number(item.lineTotal / item.originalQuantity).toFixed(2) : Number(item.rate || 0).toFixed(2)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                {sel.selected ? (
                  <TextField
                    size="small"
                    type="text"
                    value={sel.returnQty}
                    onChange={(e) => onQtyChange(item.saleItemId, e.target.value)}
                    inputProps={{ inputMode: 'decimal',  min: 0.001, max: returnableNum, step: 0.001 }}
                    error={!!sel.error}
                    helperText={sel.error}
                    sx={{ width: 110 }}
                  />
                ) : (
                  <Typography variant="body2" color="text.disabled">—</Typography>
                )}
              </TableCell>
              <TableCell align="right">
                {sel.selected && returnAmt > 0 ? (
                  <Typography variant="body2" fontWeight={700} color="primary.main">
                    ₹ {returnAmt.toFixed(2)}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.disabled">—</Typography>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </AppTable>
    </Card>
  );
};

export default ReturnableItemsTable;
