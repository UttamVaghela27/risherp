import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import { CustomThemeProvider } from './context/ThemeContext';

/**
 * App — Root Component
 * 
 * This wraps the entire application with:
 * 1. ThemeProvider — applies our MUI theme globally
 * 2. CssBaseline — normalizes CSS across browsers
 * 3. AuthProvider — makes auth state available everywhere
 * 4. Toaster — enables toast notifications anywhere in the app
 * 5. AppRoutes — handles page routing
 */
function App() {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '8px',
              background: '#333',
              color: '#fff',
              fontSize: '0.875rem',
              padding: '12px 16px',
            },
            success: {
              iconTheme: {
                primary: '#2e7d32',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#d32f2f',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </CustomThemeProvider>
  );
}

export default App;
