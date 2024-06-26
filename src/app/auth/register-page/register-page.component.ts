import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TwitterApiService } from 'src/app/services/api/twitter-api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
//import { AuthService as  AuthServiceV2} from 'src/app/services/auth copy/auth.service';
import { passwordMatchValidator } from 'src/app/validators/validators';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from 'src/app/common/error-dialog/error-dialog.component';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss'],
})
export class RegisterPageComponent implements OnInit, OnDestroy {
  registrationLoading = false;
  registerForm: FormGroup;
  formSubmitted = false;
  subscriptions : Subscription[] = [];
  //isSigningUp : boolean = false;

  constructor(
    private fb: FormBuilder,
    private twitterApiService: TwitterApiService,
    private router: Router,
    private authService: AuthService,
    //private authServiceV2: AuthServiceV2,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.initializeRegisterForm();

  }

  initializeRegisterForm() {
    this.registerForm = this.fb.group(
      {
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
      },
      { validator: passwordMatchValidator }
    );
  }

  registerWithEmail() {
    this.registrationLoading = true;
    const userName = this.registerForm.value.username
    const email = this.registerForm.value.email;
    const password = this.registerForm.value.password;
    if (this.registerForm.valid) {
      this.authService
        .registrationWithEmail(email, password)
        .then(() => {
          this.registrationLoading = false;
          this.redirectToHome();
        })
        .catch((error) => {
          this.registrationLoading = false;
          this.showErrorDialog(`Authentication failed. ${error.message}`);
        });
    } else {
      const validationErrors = Object.keys(this.registerForm.controls)
        .filter((control) => this.registerForm.controls[control].invalid)
        .map((control) => this.getValidationErrorMessage(control))
        .join('\n');

      this.registrationLoading = false;
      this.showErrorDialog(validationErrors, 'Errors');
    }
  }

  getValidationErrorMessage(control: string): string {
    const controlErrors = this.registerForm.controls[control].errors || {};

    if (controlErrors['required']) {
      return `- ${
        control.charAt(0).toUpperCase() + control.slice(1)
      } is required`;
    } else if (controlErrors['email']) {
      return `- Invalid email address`;
    } else if (controlErrors['minlength']) {
      return `- ${
        control.charAt(0).toUpperCase() + control.slice(1)
      } should have at least ${
        controlErrors['minlength'].requiredLength
      } characters`;
    } else if (controlErrors['passwordMismatch']) {
      return `- Passwords do not match`;
    }

    return '';
  }

  // onSubmit() {
  //   this.formSubmitted = true;

  //   if (this.registerForm.valid) {
  //     this.isSigningUp = true;
  //     const { username, password, email } = this.registerForm.value;
  //     this.subscriptions.push(this.twitterApiService.signup(username, password, email).subscribe(
  //       (response) => {
  //         console.log(
  //           'Registration successful:',
  //           response,
  //           'password',
  //           password
  //         );

  //         this.subscriptions.push(this.twitterApiService.login(email, password).subscribe(
  //           (loginResponse) => {
  //             this.isSigningUp = false;
  //             this.authService.setToken(loginResponse.token);
  //             this.router.navigate(['/home']);
  //           },
  //           (loginError) => {
  //             this.isSigningUp = false;
  //             console.error('Login failed:', loginError);
  //           }
  //         ));
  //       },
  //       (error) => {
  //         this.isSigningUp = false;
  //         console.error('Registration failed:', error);
  //       }
  //     ));
  //   } else {
  //     //this.markAllFieldsAsTouched();
  //   }
  // }

  // markAllFieldsAsTouched() {
  //   for (const controlName in this.registerForm.controls) {
  //     if (this.registerForm.controls.hasOwnProperty(controlName)) {
  //       this.registerForm.controls[controlName].markAsTouched();
  //     }
  //   }
  // }

  // isFieldInvalid(fieldName: string): boolean {
  //   const control = this.registerForm.get(fieldName);
  //   return (
  //     control.invalid &&
  //     (control.touched || control.dirty || this.formSubmitted)
  //   );
  // }

  navigateToLogIn(): void {
    this.router.navigate(['auth/login']);
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
