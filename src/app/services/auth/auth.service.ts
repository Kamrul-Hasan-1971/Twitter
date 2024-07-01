import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  User,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  user,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { createUserWithEmailAndPassword } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  adminEmails = [
    'icthasan36@gmail.com',
    'kamrulhsn1952@gmail.com',
    'mohiuddinahammadmaruf2726@gmail.com',
    'kelownahalalbangladeshibazar@gmail.com',
  ];
  private auth: Auth = inject(Auth);
  private provider = new GoogleAuthProvider();
  public isAdmin: boolean = false;

  user$ = user(this.auth);
  private currentUser: User | null = null;

  constructor(private router: Router) {
    this.authStatusListener();
  }

  authStatusListener() {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUser = user;
        if (this.currentUser.email) {
          this.isAdmin = this.adminEmails.includes(this.currentUser.email);
        }
        console.log('User is logged in');
      } else {
        console.log('User is logged out');
      }
    });
  }

  async loginWithGoogle() {
    try {
      const result = await signInWithPopup(this.auth, this.provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      return credential;
    } catch (error) {
      console.error('Error during Google login: ', error);
      throw error;
    }
  }

  async loginWithEmail(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const credential =
        GoogleAuthProvider.credentialFromResult(userCredential);
      return credential;
    } catch (error) {
      console.error('Error during email/password login: ', error);
      throw error;
    }
  }

  async registrationWithEmail(email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const credential =
        GoogleAuthProvider.credentialFromResult(userCredential);
      return credential;
    } catch (error) {
      console.error('Error during email/password registration: ', error);
      throw error;
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      console.log('Successfully signed out.');
      this.router.navigate(['auth/login']);
    } catch (error) {
      console.error('Error during sign out: ', error);
      throw error;
    }
  }

  async getToken() {
    try {
      const idToken = await this.auth.currentUser?.getIdToken();
      return idToken || '';
    } catch (error) {
      console.error('Error getting ID token: ', error);
      throw error;
    }
  }

  getUserPhoto() {
    return this.currentUser && this.currentUser.photoURL
      ? this.currentUser.photoURL
      : '';
  }

  getUserId(): string {
    return this.currentUser?.uid || '';
  }

  getUserEmail(): string {
    return this.currentUser?.email || '';
  }

  getUserName(): string{
    return 'Kamrul'; //TODO: temporary
  }

  get isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }
}
