import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import outstandingService from '../../services/outstandingService';
import OutstandingSummaryCards from '../../components/outstanding/OutstandingSummaryCards';
import CustomerOutstanding from './CustomerOutstanding';
import SupplierOutstanding from './SupplierOutstanding';

const OutstandingPage = () => {
  const [activeTab, setActiveTab] = useState(0); // 0: Customers, 1: Suppliers
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    setLoadingSummary(true);
    try {
      const data = await outstandingService.getOutstandingSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load outstanding summary:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Outstanding & Settlement Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor customer receivables, supplier payables, and unsettled invoice balances.
        </Typography>
      </Box>

      {/* KPI Cards */}
      {loadingSummary ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      ) : (
        <OutstandingSummaryCards summary={summary} />
      )}

      {/* Tabs */}
      <Paper elevation={0} sx={{ borderRadius: '16px', border: 1, borderColor: 'divider', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)', overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          sx={{
            px: 2,
            pt: 1,
            bgcolor: 'background.default',
            borderBottom: 1, borderColor: 'divider',
            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
            '& .MuiTab-root': { fontWeight: 700, fontSize: '0.88rem' },
          }}
        >
          <Tab
            icon={<PersonOutlinedIcon />}
            iconPosition="start"
            label="Customer Receivables"
            sx={{ fontWeight: 600 }}
          />
          <Tab
            icon={<BusinessOutlinedIcon />}
            iconPosition="start"
            label="Supplier Payables"
            sx={{ fontWeight: 600 }}
          />
        </Tabs>

        <Box sx={{ p: 2.5 }}>
          {activeTab === 0 ? <CustomerOutstanding /> : <SupplierOutstanding />}
        </Box>
      </Paper>
    </Box>
  );
};

export default OutstandingPage;
