import React from 'react';
import { Box, Typography } from '@mui/material';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import HistoryEduOutlinedIcon from '@mui/icons-material/HistoryEduOutlined';
import StatCard from '../common/StatCard';

const AdminOverviewStats = ({ overviewData, loading }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        System Overview
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 2.5,
        }}
      >
        <StatCard
          title="Total Customers"
          value={overviewData?.totalCustomers || 0}
          icon={<PersonOutlinedIcon />}
          color="primary"
          loading={loading}
        />
        <StatCard
          title="Total Suppliers"
          value={overviewData?.totalSuppliers || 0}
          icon={<BusinessOutlinedIcon />}
          color="secondary"
          loading={loading}
        />
        <StatCard
          title="Total Items"
          value={overviewData?.totalItems || 0}
          icon={<Inventory2OutlinedIcon />}
          color="info"
          loading={loading}
        />
        <StatCard
          title="Total Categories"
          value={overviewData?.totalCategories || 0}
          icon={<CategoryOutlinedIcon />}
          color="warning"
          loading={loading}
        />
        <StatCard
          title="Total Sales Invoices"
          value={overviewData?.totalSalesInvoices || 0}
          icon={<ReceiptLongOutlinedIcon />}
          color="success"
          loading={loading}
        />
        <StatCard
          title="Total Purchase Invoices"
          value={overviewData?.totalPurchaseInvoices || 0}
          icon={<HistoryEduOutlinedIcon />}
          color="primary"
          loading={loading}
        />
        <StatCard
          title="System Users"
          value={overviewData?.totalUsers || 0}
          icon={<ManageAccountsOutlinedIcon />}
          color="info"
          loading={loading}
        />
        <StatCard
          title="Security Roles"
          value={overviewData?.totalRoles || 0}
          icon={<AdminPanelSettingsOutlinedIcon />}
          color="secondary"
          loading={loading}
        />
      </Box>
    </Box>
  );
};

export default AdminOverviewStats;
