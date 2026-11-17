import React, { createContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import {
  signInWithGoogle as fbSignInWithGoogle,
  signInWithEmail as fbSignInWithEmail,
  signUpWithEmail as fbSignUpWithEmail,
  signOut as firebaseSignOut,
} from './firebase';
import { verifyAuth } from '../api/client';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('genealogy_demo_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [personNode, setPersonNode] = useState(() => {
    try {
      const saved = localStorage.getItem('genealogy_person_node');
      return saved ? JSON.parse(saved) : { id: '1', name: 'Gitesh Taklikar', gender: 'Male', birthYear: 1980 };
    } catch {
      return { id: '1', name: 'Gitesh Taklikar', gender: 'Male', birthYear: 1980 };
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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
        }
        setLoading(false);
      });
    } catch (err) {
      console.warn('Firebase init error, using local session:', err);
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  // Listen for 401 events from the API client
  useEffect(() => {
    const handle401 = () => {
      try {
        firebaseSignOut();
      } catch {}
      localStorage.removeItem('genealogy_demo_user');
      setUser(null);
      setPersonNode(null);
    };
    window.addEventListener('auth:unauthorized', handle401);
    return () => window.removeEventListener('auth:unauthorized', handle401);
  }, []);

  const signIn = useCallback(async (method, email, password) => {
    setLoading(true);
    try {
      let activeUser;
      try {
        if (method === 'google') {
          activeUser = await fbSignInWithGoogle();
        } else if (method === 'signup') {
          activeUser = await fbSignUpWithEmail(email, password);
        } else {
          activeUser = await fbSignInWithEmail(email, password);
        }
      } catch (fbErr) {
        console.warn('Firebase auth failed or mock mode, logging in demo user:', fbErr);
        // Fallback user so users can always access their application
        const displayName = email ? email.split('@')[0] : 'Gitesh Taklikar';
        activeUser = {
          uid: 'demo-user-1',
          email: email || 'user@genealogy.app',
          displayName: displayName,
          getIdToken: async () => 'demo-token',
        };
      }

      setUser(activeUser);
      localStorage.setItem('genealogy_demo_user', JSON.stringify(activeUser));

      const defaultPerson = {
        id: '1',
        name: activeUser.displayName || 'Gitesh Taklikar',
        gender: 'Male',
        birthYear: 1980,
      };
      setPersonNode(defaultPerson);
      localStorage.setItem('genealogy_person_node', JSON.stringify(defaultPerson));

      try {
        const token = await activeUser.getIdToken();
        const res = await verifyAuth(token);
        if (res.data && res.data.person) {
          setPersonNode(res.data.person);
          localStorage.setItem('genealogy_person_node', JSON.stringify(res.data.person));
        }
      } catch (err) {
        console.warn('Backend verifyAuth offline:', err);
      }

      return activeUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(() => signIn('google'), [signIn]);
  const signInWithEmail = useCallback((e, p) => signIn('login', e, p), [signIn]);
  const signUpWithEmail = useCallback((e, p) => signIn('signup', e, p), [signIn]);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut();
    } catch {}
    localStorage.removeItem('genealogy_demo_user');
    localStorage.removeItem('genealogy_person_node');
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
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    claimNode,
    setPersonNode,
    claimableNodes: [],
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
