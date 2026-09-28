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
  useTheme
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import StatusChip from '../common/StatusChip';
import CurrencyDisplay from '../common/CurrencyDisplay';
import DateDisplay from '../common/DateDisplay';
import ConfirmDialog from '../common/ConfirmDialog';

/**
 * PartyDetails Component
 * Complete profile overview with future transaction/ledger placeholders.
 */
const PartyDetails = ({
  party,
  onEdit,
  onToggleStatus,
  onBack,
  statusUpdating = false,
}) => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!party) return null;

  const isReceivable = party.openingBalanceType === 'RECEIVABLE';
  const isPayable = party.openingBalanceType === 'PAYABLE';
  const isActive = party.status === 'ACTIVE';

  const handleStatusClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmStatus = () => {
    setConfirmOpen(false);
    onToggleStatus && onToggleStatus(party);
  };

  const futureTabs = [
    { label: 'Transactions', phase: 'Phase 7 / 9', desc: 'All sales and purchase orders linked to this party.' },
    { label: 'Ledger', phase: 'Phase 15', desc: 'Running account statement, debit & credit entries, and closing balance.' },
    { label: 'Sales Invoices', phase: 'Phase 7 / 8', desc: 'Customer billing history and tax invoices.' },
    { label: 'Purchases', phase: 'Phase 9', desc: 'Vendor bills and procurement records.' },
    { label: 'Payments & Receipts', phase: 'Phase 13 / 14', desc: 'Cash, bank, UPI, and cheque settlements.' },
  ];

  return (
    <Box>
      {/* Top Navigation Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<ArrowBackOutlinedIcon />}
          onClick={onBack}
          sx={{ borderRadius: 1.5, borderColor: 'divider' }}
        >
          Back to List
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
            {isActive ? 'Deactivate Party' : 'Activate Party'}
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<EditOutlinedIcon />}
            onClick={() => onEdit && onEdit(party)}
            sx={{ borderRadius: 1.5, px: 2.5 }}
          >
            Edit Profile
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
                {party.partyName}
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
                {party.partyCode}
              </Typography>

              <Chip
                size="small"
                label={party.partyType}
                sx={{
                  fontWeight: 700,
                  bgcolor:
                    party.partyType === 'CUSTOMER'
                      ? 'rgba(30, 58, 138, 0.08)'
                      : party.partyType === 'SUPPLIER'
                      ? 'rgba(15, 118, 110, 0.08)'
                      : 'rgba(100, 116, 139, 0.1)',
                  color:
                    party.partyType === 'CUSTOMER'
                      ? 'primary.main'
                      : party.partyType === 'SUPPLIER'
                      ? 'secondary.main'
                      : theme.palette.text.secondary,
                }}
              />

              <StatusChip status={party.status} />
            </Stack>

            {party.contactPerson && (
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PersonOutlinedIcon sx={{ fontSize: 16 }} /> Contact Person: <strong>{party.contactPerson}</strong>
              </Typography>
            )}
          </Box>

          {/* Quick Balance Preview Card */}
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
              Opening Balance
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <CurrencyDisplay
                amount={party.openingBalance}
                variant="h5"
                fontWeight={800}
                color={isReceivable ? 'success.dark' : isPayable ? 'error.dark' : 'text.primary'}
              />
            </Box>
            {party.openingBalance > 0 && (
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: isReceivable ? 'success.main' : 'error.main',
                  display: 'block',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  mt: 0.25,
                }}
              >
                {isReceivable ? 'Receivable (Due to you)' : 'Payable (You owe)'}
              </Typography>
            )}
          </Paper>
        </Box>
      </Card>

      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, v) => setCurrentTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 650,
              fontSize: '0.875rem',
              minHeight: 48,
            },
          }}
        >
          <Tab label="Profile Overview" />
          {futureTabs.map((tab, idx) => (
            <Tab key={tab.label} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      {/* TAB 0: Profile Overview */}
      {currentTab === 0 && (
        <Grid container spacing={3}>
          {/* Contact Details Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={750} color="text.primary" sx={{ mb: 2.5 }}>
                  Contact Information
                </Typography>

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Primary Mobile
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                      <PhoneOutlinedIcon fontSize="small" color="action" />
                      {party.mobile}
                    </Typography>
                  </Box>

                  {party.alternateMobile && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Alternate Mobile
                      </Typography>
                      <Typography variant="body2" fontWeight={500} sx={{ mt: 0.25 }}>
                        {party.alternateMobile}
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email Address
                    </Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                      <EmailOutlinedIcon fontSize="small" color="action" />
                      {party.email || 'Not specified'}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Address Details Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={750} color="text.primary" sx={{ mb: 2.5 }}>
                  Address Details
                </Typography>

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Street / Shop Address
                    </Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 0.25 }}>
                      <PlaceOutlinedIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
                      {party.address || 'Not specified'}
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">
                        City
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ mt: 0.25 }}>
                        {party.city || '-'}
                      </Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">
                        State
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ mt: 0.25 }}>
                        {party.state || '-'}
                      </Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">
                        PIN Code
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ mt: 0.25 }}>
                        {party.pincode || '-'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Financial Details Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={750} color="text.primary" sx={{ mb: 2.5 }}>
                  Financial Information
                </Typography>

                <Grid container spacing={2.5}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Opening Balance
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <CurrencyDisplay
                        amount={party.openingBalance}
                        variant="h6"
                        fontWeight={700}
                        color={isReceivable ? 'success.dark' : isPayable ? 'error.dark' : 'text.primary'}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Type: <strong>{party.openingBalanceType}</strong>
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Credit Limit
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <CurrencyDisplay
                        amount={party.creditLimit}
                        variant="h6"
                        fontWeight={700}
                        color="text.primary"
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {parseFloat(party.creditLimit) === 0 ? 'No limit configured' : 'Maximum threshold'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Notes & Audit Info Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={750} color="text.primary" sx={{ mb: 2.5 }}>
                  Notes & Audit Information
                </Typography>

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Internal Notes
                    </Typography>
                    <Typography variant="body2" color="text.primary" sx={{ mt: 0.25, fontStyle: party.notes ? 'normal' : 'italic' }}>
                      {party.notes || 'No notes added for this party.'}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Registered On
                      </Typography>
                      <Box sx={{ mt: 0.25 }}>
                        <DateDisplay date={party.createdAt} format="dd MMM yyyy, hh:mm a" variant="body2" />
                      </Box>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Last Updated
                      </Typography>
                      <Box sx={{ mt: 0.25 }}>
                        <DateDisplay date={party.updatedAt} format="dd MMM yyyy, hh:mm a" variant="body2" />
                      </Box>
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* FUTURE TABS (1..5): Informative placeholder */}
      {currentTab > 0 && (
        <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2.5, p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
          <Box sx={{ maxWidth: 500, mx: 'auto' }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: 'primary.light',
                opacity: 0.9,
                color: theme.palette.background.paper,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <InfoOutlinedIcon sx={{ fontSize: 32 }} />
            </Box>

            <Typography variant="h6" fontWeight={750} color="text.primary" sx={{ mb: 1 }}>
              {futureTabs[currentTab - 1].label}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {futureTabs[currentTab - 1].desc}
            </Typography>

            <Alert severity="info" sx={{ borderRadius: 2, textAlign: 'left' }}>
              <strong>Upcoming Module:</strong> This section will automatically populate once transaction records are generated in{' '}
              <strong>{futureTabs[currentTab - 1].phase}</strong>. Party Master ID ({party.id}) is already architected for foreign-key referencing.
            </Alert>
          </Box>
        </Card>
      )}

      {/* Confirm Deactivation / Activation Modal */}
      <ConfirmDialog
        open={confirmOpen}
        title={isActive ? 'Deactivate Party?' : 'Activate Party?'}
        message={
          isActive
            ? `Are you sure you want to deactivate "${party.partyName}" (${party.partyCode})? Deactivated parties will not appear in active transaction lookups.`
            : `Are you sure you want to reactivate "${party.partyName}" (${party.partyCode})?`
        }
        confirmText={isActive ? 'Deactivate' : 'Activate'}
        severity={isActive ? 'error' : 'primary'}
        onConfirm={handleConfirmStatus}
        onCancel={() => setConfirmOpen(false)}
      />
    </Box>
  );
};

export default PartyDetails;
