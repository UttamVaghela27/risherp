import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  TableCell,
  TableRow,
  TableBody,
  TableContainer,
  TableHead,
  Table,
  TablePagination,
  Paper,
  Chip,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import toast from 'react-hot-toast';
import auditService from '../../services/auditService';
import AuditDetailsDialog from '../../components/audit/AuditDetailsDialog';
import FilterBar from '../../components/common/FilterBar';
import PageHeader from '../../components/common/PageHeader';

const MODULES = [
  'ALL',
  'AUTH',
  'USERS',
  'ROLES',
  'PARTY',
  'ITEM',
  'CATEGORY',
  'STOCK',
  'SALES',
  'PURCHASE',
  'SALES_RETURN',
  'PURCHASE_RETURN',
  'RECEIPT',
  'PAYMENT',
  'SETTINGS',
  'BACKUP',
];

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // Pagination & Sort
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: pageSize,
        sortBy: 'createdAt',
        sortDir: 'desc',
      };

      if (search.trim()) params.search = search.trim();
      if (selectedModule && selectedModule !== 'ALL') params.module = selectedModule;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const res = await auditService.getAuditLogs(params);
      if (res.success && res.data) {
        setLogs(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, selectedModule, dateFrom, dateTo]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedModule('ALL');
    setDateFrom('');
    setDateTo('');
    setPage(0);
  };

  const handleOpenDetail = (log) => {
    setSelectedLog(log);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedLog(null);
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return isoStr;
    }
  };

  const getActionChip = (action) => {
    if (!action) return <Chip label="ACTION" size="small" />;
    let color = 'default';
    if (action.includes('CREATE') || action.includes('SUCCESS')) color = 'success';
    else if (action.includes('CANCEL') || action.includes('FAILED') || action.includes('DELETE')) color = 'error';
    else if (action.includes('UPDATE') || action.includes('RESTORE')) color = 'primary';
    else if (action.includes('LOGIN')) color = 'info';

    return <Chip label={action} color={color} size="small" variant="outlined" sx={{ fontWeight: 700 }} />;
  };

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title="System Audit Logs"
        subtitle="Immutable historical security and business transaction audit trails."
        actions={
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchLogs}
            disabled={loading}
            size="small"
          >
            Refresh Logs
          </Button>
        }
      />

      {/* Filter Toolbar */}
      <FilterBar
        isFiltered={search !== '' || selectedModule !== 'ALL' || dateFrom !== '' || dateTo !== ''}
        onReset={handleResetFilters}
      >
        <TextField
          size="small"
          placeholder="Search reference #, user, description..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: { xs: '100%', sm: 240 }, flex: 2 }}
        />
        <TextField
          select size="small" label="Module" value={selectedModule}
          onChange={(e) => { setSelectedModule(e.target.value); setPage(0); }}
          sx={{ minWidth: 160 }}
        >
          {MODULES.map((mod) => (
            <MenuItem key={mod} value={mod}>{mod}</MenuItem>
          ))}
        </TextField>
        <TextField
          size="small" type="date" label="From Date" value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
          slotProps={{ inputLabel: { shrink: true } }}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />
        <TextField
          size="small" type="date" label="To Date" value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
          slotProps={{ inputLabel: { shrink: true } }}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />
      </FilterBar>

      {/* Audit Logs Table */}
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto', maxWidth: '100%' }}>
          <Table size="medium" sx={{ minWidth: 850 }}>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Module</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Reference #</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>IP Address</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Detail</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      No audit log records match the selected criteria.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(row.createdAt)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {row.username || row.userEmail || 'System'}
                      </Typography>
                    </TableCell>

                    <TableCell>{getActionChip(row.action)}</TableCell>

                    <TableCell>
                      <Chip label={row.module} size="small" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                        {row.referenceNumber || row.recordId || '—'}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {row.description || '—'}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                        {row.ipAddress || '—'}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Tooltip title="View Record Details">
                        <IconButton size="small" color="primary" onClick={() => handleOpenDetail(row)}>
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Server-Side Pagination */}
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => {
            setPageSize(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
          sx={{ borderTop: 1, borderColor: 'divider' }}
        />
      </Card>

      {/* Details Dialog */}
      <AuditDetailsDialog open={detailOpen} onClose={handleCloseDetail} log={selectedLog} />
    </Box>
  );
};

export default AuditLogsPage;
