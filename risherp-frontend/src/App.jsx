import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import { CustomThemeProvider } from './context/ThemeContext';
import ThemedToaster from './components/common/ThemedToaster';

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
        <ThemedToaster />
      </AuthProvider>
    </CustomThemeProvider>
  );
}

export default App;
