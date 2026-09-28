import React from 'react';
import {
  Box,
  TableCell,
  TableRow,
  TableSortLabel,
  Typography,
  Skeleton,
  Chip,
} from '@mui/material';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import AppTable from '../common/AppTable';

/**
 * ReportTable — Generic, highly-optimized data table for all reports.
 *
 * Props:
 * - columns: [{ id, label, align, minWidth, format, sortable, bold, render }]
 * - data: Array of row objects
 * - loading: boolean
 * - totalElements: number
 * - page: number (0-indexed)
 * - rowsPerPage: number
 * - onPageChange: (newPage) => void
 * - onRowsPerPageChange: (newRowsPerPage) => void
 * - sortBy: string
 * - sortDir: 'asc' | 'desc'
 * - onSortChange: (columnId) => void
 * - emptyMessage: string
 * - onRowClick: (row) => void
 */
const ReportTable = ({
  columns = [],
  data = [],
  loading = false,
  totalElements = 0,
  page = 0,
  rowsPerPage = 20,
  onPageChange,
  onRowsPerPageChange,
  sortBy = '',
  sortDir = 'desc',
  onSortChange,
  emptyMessage = 'No report records found for the selected filters.',
  onRowClick,
}) => {

  const handleSort = (colId) => {
    if (onSortChange) {
      onSortChange(colId);
    }
  };

  const renderCellContent = (row, col) => {
    if (col.render) {
      return col.render(row);
    }

    const value = row[col.id];

    if (col.format === 'currency') {
      if (value == null) return '₹ 0.00';
      const num = typeof value === 'number' ? value : parseFloat(value);
      return isNaN(num)
        ? '₹ 0.00'
        : `₹ ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    if (col.format === 'qty') {
      if (value == null) return '0';
      const num = typeof value === 'number' ? value : parseFloat(value);
      return isNaN(num) ? '0' : num.toLocaleString('en-IN', { maximumFractionDigits: 3 });
    }

    if (col.format === 'date') {
      if (!value) return '-';
      return String(value);
    }

    if (col.format === 'status') {
      let color = 'default';
      const s = String(value || '').toUpperCase();
      if (['COMPLETED', 'PAID', 'IN_STOCK', 'ACTIVE'].includes(s)) color = 'success';
      else if (['PENDING', 'PARTIAL', 'LOW_STOCK'].includes(s)) color = 'warning';
      else if (['CANCELLED', 'OUT_OF_STOCK', 'UNPAID'].includes(s)) color = 'error';

      return (
        <Chip
          label={value || '-'}
          size="small"
          color={color}
          sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22 }}
        />
      );
    }

    if (value == null || value === '') return '-';
    return String(value);
  };

  const headContent = (
    <TableRow>
      {columns.map((col) => (
        <TableCell
          key={col.id}
          align={col.align || 'left'}
          sx={{
            minWidth: col.minWidth || 100,
            fontWeight: 700,
            fontSize: '0.78rem',
            letterSpacing: 0.3,
            textTransform: 'uppercase',
            py: 1.2,
          }}
          sortDirection={sortBy === col.id ? sortDir : false}
        >
          {col.sortable ? (
            <TableSortLabel
              active={sortBy === col.id}
              direction={sortBy === col.id ? sortDir : 'asc'}
              onClick={() => handleSort(col.id)}
            >
              {col.label}
            </TableSortLabel>
          ) : (
            col.label
          )}
        </TableCell>
      ))}
    </TableRow>
  );

  return (
    <AppTable
      page={page}
      rowsPerPage={rowsPerPage}
      totalElements={totalElements}
      onPageChange={onPageChange ? (_, newPage) => onPageChange(newPage) : undefined}
      onRowsPerPageChange={
        onRowsPerPageChange
          ? (e) => onRowsPerPageChange(parseInt(e.target.value, 10))
          : undefined
      }
      headContent={headContent}
      hidePagination={!onPageChange}
    >
      {loading ? (
        // Loading Skeleton Rows
        Array.from(new Array(6)).map((_, rIdx) => (
          <TableRow key={rIdx}>
            {columns.map((col, cIdx) => (
              <TableCell key={cIdx} align={col.align || 'left'} sx={{ py: 1.5 }}>
                <Skeleton variant="text" width="80%" />
              </TableCell>
            ))}
          </TableRow>
        ))
      ) : data && data.length > 0 ? (
        data.map((row, rIdx) => (
          <TableRow
            key={row.id || rIdx}
            hover
            onClick={() => onRowClick && onRowClick(row)}
            sx={{
              cursor: onRowClick ? 'pointer' : 'default',
              bgcolor: rIdx % 2 === 1 ? 'action.hover' : 'inherit',
              '&:last-child td, &:last-child th': { border: 0 },
            }}
          >
            {columns.map((col) => (
              <TableCell
                key={col.id}
                align={col.align || 'left'}
                sx={{
                  py: 1.2,
                  fontSize: '0.82rem',
                  fontWeight: col.bold ? 700 : 400,
                  color: col.bold ? 'text.primary' : 'text.secondary',
                }}
              >
                {renderCellContent(row, col)}
              </TableCell>
            ))}
          </TableRow>
        ))
      ) : (
        // Empty State
        <TableRow>
          <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <AssessmentOutlinedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                {emptyMessage}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.5 }}>
                Try adjusting the date range or filter criteria above.
              </Typography>
            </Box>
          </TableCell>
        </TableRow>
      )}
    </AppTable>
  );
};

export default ReportTable;
