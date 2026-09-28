import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  TablePagination,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import outstandingService from '../../services/outstandingService';
import OutstandingTable from '../../components/outstanding/OutstandingTable';
import InvoiceOutstandingDialog from '../../components/outstanding/InvoiceOutstandingDialog';

const CustomerOutstanding = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalElements, setTotalElements] = useState(0);

  // Dialog state
  const [selectedParty, setSelectedParty] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await outstandingService.getCustomerOutstanding({
        search: search || undefined,
        page,
        size: rowsPerPage,
      });
      setRecords(res.content || res || []);
      setTotalElements(res.totalElements || (res.content ? res.content.length : 0));
    } catch (err) {
      console.error('Failed to load customer outstanding:', err);
    } finally {
      setLoading(false);
    }
  }, [search, page, rowsPerPage]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleOpenInvoices = (party) => {
    setSelectedParty(party);
    setDialogOpen(true);
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <TextField
          size="small"
          placeholder="Search customer by name, code, phone, or city..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          sx={{ width: { xs: '100%', sm: 350 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <OutstandingTable
            records={records}
            type="CUSTOMER"
            loading={loading}
            onViewInvoices={handleOpenInvoices}
          />
          <TablePagination
            component="div"
            count={totalElements}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 20, 50]}
            sx={{ mt: 1 }}
          />
        </>
      )}

      <InvoiceOutstandingDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        party={selectedParty}
        type="CUSTOMER"
      />
    </Box>
  );
};

export default CustomerOutstanding;
