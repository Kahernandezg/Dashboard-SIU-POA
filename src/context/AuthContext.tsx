import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';

export const SUPERADMIN_EMAIL = 'kahernandezg@uca.edu.sv';

export interface UserPersona {
  email: string;
  name: string;
  role: 'Superadmin' | 'Usuario' | 'Jefatura';
  isSuper: boolean;
}

export const PRESET_USERS: UserPersona[] = [
  { email: 'kahernandezg@uca.edu.sv', name: 'Kevin Amilcar Hernández', role: 'Superadmin', isSuper: true },
  { email: 'adiaz@uca.edu.sv', name: 'América Díaz', role: 'Jefatura', isSuper: false },
  { email: 'scampos@uca.edu.sv', name: 'Silvia Campos', role: 'Usuario', isSuper: false },
  { email: 'gihernandez@uca.edu.sv', name: 'Gerson Hernández', role: 'Usuario', isSuper: false },
];

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  currentEmail: string;
  currentName: string;
  isSuperAdmin: boolean;
  activePersona: UserPersona;
  switchPersona: (email: string) => void;
  resetToGoogleUser: () => void;
}

const defaultPersona = PRESET_USERS[0];

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
  currentEmail: defaultPersona.email,
  currentName: defaultPersona.name,
  isSuperAdmin: true,
  activePersona: defaultPersona,
  switchPersona: () => {},
  resetToGoogleUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulatedEmail, setSimulatedEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken();
          setToken(idToken); // Stored in-memory only (never in localStorage)

          // Synchronize user to Cloud SQL PostgreSQL database
          await fetch('/api/auth/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              name: currentUser.displayName || '',
              photoUrl: currentUser.photoURL || '',
            }),
          });
        } catch (err) {
          console.error('Error synchronizing user with backend Cloud SQL:', err);
        }
      } else {
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await result.user.getIdToken();
      setToken(idToken);
      setSimulatedEmail(null);
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setToken(null);
      setSimulatedEmail(null);
    } catch (error) {
      console.error('Sign-Out failed:', error);
      throw error;
    }
  };

  // Determine current active email and role
  const effectiveEmail = (simulatedEmail || user?.email || SUPERADMIN_EMAIL).toLowerCase();
  const isSuperAdmin = effectiveEmail === SUPERADMIN_EMAIL.toLowerCase();

  const matchedPreset = PRESET_USERS.find((p) => p.email.toLowerCase() === effectiveEmail);
  const activePersona: UserPersona = matchedPreset || {
    email: effectiveEmail,
    name: user?.displayName || effectiveEmail.split('@')[0],
    role: isSuperAdmin ? 'Superadmin' : 'Usuario',
    isSuper: isSuperAdmin,
  };

  const switchPersona = (email: string) => {
    setSimulatedEmail(email);
  };

  const resetToGoogleUser = () => {
    setSimulatedEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signInWithGoogle,
        signOutUser,
        currentEmail: activePersona.email,
        currentName: activePersona.name,
        isSuperAdmin,
        activePersona,
        switchPersona,
        resetToGoogleUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
