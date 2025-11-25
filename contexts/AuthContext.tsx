import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { userService } from '../services/userService';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  deleteAccount: (uid: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in.
        // 1. Try to fetch their full profile from Firestore.
        // 2. If that fails (e.g. permission error), fall back to basic Auth data.
        try {
          const userProfile = await userService.getUserProfile(firebaseUser.uid);
          if (userProfile) {
            setUser(userProfile);
          } else {
            // Profile not found in Firestore (maybe created but write failed)
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || ''
            });
          }
        } catch (error) {
          console.warn("Error fetching user profile from Firestore (using Auth fallback):", error);
          // Fallback mechanism for permission errors
          setUser({
             id: firebaseUser.uid,
             name: firebaseUser.displayName || 'User',
             email: firebaseUser.email || ''
          });
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setIsLoading(false);
    });

    // Clean up the subscription
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const loggedInUser = await userService.authenticateUser(email, password);
      setUser(loggedInUser);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const newUser = await userService.createUser(name, email, password);
      setUser(newUser); // Firebase Auth state change will also trigger this
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await userService.logoutUser();
    // setUser will be handled by onAuthStateChanged listener
  };

  const deleteAccount = async (uid: string) => {
    setIsLoading(true);
    try {
      await userService.deleteUserAccount(uid);
      // setUser will be handled by onAuthStateChanged listener after delete
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};