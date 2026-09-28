import React from 'react';
import { Grid, Card, Box, Typography, Skeleton, useTheme } from '@mui/material';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import HistoryEduOutlinedIcon from '@mui/icons-material/HistoryEduOutlined';

const StatCard = ({ title, value, icon, loading }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card
      sx={{
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: isDark ? '0 6px 16px rgba(0,0,0,0.3)' : '0 6px 16px rgba(0,0,0,0.08)',
        },
      }}
    >
      <Box
        sx={{
          width: 50,
          height: 50,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom noWrap>
          {title}
        </Typography>
        {loading ? (
          <Skeleton variant="text" width="60%" height={36} />
        ) : (
          <Typography variant="h5" fontWeight={800} color="text.primary">
            {value}
          </Typography>
        )}
      </Box>
    </Card>
  );
};

const AdminOverviewStats = ({ overviewData, loading }) => {
  const theme = useTheme();
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        System Overview
      </Typography>
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Customers"
            value={overviewData?.totalCustomers || 0}
            icon={<PersonOutlinedIcon />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Suppliers"
            value={overviewData?.totalSuppliers || 0}
            icon={<BusinessOutlinedIcon />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Items"
            value={overviewData?.totalItems || 0}
            icon={<Inventory2OutlinedIcon />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Categories"
            value={overviewData?.totalCategories || 0}
            icon={<CategoryOutlinedIcon />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Sales"
            value={overviewData?.totalSalesInvoices || 0}
            icon={<ReceiptLongOutlinedIcon />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Purchases"
            value={overviewData?.totalPurchaseInvoices || 0}
            icon={<HistoryEduOutlinedIcon />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="System Users"
            value={overviewData?.totalUsers || 0}
            icon={<ManageAccountsOutlinedIcon />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Security Roles"
            value={overviewData?.totalRoles || 0}
            icon={<AdminPanelSettingsOutlinedIcon />}
            loading={loading}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminOverviewStats;
