import React from 'react';
import { Stack, Button, CircularProgress } from '@mui/material';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

/**
 * ExportButtons — Action toolbar for Print, PDF download, and CSV export.
 */
const ExportButtons = ({
  onPrint,
  onPdf,
  onCsv,
  pdfLoading = false,
  csvLoading = false,
  showPrint = true,
  showPdf = true,
  showCsv = true,
}) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <Stack direction="row" spacing={1} sx={{ '@media print': { display: 'none !important' } }}>
      {showPrint && (
        <Button
          variant="outlined"
          color="secondary"
          size="small"
          startIcon={<PrintOutlinedIcon />}
          onClick={handlePrint}
          sx={{ borderRadius: 1.5, fontWeight: 600, textTransform: 'none' }}
        >
          Print
        </Button>
      )}

      {showPdf && onPdf && (
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={pdfLoading ? <CircularProgress size={16} color="inherit" /> : <PictureAsPdfOutlinedIcon />}
          onClick={onPdf}
          disabled={pdfLoading}
          sx={{ borderRadius: 1.5, fontWeight: 600, textTransform: 'none' }}
        >
          {pdfLoading ? 'Generating...' : 'Export PDF'}
        </Button>
      )}

      {showCsv && onCsv && (
        <Button
          variant="outlined"
          color="success"
          size="small"
          startIcon={csvLoading ? <CircularProgress size={16} color="inherit" /> : <FileDownloadOutlinedIcon />}
          onClick={onCsv}
          disabled={csvLoading}
          sx={{ borderRadius: 1.5, fontWeight: 600, textTransform: 'none' }}
        >
          {csvLoading ? 'Exporting...' : 'Export CSV'}
        </Button>
      )}
    </Stack>
  );
};

export default ExportButtons;
