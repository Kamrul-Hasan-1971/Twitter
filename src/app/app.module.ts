import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthInterceptor } from './interceptors/auth/auth.interceptor';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { environment } from 'src/environments/environment';
import { ErrorDialogComponent } from './common/error-dialog/error-dialog.component';
import { ConfirmDialogComponent } from './common/confirm-dialog/confirm-dialog.component';

@NgModule({
  declarations: [AppComponent, ErrorDialogComponent, ConfirmDialogComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,

    // Angular Material modules
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatOptionModule,
    FlexLayoutModule,

    // Initialize Firebase services
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
