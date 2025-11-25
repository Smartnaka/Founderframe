
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
  resendVerification: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkVerification: () => Promise<boolean>;
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
        try {
          const userProfile = await userService.getUserProfile(firebaseUser.uid);
          if (userProfile) {
            setUser({ ...userProfile, emailVerified: firebaseUser.emailVerified });
          } else {
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              emailVerified: firebaseUser.emailVerified
            });
          }
        } catch (error) {
          console.warn("Error fetching user profile (using Auth fallback):", error);
          setUser({
             id: firebaseUser.uid,
             name: firebaseUser.displayName || 'User',
             email: firebaseUser.email || '',
             emailVerified: firebaseUser.emailVerified
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await userService.authenticateUser(email, password);
      // setUser handled by listener
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      await userService.createUser(name, email, password);
      // setUser handled by listener (user stays logged in now)
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async (email: string, password: string) => {
    setIsLoading(true);
    try {
        await userService.resendVerificationEmail(email, password);
    } finally {
        setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
        await userService.resetPassword(email);
    } finally {
        setIsLoading(false);
    }
  };

  const checkVerification = async (): Promise<boolean> => {
      if (auth.currentUser) {
          await userService.reloadUser();
          // Update local state to reflect change
          const isVerified = auth.currentUser.emailVerified;
          if (user) {
              setUser(prev => prev ? { ...prev, emailVerified: isVerified } : null);
          }
          return isVerified;
      }
      return false;
  };

  const logout = async () => {
    await userService.logoutUser();
  };

  const deleteAccount = async (uid: string) => {
    setIsLoading(true);
    try {
      await userService.deleteUserAccount(uid);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, resendVerification, resetPassword, checkVerification, logout, deleteAccount }}>
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
