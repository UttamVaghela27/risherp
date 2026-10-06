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
  useTheme,
  alpha,
} from '@mui/material';

const AppTable = ({
  columns = [],
  children,
  page,
  rowsPerPage,
  rowsPerPageOptions = [5, 10, 20, 25, 50, 100],
  totalElements,
  onPageChange,
  onRowsPerPageChange,
  minHeight = 340,
  headContent,
  hidePagination = false,
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        width: '100%',
        overflow: 'hidden',
        borderRadius: 2,
      }}
    >
      <TableContainer sx={{ minHeight, overflowX: 'auto', maxWidth: '100%' }}>
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
                      width: col.width,
                      minWidth: col.minWidth,
                      whiteSpace: 'nowrap',
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? alpha(theme.palette.background.default, 0.8)
                          : '#f8fafc',
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableHead>
          <TableBody>{children}</TableBody>
        </Table>
      </TableContainer>

      {!hidePagination && totalElements !== undefined && (
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          sx={{
            borderTop: 1,
            borderColor: 'divider',
            '& .MuiTablePagination-toolbar': {
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', sm: 'flex-end' },
              minHeight: 52,
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '0.8125rem',
              color: 'text.secondary',
            },
          }}
        />
      )}
    </Card>
  );
};

export default AppTable;
