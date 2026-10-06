import { Toaster } from 'react-hot-toast';
import { useTheme } from '@mui/material/styles';

const ThemedToaster = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          borderRadius: '10px',
          background: isLight ? theme.palette.background.paper : theme.palette.background.paper,
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: isLight
            ? '0 8px 24px rgba(15, 23, 42, 0.12)'
            : '0 8px 24px rgba(0, 0, 0, 0.45)',
          fontSize: '0.875rem',
          padding: '12px 16px',
        },
        success: {
          iconTheme: {
            primary: theme.palette.success.main,
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: theme.palette.error.main,
            secondary: '#fff',
          },
        },
      }}
    />
  );
};

export default ThemedToaster;
