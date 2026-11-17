import { useState, useCallback } from 'react';
import { findPath as findPathApi } from '../api/client';

/**
 * Hook to manage the pathfinder feature state.
 */
export function usePathfinder() {
  const [person1, setPerson1] = useState(null);
  const [person2, setPerson2] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const findPath = useCallback(async () => {
    if (!person1 || !person2) {
      setError('Please select both people.');
      return null;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await findPathApi(person1.id, person2.id);
      setResult(res.data);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to find connection.';
      setError(message);
      setResult(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [person1, person2]);

  const clearPath = useCallback(() => {
    setPerson1(null);
    setPerson2(null);
    setResult(null);
    setError(null);
  }, []);

  return {
    person1,
    person2,
    result,
    loading,
    error,
    setPerson1,
    setPerson2,
    findPath,
    clearPath,
  };
}

