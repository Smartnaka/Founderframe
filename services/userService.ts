import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, User as FirebaseAuthUser } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types';

export const userService = {
  async createUser(name: string, email: string, password: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update the Auth profile with the name immediately.
      // This ensures we have the name available even if Firestore writes fail due to permissions.
      await updateProfile(firebaseUser, { displayName: name });

      const newUser: User = {
        id: firebaseUser.uid,
        name,
        email,
      };

      // Attempt to store additional user profile data in Firestore.
      // We wrap this in a try-catch so that if the database rules block the write,
      // the user can still successfully register and use the app.
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      } catch (dbError) {
        console.warn("Firestore write failed (likely permission issues), but Auth succeeded.", dbError);
      }

      return newUser;
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

      // Try to get profile from Firestore
      try {
        const userProfile = await userService.getUserProfile(firebaseUser.uid);
        if (userProfile) {
          return userProfile;
        }
      } catch (dbError) {
         console.warn("Could not fetch Firestore profile, falling back to Auth data.");
      }

      // Fallback if Firestore fails or is empty
      return {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email || ''
      };

    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password.');
      }
      throw new Error(error.message || 'Authentication failed.');
    }
  },

  async getUserProfile(uid: string): Promise<User | null> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as User;
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
      // Try to delete from Firestore, ignore if it fails
      try {
        await deleteDoc(doc(db, 'users', uid));
      } catch (e) {
        console.warn("Failed to delete Firestore doc", e);
      }
      // Then delete the user from Firebase Authentication
      await firebaseUser.delete();
    } else {
      throw new Error("Cannot delete account: User not authenticated or ID mismatch.");
    }
  },
};