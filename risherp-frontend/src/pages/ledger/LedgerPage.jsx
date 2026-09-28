import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Autocomplete,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import partyService from '../../services/partyService';
import ledgerService from '../../services/ledgerService';
import toast from 'react-hot-toast';

const LedgerPage = () => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState(0); // 0: Customers, 1: Suppliers
  const [parties, setParties] = useState([]);
  const [loadingParties, setLoadingParties] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadParties();
  }, [selectedTab]);

  const loadParties = async () => {
    setLoadingParties(true);
    try {
      const type = selectedTab === 0 ? 'CUSTOMER' : 'SUPPLIER';
      const res = await partyService.getParties({ type, size: 100 });
      const partyList = res?.data?.content || res?.content || (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
      setParties(partyList);
    } catch (err) {
      console.error('Failed to load parties:', err);
      setParties([]);
    } finally {
      setLoadingParties(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await ledgerService.syncLedger();
      toast.success('Financial ledger successfully synchronized with all existing records!');
      loadParties();
    } catch (err) {
      toast.error('Failed to synchronize ledger');
    } finally {
      setSyncing(false);
    }
  };

  const handleViewLedger = (party) => {
    if (!party) return;
    if (selectedTab === 0) {
      navigate(`/ledger/customer/${party.id}`, { state: { from: location.pathname } });
    } else {
      navigate(`/ledger/supplier/${party.id}`, { state: { from: location.pathname } });
    }
  };

  const [partySearch, setPartySearch] = useState('');

  const filteredParties = parties.filter((p) => {
    if (!partySearch.trim()) return true;
    const query = partySearch.toLowerCase();
    return (
      (p.partyName && p.partyName.toLowerCase().includes(query)) ||
      (p.partyCode && p.partyCode.toLowerCase().includes(query)) ||
      (p.mobile && p.mobile.includes(query)) ||
      (p.city && p.city.toLowerCase().includes(query))
    );
  });

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ color: theme.palette.text.primary, letterSpacing: '-0.02em' }}>
            Financial Ledger Hub
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            View detailed statement of accounts, running balances, debits, and credits for parties.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="primary"
          startIcon={syncing ? <CircularProgress size={16} /> : <SyncOutlinedIcon />}
          onClick={handleSync}
          disabled={syncing}
          sx={{ borderRadius: '10px', height: 40, px: 2.5, fontWeight: 600 }}
        >
          {syncing ? 'Syncing...' : 'Sync All Transactions'}
        </Button>
      </Box>

      {/* Selector Card */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: '16px', border: 1, borderColor: 'divider', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}>
        <Tabs
          value={selectedTab}
          onChange={(e, val) => {
            setSelectedTab(val);
            setSelectedParty(null);
            setPartySearch('');
          }}
          sx={{
            mb: 3,
            borderBottom: 1, borderColor: 'divider',
            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0', backgroundColor: theme.palette.info.main },
            '& .MuiTab-root': { fontWeight: 700, fontSize: '0.9rem', textTransform: 'none', minHeight: 48 }
          }}
        >
          <Tab
            icon={<PersonOutlinedIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label="Customer Ledgers"
          />
          <Tab
            icon={<BusinessOutlinedIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label="Supplier Ledgers"
          />
        </Tabs>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr auto' },
            gap: 2,
            alignItems: 'center',
          }}
        >
          <Autocomplete
            fullWidth
            options={parties}
            getOptionLabel={(option) =>
              `${option.partyName} (${option.partyCode || option.mobile || 'No Code'})`
            }
            value={selectedParty}
            onChange={(event, newValue) => setSelectedParty(newValue)}
            loading={loadingParties}
            renderInput={(params) => (
              <TextField
                {...params}
                label={selectedTab === 0 ? 'Select or Search Customer' : 'Select or Search Supplier'}
                placeholder="Type customer or supplier name, code, or phone number..."
                slotProps={{ inputLabel: { shrink: true } }}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  ...(params.InputProps || {}),
                  endAdornment: (
                    <>
                      {loadingParties ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps?.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <Button
            variant="contained"
            size="large"
            disabled={!selectedParty}
            onClick={() => handleViewLedger(selectedParty)}
            endIcon={<ArrowForwardOutlinedIcon />}
            sx={{
              height: 42,
              px: 3.5,
              borderRadius: '10px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              boxShadow: selectedParty ? '0 4px 14px rgba(37, 99, 235, 0.25)' : 'none',
            }}
          >
            Open Ledger Statement
          </Button>
        </Box>
      </Paper>

      {/* Directory Section Header & Search */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: theme.palette.text.primary }}>
            {selectedTab === 0 ? 'Customer Directory' : 'Supplier Directory'}
          </Typography>
          <Chip
            label={`${filteredParties.length} Parties`}
            size="small"
            sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main, borderRadius: '6px' }}
          />
        </Box>

        <TextField
          size="small"
          placeholder={`Filter ${selectedTab === 0 ? 'customers' : 'suppliers'}...`}
          value={partySearch}
          onChange={(e) => setPartySearch(e.target.value)}
          sx={{ minWidth: 260, '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: 'background.paper' } }}
        />
      </Box>

      {/* Directory Grid of Parties */}
      {loadingParties ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredParties.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: 5,
            textAlign: 'center',
            borderRadius: '16px',
            bgcolor: 'background.default',
            border: `1px dashed ${theme.palette.divider}`
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} color="text.secondary">
            {partySearch ? 'No parties match your search query.' : `No ${selectedTab === 0 ? 'customers' : 'suppliers'} found.`}
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
            {partySearch ? 'Try a different keyword or clear the search.' : 'Add new parties from Masters > Parties to view their ledger statements.'}
          </Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 2.5,
          }}
        >
          {filteredParties.map((party) => {
            const initials = party.partyName ? party.partyName.slice(0, 2).toUpperCase() : 'PA';
            return (
              <Card
                key={party.id}
                variant="outlined"
                sx={{
                  borderRadius: '16px',
                  border: 1, borderColor: 'divider',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
                    borderColor: theme.palette.info.light,
                  },
                }}
                onClick={() => handleViewLedger(party)}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        bgcolor: selectedTab === 0 ? alpha(theme.palette.info.main, 0.12) : alpha(theme.palette.success.main, 0.12),
                        color: selectedTab === 0 ? theme.palette.info.main : theme.palette.success.main,
                        border: '1px solid',
                        borderColor: selectedTab === 0 ? alpha(theme.palette.info.main, 0.25) : alpha(theme.palette.success.main, 0.25),
                      }}
                    >
                      {initials}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ color: theme.palette.text.primary }}>
                        {party.partyName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.2 }}>
                        {party.partyCode && (
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'monospace',
                              px: 0.8,
                              py: 0.1,
                              borderRadius: '4px',
                              bgcolor: 'background.default',
                              color: theme.palette.text.secondary,
                              fontWeight: 700,
                            }}
                          >
                            {party.partyCode}
                          </Typography>
                        )}
                        {party.city && (
                          <Typography variant="caption" color="text.secondary" noWrap>
                            • {party.city}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {party.mobile ? `Mobile: ${party.mobile}` : 'No phone registered'}
                  </Typography>

                  <Divider sx={{ my: 1.5 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontSize: '0.7rem' }}>
                        Opening Balance
                      </Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ color: theme.palette.text.primary }}>
                        ₹{Number(party.openingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Typography>
                    </Box>

                    <Button
                      size="small"
                      variant="text"
                      color="primary"
                      endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />}
                      sx={{ fontWeight: 700, textTransform: 'none', p: 0.5 }}
                    >
                      Statement
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default LedgerPage;
