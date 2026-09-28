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
    <TableRow>
      <TableCell padding="checkbox">
        {/* Header checkbox could toggle all returnable */}
      </TableCell>
      <TableCell>#</TableCell>
      <TableCell>Item & Code</TableCell>
      <TableCell align="right">Purchased Qty</TableCell>
      <TableCell align="right">Already Returned</TableCell>
      <TableCell align="right">Returnable Qty</TableCell>
      <TableCell align="right">Rate</TableCell>
      <TableCell align="center" sx={{ width: 140 }}>Return Qty</TableCell>
      <TableCell align="right">Return Amount</TableCell>
    </TableRow>
  );

  return (
    <Card sx={{ mb: 3 }}>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Select Items to Return
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Check the items you wish to return to the supplier and specify return quantities.
        </Typography>
      </Box>

      <AppTable headContent={headContent} hidePagination={true}>
        {items.map((item, index) => {
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

              <TableCell>{index + 1}</TableCell>

              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {item.itemNameSnapshot}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.itemCodeSnapshot} • {item.unitSnapshot}
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

              <TableCell align="center">
                <TextField
                  type="number"
                  size="small"
                  disabled={disabled || !isSelected || isFullyReturned}
                  value={returnQty}
                  onChange={(e) => onQuantityChange(item.purchaseItemId, e.target.value, returnable)}
                  inputProps={{
                    min: 0.001,
                    max: returnable,
                    step: 'any',
                    style: { textAlign: 'center', padding: '6px 8px' },
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
