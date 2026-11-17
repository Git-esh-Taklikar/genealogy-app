import React, { createContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOut as firebaseSignOut,
} from './firebase';
import { verifyAuth } from '../api/client';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [personNode, setPersonNode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const token = await firebaseUser.getIdToken();
          const res = await verifyAuth(token);
          if (res.data && res.data.person) {
            setPersonNode(res.data.person);
          }
        } catch (err) {
          console.warn('Auth verify failed:', err);
        }
      } else {
        setUser(null);
        setPersonNode(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen for 401 events from the API client
  useEffect(() => {
    const handle401 = () => {
      firebaseSignOut();
      setUser(null);
      setPersonNode(null);
    };
    window.addEventListener('auth:unauthorized', handle401);
    return () => window.removeEventListener('auth:unauthorized', handle401);
  }, []);

  const signIn = useCallback(async (method, email, password) => {
    setLoading(true);
    try {
      let firebaseUser;
      if (method === 'google') {
        firebaseUser = await signInWithGoogle();
      } else if (method === 'signup') {
        firebaseUser = await signUpWithEmail(email, password);
      } else {
        firebaseUser = await signInWithEmail(email, password);
      }
      setUser(firebaseUser);
      const token = await firebaseUser.getIdToken();
      const res = await verifyAuth(token);
      if (res.data && res.data.person) {
        setPersonNode(res.data.person);
      }
      return firebaseUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut();
    setUser(null);
    setPersonNode(null);
  }, []);

  const claimNode = useCallback(
    async (personId) => {
      try {
        const { default: client } = await import('../api/client');
        const res = await client.post(`/api/people/${personId}/claim`);
        if (res.data) {
          setPersonNode(res.data);
        }
        return res.data;
      } catch (err) {
        console.error('Failed to claim node:', err);
        throw err;
      }
    },
    []
  );

  const value = {
    user,
    loading,
    personNode,
    signIn,
    signOut,
    claimNode,
    setPersonNode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

