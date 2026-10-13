import { useState } from 'react';
import {
  TableRow, TableCell, TextField, Select, MenuItem, IconButton,
  Typography, Box, Tooltip, InputAdornment, Chip,
  useTheme,
  alpha
} from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { calculateLineTotal, formatCurrency } from '../../utils/saleCalculations';

/**
 * SalesCartRow — one editable row in the billing cart table.
 * Supports inline editing of quantity, rate, discount type, and discount value.
 * Shows live line total and stock warning.
 */
const SalesCartRow = ({ item, index, onUpdate, onRemove }) => {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const { lineSubtotal, discountAmount, lineTotal } = calculateLineTotal(item);

  const availableStock = parseFloat(item.availableStock) || 0;
  const currentQty = parseFloat(item.quantity) || 0;
  const stockWarning = currentQty > availableStock;

  const handleChange = (field, value) => {
    onUpdate(item.cartId, { [field]: value });
  };

  const handleStep = (delta) => {
    const next = Math.max(0.001, (parseFloat(item.quantity) || 0) + delta);
    handleChange('quantity', next.toString());
  };

  return (
    <TableRow
      sx={{
        '&:hover': { bgcolor: 'background.default' },
        bgcolor: focused ? alpha(theme.palette.info.main, 0.1) : 'transparent',
        borderLeft: stockWarning ? '3px solid #ef4444' : '3px solid transparent',
        transition: 'background-color 0.15s ease',
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {/* # */}
      <TableCell sx={{ width: 36, color: theme.palette.text.secondary, fontWeight: 700, fontSize: 12 }}>
        {index + 1}
      </TableCell>

      {/* Item Name + Code */}
      <TableCell sx={{ minWidth: 180 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" fontWeight={700} color={theme.palette.text.primary} noWrap sx={{ maxWidth: 220 }}>
            {item.itemName}
          </Typography>
          {item.itemCode && (
            <Chip
              label={item.itemCode}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.65rem',
                fontWeight: 700,
                fontFamily: 'monospace',
                bgcolor: 'background.default',
                color: theme.palette.text.secondary,
                borderRadius: '4px',
              }}
            />
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
          Unit: <strong>{item.unit}</strong>
        </Typography>
        {stockWarning && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
            <WarningAmberIcon sx={{ fontSize: 13, color: 'error.main' }} />
            <Typography variant="caption" color="error.main" fontWeight={700}>
              Only {availableStock} {item.unit} in stock
            </Typography>
          </Box>
        )}
      </TableCell>

      {/* Quantity with Quick Stepper */}
      <TableCell sx={{ width: 120 }}>
        <Box sx={{
          display: 'inline-flex',
          alignItems: 'center',
          border: stockWarning ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
          borderRadius: '8px',
          bgcolor: 'background.paper',
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}>
          <IconButton
            size="small"
            onClick={() => handleStep(-1)}
            disabled={currentQty <= 1}
            sx={{ p: 0.5, borderRadius: 0, '&:hover': { bgcolor: 'background.default' } }}
            tabIndex={-1}
          >
            <RemoveIcon sx={{ fontSize: 13, color: currentQty <= 1 ? theme.palette.divider : theme.palette.text.secondary }} />
          </IconButton>
          <TextField
            size="small"
            type="text"
            value={item.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
            slotProps={{
              htmlInput: { inputMode: 'decimal', min: 0.001,
                step: 0.001,
                style: {
                  textAlign: 'center',
                  padding: '4px 2px',
                  width: 46,
                  fontWeight: 700,
                  fontSize: 13,
                  fontFamily: 'monospace'
                }
              }
            }}
            sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
          />
          <IconButton
            size="small"
            onClick={() => handleStep(1)}
            sx={{ p: 0.5, borderRadius: 0, '&:hover': { bgcolor: 'background.default' } }}
            tabIndex={-1}
          >
            <AddIcon sx={{ fontSize: 13, color: theme.palette.text.secondary }} />
          </IconButton>
        </Box>
      </TableCell>

      {/* Rate */}
      <TableCell sx={{ width: 110 }}>
        <TextField
          size="small"
          type="text"
          value={item.rate}
          onChange={(e) => handleChange('rate', e.target.value)}
          slotProps={{
            htmlInput: { inputMode: 'decimal', min: 0, step: 0.01, style: { textAlign: 'right', padding: '5px 8px', fontWeight: 600, fontFamily: 'monospace' } },
            input: {
              startAdornment: <InputAdornment position="start" sx={{ mr: 0.2, '& p': { fontSize: 12 } }}>₹</InputAdornment>
            }
          }}
          sx={{ width: 100, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
        />
      </TableCell>

      {/* Discount Type + Value */}
      <TableCell sx={{ width: 180 }}>
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <Select
            size="small"
            value={item.discountType || 'AMOUNT'}
            onChange={(e) => handleChange('discountType', e.target.value)}
            sx={{ width: 68, fontSize: 12, fontWeight: 700, borderRadius: '8px', '& .MuiSelect-select': { py: '5px', px: 1 } }}
          >
            <MenuItem value="AMOUNT" sx={{ fontSize: 12, fontWeight: 600 }}>₹ Flat</MenuItem>
            <MenuItem value="PERCENTAGE" sx={{ fontSize: 12, fontWeight: 600 }}>% Pct</MenuItem>
          </Select>
          <TextField
            size="small"
            type="text"
            value={item.discountValue}
            onChange={(e) => handleChange('discountValue', e.target.value)}
            slotProps={{
              htmlInput: { inputMode: 'decimal', min: 0, step: 0.01, style: { textAlign: 'right', padding: '5px 8px', fontWeight: 600, fontFamily: 'monospace' } }
            }}
            sx={{ width: 85, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          />
        </Box>
        {discountAmount > 0 && (
          <Typography variant="caption" color="success.main" sx={{ mt: 0.3, display: 'block', fontWeight: 600 }}>
            -{formatCurrency(discountAmount)}
          </Typography>
        )}
      </TableCell>

      {/* Line Total */}
      <TableCell sx={{ width: 120, textAlign: 'right' }}>
        <Typography variant="body2" fontWeight={800} sx={{ fontFamily: 'monospace', fontSize: 14 }} color={lineTotal < lineSubtotal ? theme.palette.success.main : theme.palette.text.primary}>
          {formatCurrency(lineTotal)}
        </Typography>
        {discountAmount > 0 && (
          <Typography variant="caption" color="text.disabled" sx={{ textDecoration: 'line-through', fontFamily: 'monospace' }}>
            {formatCurrency(lineSubtotal)}
          </Typography>
        )}
      </TableCell>

      {/* Delete */}
      <TableCell sx={{ width: 44, textAlign: 'center' }}>
        <Tooltip title="Remove item">
          <IconButton size="small" onClick={() => onRemove(item.cartId)} color="error" tabIndex={-1} sx={{ '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) } }}>
            <DeleteOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default SalesCartRow;
