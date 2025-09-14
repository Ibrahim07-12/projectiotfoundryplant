import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../config/firebase';
import type { User, LoginCredentials } from '../types/auth';

class AuthService {
  // Login with email and password
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      console.log('🔐 AuthService: Attempting login with:', credentials.email);
      
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password
      );
      
      const firebaseUser = userCredential.user;
      
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName
      };
      
      console.log('✅ AuthService: Login successful:', user);
      return user;
      
    } catch (error: any) {
      console.error('❌ AuthService: Login failed:', error);
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      console.log('🚪 AuthService: Logging out...');
      await signOut(auth);
      console.log('✅ AuthService: Logout successful');
    } catch (error: any) {
      console.error('❌ AuthService: Logout failed:', error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    const firebaseUser = auth.currentUser;
    
    if (firebaseUser) {
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName
      };
    }
    
    return null;
  }

  // Listen for authentication state changes
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    console.log('👂 AuthService: Setting up auth state listener...');
    
    return onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName
        };
        
        console.log('👤 AuthService: User authenticated:', user.email);
        callback(user);
      } else {
        console.log('🚫 AuthService: User not authenticated');
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();
