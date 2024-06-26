import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { TwitterApiService } from '../../services/api/twitter-api.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { Subscription } from 'rxjs';
//import { AuthService as AuthServiceV2 } from '../../services/auth copy/auth.service'
import { FirebaseError } from 'firebase/app';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from 'src/app/common/error-dialog/error-dialog.component';

@Component({
  selector: 'app-twitter-login',
  templateUrl: './twitter-login.component.html',
  styleUrls: ['./twitter-login.component.scss'],
})
export class TwitterLoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  formSubmitted: boolean = false;
  subscriptions : Subscription[] = [];
  loading: boolean = false;
  emailLoginloading: boolean = false;


  constructor(
    private fb: FormBuilder,
    // private twitterApiService: TwitterApiService,
    private authService: AuthService,
    //private authServiceV2: AuthServiceV2,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.initializeLoginForm();
  }

  initializeLoginForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  loginWithEmail() {
    this.emailLoginloading = true;
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;

    if (this.loginForm.valid) {
      this.authService
        .loginWithEmail(email, password)
        .then((userAuthCredential) => {
          //console.log('Successfully logged in.', userAuthCredential);
          this.emailLoginloading = false;
          this.redirectToHome();
        })
        .catch((error) => {
          this.emailLoginloading = false;
          this.showErrorDialog(`Authentication failed. ${error.message}`);
        });
    } else {
      const validationErrors = Object.keys(this.loginForm.controls)
        .filter((control) => this.loginForm.controls[control].invalid)
        .map((control) => {
          if (this.loginForm.controls[control].hasError('required')) {
            return `- ${
              control.charAt(0).toUpperCase() + control.slice(1)
            } is required`;
          } else if (this.loginForm.controls[control].hasError('email')) {
            return `- Invalid email address`;
          } else if (this.loginForm.controls[control].hasError('minlength')) {
            return `- ${
              control.charAt(0).toUpperCase() + control.slice(1)
            } should have at least ${
              this.loginForm.controls[control].getError('minlength')
                .requiredLength
            } characters`;
          }
          return '';
        })
        .join('\n');

      this.emailLoginloading = false;
      this.showErrorDialog(validationErrors, 'Errors');
    }
  }

  loginWithGoogle() {
    this.loading = true;
    this.authService
      .loginWithGoogle()
      .then((userAuthCredential) => {
        console.log('Successfully logged in.', userAuthCredential);
        this.loading = false;
        this.redirectToHome();
      })
      .catch((error) => {
        this.loading = false;
        if (error instanceof FirebaseError) {
          if (error.code === 'auth/cancelled-popup-request') {
            console.warn(
              'Google sign-in popup request was cancelled by the user.'
            );
          } else {
            this.showErrorDialog(`Authentication failed. ${error.message}`);
          }
        } else if (error instanceof Error) {
          this.showErrorDialog(error.message);
        } else {
          this.showErrorDialog(
            'Something went wrong during Google login. Please try again later.'
          );
          console.error('Google login error', error);
        }
      });
  }

  // onSubmit() {
  //   this.formSubmitted = true;
  //   if (this.loginForm.valid) {
  //     this.loading = true;
  //     const { email, password } = this.loginForm.value;
  //     this.subscriptions.push(this.twitterApiService.login(email, password).subscribe(
  //       (response) => {
  //         this.loading = false;
  //         console.log('Login successful:', response);
  //         this.authService.setToken(response.token);
  //         this.redirectToHome();
  //       },
  //       (error) => {
  //         this.loading = false;
  //         console.error('Login failed:', error);
  //       }
  //     ));
  //   } else {
  //     //this.markAllFieldsAsTouched();
  //   }
  // }

  // markAllFieldsAsTouched() {
  //   for (const controlName in this.loginForm.controls) {
  //     if (this.loginForm.controls.hasOwnProperty(controlName)) {
  //       this.loginForm.controls[controlName].markAsTouched();
  //     }
  //   }
  // }

  // isFieldInvalid(fieldName: string): boolean {
  //   const control = this.loginForm.get(fieldName);
  //   return (
  //     control.invalid &&
  //     (control.dirty || this.formSubmitted)
  //   );
  // }

  navigateToRegister(): void {
    this.router.navigate(['auth/register']);
  }

  redirectToHome() {
    this.router.navigate(['/home']);
  }

  showErrorDialog(message: string, title: string = 'Error'): void {
    const dialogRef = this.dialog.open(ErrorDialogComponent, {
      data: { title, message, enableRetry: false },
      width: '450px',
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription=>{
      subscription.unsubscribe();
    })
  }
}
