import {
  TableRow, TableCell,
  Checkbox, TextField, Typography, Chip, Box, Card,
} from '@mui/material';
import AppTable from '../common/AppTable';
import { formatCurrency, formatQuantity } from '../../utils/formatters';

export default function ReturnablePurchaseItemsTable({
  items = [],
  selectedItems = {},
  onToggleItem,
  onQuantityChange,
  disabled = false,
}) {
  const headContent = (
    <TableRow sx={{ bgcolor: 'background.default' }}>
      <TableCell padding="checkbox" />
      <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Item</TableCell>
      <TableCell sx={{ fontWeight: 700, width: 80 }}>Code</TableCell>
      <TableCell align="right" sx={{ fontWeight: 700, width: 100 }}>Purchased Qty</TableCell>
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
          const isSelected = !!selectedItems[item.purchaseItemId];
          const returnQty = selectedItems[item.purchaseItemId]?.returnQuantity || '';
          const returnable = Number(item.returnableQuantity || 0);
          const isFullyReturned = item.fullyReturned || returnable <= 0;

          // Estimated line total = returnQty * effectiveRate
          const numQty = parseFloat(returnQty) || 0;
          const effectiveRate = item.originalQuantity > 0 ? (item.lineTotal / item.originalQuantity) : item.rate;
          const estimatedLineTotal = isSelected ? (numQty * effectiveRate) : 0;

          return (
            <TableRow
              key={item.purchaseItemId}
              hover
              selected={isSelected}
              sx={{
                opacity: isFullyReturned ? 0.6 : 1,
                backgroundColor: isFullyReturned ? 'action.hover' : 'inherit',
              }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  checked={isSelected}
                  disabled={disabled || isFullyReturned}
                  onChange={(e) => onToggleItem(item, e.target.checked)}
                  color="primary"
                />
              </TableCell>

              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {item.itemNameSnapshot}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.unitSnapshot}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="caption" color="primary.main" fontWeight={600}>
                  {item.itemCodeSnapshot || '—'}
                </Typography>
              </TableCell>

              <TableCell align="right">
                {formatQuantity(item.originalQuantity)} {item.unitSnapshot}
              </TableCell>

              <TableCell align="right">
                {formatQuantity(item.alreadyReturnedQuantity || 0)} {item.unitSnapshot}
              </TableCell>

              <TableCell align="right">
                {isFullyReturned ? (
                  <Chip label="Fully Returned" size="small" color="default" variant="outlined" />
                ) : (
                  <Chip
                    label={`${formatQuantity(returnable)} ${item.unitSnapshot}`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
              </TableCell>

              <TableCell align="right">
                {formatCurrency(item.rate)}
              </TableCell>

              <TableCell align="right">
                <TextField
                  type="text"
                  size="small"
                  disabled={disabled || !isSelected || isFullyReturned}
                  value={returnQty}
                  onChange={(e) => onQuantityChange(item.purchaseItemId, e.target.value, returnable)}
                  inputProps={{ inputMode: 'decimal', 
                    min: 0.001,
                    max: returnable,
                    step: 'any',
                    style: { textAlign: 'right', padding: '6px 8px' },
                  }}
                  error={
                    isSelected &&
                    (numQty <= 0 || numQty > returnable)
                  }
                  helperText={
                    isSelected && numQty > returnable
                      ? `Max: ${returnable}`
                      : isSelected && numQty <= 0
                      ? 'Min: 0.001'
                      : ''
                  }
                  sx={{ width: 110 }}
                />
              </TableCell>

              <TableCell align="right">
                <Typography variant="body2" fontWeight={600} color={isSelected ? 'primary.main' : 'text.disabled'}>
                  {formatCurrency(estimatedLineTotal)}
                </Typography>
              </TableCell>
            </TableRow>
          );
        })}

        {items.length === 0 && (
          <TableRow>
            <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
              <Typography color="text.secondary">No items found for this purchase.</Typography>
            </TableCell>
          </TableRow>
        )}
      </AppTable>
    </Card>
  );
}
