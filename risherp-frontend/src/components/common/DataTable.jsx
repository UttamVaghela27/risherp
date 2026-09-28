import { useState } from 'react';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box,
  TextField,
  InputAdornment,
  Typography,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EmptyState from './EmptyState';
import { TableSkeleton } from './Loading';

/**
 * DataTable Component
 * High-density executive reusable data table for all ERP listings (Parties, Items, Sales, Ledgers, etc.).
 */
const DataTable = ({
  title,
  columns = [],
  rows = [],
  loading = false,
  searchPlaceholder = 'Search records...',
  actions,
  emptyMessage = 'No records found',
  defaultRowsPerPage = 10,
}) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [search, setSearch] = useState('');

  // Local filtering if rows are provided as array
  const filteredRows = rows.filter((row) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return Object.values(row).some((val) =>
      val !== null && val !== undefined && String(val).toLowerCase().includes(s)
    );
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return <TableSkeleton rows={rowsPerPage > 10 ? 10 : rowsPerPage} columns={columns.length || 5} />;
  }

  return (
    <Card
      sx={{
        width: '100%',
        overflow: 'hidden',
        borderRadius: 3,
        border: 1, borderColor: 'divider',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Top Table Toolbar */}
      {(title || searchPlaceholder || actions) && (
        <Box
          sx={{
            p: 2.25,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            borderBottom: 1, borderColor: 'divider',
            bgcolor: '#fafbfc',
          }}
        >
          {title ? (
            <Typography variant="subtitle1" fontWeight={750} color={theme.palette.text.primary} sx={{ letterSpacing: -0.2 }}>
              {title}
            </Typography>
          ) : (
            <Box />
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {searchPlaceholder && (
              <TextField
                size="small"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: { xs: '100%', sm: 260 },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                  },
                }}
              />
            )}
            {actions}
          </Box>
        </Box>
      )}

      {/* Table Content */}
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align || 'left'}
                  sx={{
                    minWidth: col.minWidth || 100,
                    bgcolor: 'background.default',
                    color: theme.palette.text.secondary,
                    fontWeight: 700,
                    fontSize: '0.73rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                    borderBottom: 1, borderColor: 'divider',
                    py: 1.3,
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <EmptyState title={emptyMessage} message="Try adjusting search or filter options." />
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row, rIdx) => (
                <TableRow
                  hover
                  key={row.id || rIdx}
                  sx={{
                    transition: 'background-color 0.15s ease',
                    '&:hover': {
                      bgcolor: '#f8fafc !important',
                    },
                  }}
                >
                  {columns.map((col) => {
                    const value = row[col.id];
                    return (
                      <TableCell
                        key={col.id}
                        align={col.align || 'left'}
                        sx={{
                          py: 1.25,
                          fontSize: '0.8125rem',
                          color: theme.palette.text.primary,
                          borderBottom: 1, borderColor: 'divider',
                        }}
                      >
                        {col.render ? col.render(value, row) : value ?? '-'}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Table Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          borderTop: 1, borderColor: 'divider',
          bgcolor: '#fafbfc',
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            fontSize: '0.78rem',
            color: theme.palette.text.secondary,
            fontWeight: 500,
          },
        }}
      />
    </Card>
  );
};

export default DataTable;
