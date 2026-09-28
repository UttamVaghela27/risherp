import React from 'react';
import {
  Card,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  useTheme
} from '@mui/material';

/**
 * AppTable
 * A common, theme-aware wrapper for all data tables in the application.
 * Automatically handles dark/light mode styling for borders, backgrounds, and pagination.
 */
const AppTable = ({
  columns = [],
  children,
  page,
  rowsPerPage,
  totalElements,
  onPageChange,
  onRowsPerPageChange,
  minHeight = 340,
  headContent,
  hidePagination = false
}) => {
  const theme = useTheme();
  return (
    <Card sx={{ 
      width: '100%', 
      overflow: 'hidden', 
      border: `1px solid ${theme.palette.divider}`, 
      borderRadius: 2,
      bgcolor: theme.palette.background.paper,
      boxShadow: theme.palette.mode === 'dark' 
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)' 
        : '0 1px 3px 0 rgba(0, 0, 0, 0.04)'
    }}>
      <TableContainer sx={{ minHeight }}>
        <Table stickyHeader size="small">
          <TableHead>
            {headContent ? (
              headContent
            ) : (
              <TableRow>
                {columns.map((col, idx) => (
                  <TableCell 
                    key={idx} 
                    align={col.align || 'left'} 
                    sx={{ 
                      fontWeight: 700, 
                      width: col.width, 
                      minWidth: col.minWidth,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : theme.palette.background.default,
                      color: theme.palette.text.primary,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableHead>
          <TableBody>
            {children}
          </TableBody>
        </Table>
      </TableContainer>

      {!hidePagination && totalElements !== undefined && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '0.8rem',
              color: 'text.secondary',
            },
          }}
        />
      )}
    </Card>
  );
};

export default AppTable;
