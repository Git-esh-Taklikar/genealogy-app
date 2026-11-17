import { useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';

/**
 * Convenience hook to access the auth context.
 * @returns {{ user, loading, personNode, signIn, signOut, claimNode, setPersonNode }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

