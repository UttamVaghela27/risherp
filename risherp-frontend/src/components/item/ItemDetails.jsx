import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Tabs,
  Tab,
  Button,
  Stack,
  Chip,
  Divider,
  Alert,
  Paper,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import HistoryEduOutlinedIcon from '@mui/icons-material/HistoryEduOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

import StatusChip from '../common/StatusChip';
import CurrencyDisplay from '../common/CurrencyDisplay';
import DateDisplay from '../common/DateDisplay';
import ConfirmDialog from '../common/ConfirmDialog';

/**
 * ItemDetails Component
 * Complete product profile overview, inventory status, valuation,
 * and future module tab placeholders.
 */
const ItemDetails = ({
  item,
  onEdit,
  onToggleStatus,
  onBack,
  statusUpdating = false,
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!item) return null;

  const isActive = item.status === 'ACTIVE';
  const currentStockVal = item.currentStock != null ? Number(item.currentStock) : 0;
  const minStockVal = item.minimumStock != null ? Number(item.minimumStock) : 0;
  const pRate = item.purchaseRate != null ? Number(item.purchaseRate) : 0;
  const sRate = item.saleRate != null ? Number(item.saleRate) : 0;
  const marginAmt = sRate - pRate;
  const marginPct = sRate > 0 ? ((marginAmt / sRate) * 100).toFixed(1) : 0;

  const handleStatusClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmStatus = () => {
    setConfirmOpen(false);
    onToggleStatus && onToggleStatus(item);
  };

  return (
    <Box>
      {/* Top Action Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<ArrowBackOutlinedIcon />}
          onClick={onBack}
          sx={{ borderRadius: 1.5, borderColor: 'divider' }}
        >
          Back to Items
        </Button>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            color={isActive ? 'error' : 'success'}
            startIcon={isActive ? <BlockOutlinedIcon /> : <CheckCircleOutlineOutlinedIcon />}
            onClick={handleStatusClick}
            disabled={statusUpdating}
            sx={{ borderRadius: 1.5 }}
          >
            {isActive ? 'Deactivate Item' : 'Activate Item'}
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<EditOutlinedIcon />}
            onClick={() => onEdit && onEdit(item)}
            sx={{ borderRadius: 1.5, px: 2.5 }}
          >
            Edit Item
          </Button>
        </Stack>
      </Box>

      {/* Header Profile Card */}
      <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2.5, mb: 3, p: { xs: 2.5, sm: 3.5 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2.5,
          }}
        >
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h4" fontWeight={800} color="text.primary">
                {item.itemName}
              </Typography>

              <Typography
                variant="subtitle2"
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  bgcolor: 'background.default',
                  color: 'primary.main',
                  px: 1.2,
                  py: 0.3,
                  borderRadius: 1.5,
                  border: '1px solid #cbd5e1',
                }}
              >
                {item.itemCode}
              </Typography>

              <StatusChip status={item.stockStatus} />
              <StatusChip status={item.status} />
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
              {item.categoryName && (
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CategoryOutlinedIcon sx={{ fontSize: 16 }} /> Category: <strong>{item.categoryName}</strong>
                </Typography>
              )}

              {item.companyName && (
                <Typography variant="body2" color="text.secondary">
                  Brand: <strong>{item.companyName}</strong>
                </Typography>
              )}

              {item.barcode && (
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <QrCode2OutlinedIcon sx={{ fontSize: 16 }} /> Barcode: <strong style={{ fontFamily: 'monospace' }}>{item.barcode}</strong>
                </Typography>
              )}
            </Stack>
          </Box>

          {/* Quick Stock & Valuation Card */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'background.default',
              border: 1, borderColor: 'divider',
              minWidth: 220,
              textAlign: { xs: 'left', md: 'right' },
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
              Current Stock Level
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <Typography
                variant="h5"
                fontWeight={800}
                color={
                  currentStockVal <= 0
                    ? 'error.main'
                    : currentStockVal <= minStockVal
                    ? 'warning.dark'
                    : 'text.primary'
                }
              >
                {item.currentStock} {item.unit}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Valuation: <strong>₹ {(currentStockVal * pRate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </Typography>
          </Paper>
        </Box>
      </Card>

      {/* KPI Cards Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
              Purchase Rate (Cost)
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <CurrencyDisplay amount={item.purchaseRate} variant="h6" fontWeight={800} />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Per {item.unit}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
              Sale Rate (Price)
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <CurrencyDisplay amount={item.saleRate} variant="h6" fontWeight={800} color="primary.main" />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Per {item.unit}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
              Gross Margin
            </Typography>
            <Typography
              variant="h6"
              fontWeight={800}
              color={marginAmt >= 0 ? 'success.dark' : 'error.dark'}
              sx={{ mt: 0.5 }}
            >
              {marginPct}% (₹ {marginAmt.toFixed(2)})
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Profitability per unit
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
              Minimum Safety Stock
            </Typography>
            <Typography variant="h6" fontWeight={800} sx={{ mt: 0.5 }}>
              {item.minimumStock} {item.unit}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Alert threshold
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Detail Tabs */}
      <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2.5, mb: 4 }}>
        <Tabs
          value={currentTab}
          onChange={(e, val) => setCurrentTab(val)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Product Details" />
          <Tab label="Inventory & Alerts" />
          <Tab label="Stock Movement (Phase 12)" />
          <Tab label="Sales History (Phase 7)" />
          <Tab label="Purchase History (Phase 9)" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {currentTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Item Name
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                  {item.itemName}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  System Code
                </Typography>
                <Typography variant="body1" fontFamily="monospace" fontWeight={600} sx={{ mt: 0.5 }}>
                  {item.itemCode}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Category
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {item.categoryName || 'None'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Brand / Manufacturer
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {item.companyName || 'None'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Barcode / SKU
                </Typography>
                <Typography variant="body1" fontFamily="monospace" sx={{ mt: 0.5 }}>
                  {item.barcode || 'No barcode registered'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Unit of Measurement
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {item.unit}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Description / Notes
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>
                  {item.description || 'No description provided.'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Cataloged Date
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <DateDisplay value={item.createdAt} format="DATETIME" />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Last Updated
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <DateDisplay value={item.updatedAt} format="DATETIME" />
                </Box>
              </Grid>
            </Grid>
          )}

          {currentTab === 1 && (
            <Stack spacing={2.5}>
              <Alert severity={currentStockVal <= 0 ? 'error' : currentStockVal <= minStockVal ? 'warning' : 'info'}>
                Stock Status: <strong>{item.stockStatus}</strong>. Current level is {item.currentStock} {item.unit}, against a safety threshold of {item.minimumStock} {item.unit}.
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default', border: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      CURRENT ON-HAND STOCK
                    </Typography>
                    <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
                      {item.currentStock} {item.unit}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default', border: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      MINIMUM REORDER LEVEL
                    </Typography>
                    <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
                      {item.minimumStock} {item.unit}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default', border: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      INVENTORY VALUATION
                    </Typography>
                    <Typography variant="h5" fontWeight={800} sx={{ mt: 1, color: 'primary.main' }}>
                      ₹ {(currentStockVal * pRate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Stack>
          )}

          {currentTab === 2 && (
            <Alert severity="info" sx={{ mt: 1 }}>
              <strong>Stock History & Ledger:</strong> Detailed stock movement tracking (Opening, Purchases, Sales, Returns, Audit Adjustments) will be activated in <strong>Phase 12 — Stock Management</strong>.
            </Alert>
          )}

          {currentTab === 3 && (
            <Alert severity="info" sx={{ mt: 1 }}>
              <strong>Sales History:</strong> Invoices and customer sales order links for this item will be integrated in <strong>Phase 7 / 8 — Sales Module</strong>.
            </Alert>
          )}

          {currentTab === 4 && (
            <Alert severity="info" sx={{ mt: 1 }}>
              <strong>Purchase History:</strong> Supplier procurement bills and vendor order links will be integrated in <strong>Phase 9 — Purchase Module</strong>.
            </Alert>
          )}
        </Box>
      </Card>

      {/* Confirmation Dialog for Status Toggle */}
      <ConfirmDialog
        open={confirmOpen}
        title={isActive ? 'Deactivate Item?' : 'Activate Item?'}
        message={
          isActive
            ? `Deactivating "${item.itemName}" will prevent it from being selected in new Sales and Purchases. Historical transactions remain unaffected.`
            : `Activating "${item.itemName}" will make it available for new Sales and Purchases.`
        }
        confirmText={isActive ? 'Deactivate' : 'Activate'}
        confirmColor={isActive ? 'error' : 'success'}
        onConfirm={handleConfirmStatus}
        onCancel={() => setConfirmOpen(false)}
      />
    </Box>
  );
};

export default ItemDetails;
