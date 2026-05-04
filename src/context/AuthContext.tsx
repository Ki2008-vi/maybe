import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, isAdmin: false, loading: true });

// ✅ Add your admin email(s) here
const ADMIN_EMAILS = ['akutosai564@gmail.com'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ KEY FIX: Handle the redirect result when Google sends the user back to your app
    // Without this, signInWithRedirect completes silently and nothing happens
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log('Google redirect login successful:', result.user.email);
        }
      })
      .catch((error) => {
        console.error('Redirect result error:', error);
      });

    // Listen for auth state changes (fires after redirect result is processed)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          const isAdminByEmail = ADMIN_EMAILS.includes(firebaseUser.email || '');

          if (!userSnap.exists()) {
            // New user — create their Firestore document
            await setDoc(userRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              isAdmin: isAdminByEmail,
              createdAt: new Date().toISOString(),
            });
            setIsAdmin(isAdminByEmail);
          } else {
            const data = userSnap.data();
            setIsAdmin(data?.isAdmin === true || isAdminByEmail);
          }
        } catch (err) {
          console.error('Firestore error:', err);
          // Fallback: email whitelist so admins are never locked out
          setIsAdmin(ADMIN_EMAILS.includes(firebaseUser.email || ''));
        }

        // Sync user to MySQL backend
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          await fetch(`${API_URL}/api/users/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            }),
          });
        } catch (err) {
          console.error('Failed to sync with MySQL:', err);
        }
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);