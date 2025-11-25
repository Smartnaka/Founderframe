
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, sendEmailVerification, sendPasswordResetEmail, User as FirebaseAuthUser } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types';

export const userService = {
  async createUser(name: string, email: string, password: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update the Auth profile with the name immediately.
      await updateProfile(firebaseUser, { displayName: name });

      const newUser: User = {
        id: firebaseUser.uid,
        name,
        email,
        emailVerified: false // Initially false
      };

      // Attempt to store additional user profile data in Firestore.
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      } catch (dbError) {
        console.warn("Firestore write failed (likely permission issues), but Auth succeeded.", dbError);
      }

      // Send Verification Email
      await sendEmailVerification(firebaseUser);

      // Note: We do NOT sign out here anymore. 
      // We let the user stay logged in so the UI can guide them to verify.

    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('User with this email already exists.');
      }
      throw new Error(error.message || 'Failed to create user.');
    }
  },

  async authenticateUser(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Note: We do NOT block login for unverified users here anymore.
      // We return the user (with emailVerified status) and let the App UI handle the blocking overlay.

      // Try to get profile from Firestore
      try {
        const userProfile = await userService.getUserProfile(firebaseUser.uid);
        if (userProfile) {
          return { ...userProfile, emailVerified: firebaseUser.emailVerified };
        }
      } catch (dbError) {
         console.warn("Could not fetch Firestore profile, falling back to Auth data.");
      }

      // Fallback if Firestore fails or is empty
      return {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        emailVerified: firebaseUser.emailVerified
      };

    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password.');
      }
      throw new Error(error.message || 'Authentication failed.');
    }
  },

  async resendVerificationEmail(email: string, password: string): Promise<void> {
    try {
        // If user is already logged in, use currentUser
        if (auth.currentUser && auth.currentUser.email === email) {
            if (!auth.currentUser.emailVerified) {
                await sendEmailVerification(auth.currentUser);
                return;
            }
        }

        // Otherwise sign in to get the user object
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
            await sendEmailVerification(userCredential.user);
            // We don't sign out, to keep them in the "unverified" state
        } else {
            throw new Error("Email is already verified.");
        }
    } catch (error: any) {
        throw new Error(error.message || "Failed to resend verification email.");
    }
  },

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message || "Failed to send password reset email.");
    }
  },

  async getUserProfile(uid: string): Promise<User | null> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
          id: data.id,
          name: data.name,
          email: data.email,
          emailVerified: auth.currentUser?.emailVerified || false // Use current auth state for truth
      };
    } else {
      return null;
    }
  },

  async logoutUser(): Promise<void> {
    await signOut(auth);
  },

  async deleteUserAccount(uid: string): Promise<void> {
    const firebaseUser = auth.currentUser;
    if (firebaseUser && firebaseUser.uid === uid) {
      try {
        await deleteDoc(doc(db, 'users', uid));
      } catch (e) {
        console.warn("Failed to delete Firestore doc", e);
      }
      await firebaseUser.delete();
    } else {
      throw new Error("Cannot delete account: User not authenticated or ID mismatch.");
    }
  },
  
  async reloadUser(): Promise<void> {
    if (auth.currentUser) {
        await auth.currentUser.reload();
    }
  }
};
