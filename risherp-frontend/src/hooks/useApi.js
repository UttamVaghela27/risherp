import { useState, useCallback } from 'react';

/**
 * useApi — Custom Hook for API calls
 * 
 * Provides a clean way to handle loading, error, and data states
 * for any API call.
 * 
 * Usage:
 * const { data, loading, error, execute } = useApi(healthService.checkHealth);
 * 
 * // Call the API
 * useEffect(() => { execute(); }, []);
 * 
 * // In JSX
 * {loading && <LoadingSpinner />}
 * {error && <ErrorState message={error} />}
 * {data && <DisplayData data={data} />}
 */
const useApi = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction(...args);
      setData(response.data || response);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
};

export default useApi;
