import { useContext } from 'react';
import { LoadingContext } from '../contexts/LoadingContext';

/**
 * A custom hook to access the LoadingContext.
 * @returns {object} The loading context value.
 */
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};