import { useState, useRef, useEffect } from 'react';
import {
  Box,
  InputBase,
  IconButton,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

/**
 * GlobalSearch Component
 * Enterprise search input for TopNavbar with keyboard shortcut Ctrl+K and sleek focus expansion.
 */
const GlobalSearch = () => {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Global Ctrl + K / Cmd + K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: isFocused ? theme.palette.background.paper : theme.palette.background.default,
        border: '1px solid',
        borderColor: isFocused ? theme.palette.info.main : theme.palette.divider,
        borderRadius: '9999px',
        px: 1.75,
        py: 0.5,
        width: { xs: 170, sm: 260, md: isFocused ? 380 : 300 },
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isFocused ? '0 0 0 3px rgba(37, 99, 235, 0.12), 0 2px 4px rgba(0, 0, 0, 0.04)' : 'none',
      }}
    >
      <SearchIcon sx={{ color: isFocused ? 'primary.main' : theme.palette.text.secondary, fontSize: 19, mr: 1 }} />
      <InputBase
        inputRef={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search... (Ctrl+K)"
        inputProps={{ 'aria-label': 'global search' }}
        sx={{
          flex: 1,
          fontSize: '0.8125rem',
          fontWeight: 500,
          '& input': {
            p: 0,
            '&::placeholder': {
              color: theme.palette.text.secondary,
              opacity: 1,
            },
          },
        }}
      />
      {query ? (
        <Tooltip title="Clear search">
          <IconButton size="small" onClick={handleClear} sx={{ p: 0.25, color: theme.palette.text.secondary, '&:hover': { color: theme.palette.text.primary } }}>
            <ClearIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      ) : (
        <Box
          component="kbd"
          sx={{
            display: { xs: 'none', sm: 'inline-flex' },
            alignItems: 'center',
            bgcolor: isFocused ? theme.palette.background.default : theme.palette.divider,
            color: theme.palette.text.secondary,
            fontSize: '0.68rem',
            fontWeight: 700,
            px: 0.8,
            py: 0.2,
            borderRadius: '4px',
            border: '1px solid #cbd5e1',
            fontFamily: 'inherit',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          ⌘K
        </Box>
      )}
    </Box>
  );
};

export default GlobalSearch;
