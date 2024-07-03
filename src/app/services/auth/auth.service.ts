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
import { CollectionReference, DocumentData, Firestore, collection, doc, setDoc } from '@angular/fire/firestore';
import { IUser } from 'src/app/interfaces/user.interface';

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
  usersCollectionRef: CollectionReference<DocumentData>; 

  constructor(
    private router: Router,
    private firestore: Firestore,
  ) {
    this.authStatusListener();
    this.usersCollectionRef = collection(this.firestore, 'users');
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
      if(result?.user?.metadata?.creationTime === result?.user?.metadata?.lastSignInTime) {
        const newUserData: IUser = {
          userId: result?.user?.uid,
          username: result?.user?.displayName,
          email: result?.user?.email,
          active: true
        };
        await this.storeUserData(newUserData);
      }
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

  async registrationWithEmail(email: string, password: string, userName: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const newUserData: IUser = {
        userId: userCredential?.user?.uid,
        username: userName,
        email: email,
        active: true
      };
      await this.storeUserData(newUserData);
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

  async storeUserData(user: IUser) {
    const userRef = doc(this.usersCollectionRef, user.email);
    try {
      console.log("Storing new user data..");
      await setDoc(userRef, user);
      console.log('User data stored successfully.');
    } catch (error) {
      console.error('Error storing user data: ', error);
      throw error;
    }
  }
}
