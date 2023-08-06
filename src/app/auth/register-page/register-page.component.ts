import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TwitterApiService } from 'src/app/services/api/twitter-api.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss'],
})
export class RegisterPageComponent implements OnInit {
  registerForm: FormGroup;
  formSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private twitterApiService: TwitterApiService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    this.formSubmitted = true;

    if (this.registerForm.valid) {
      const { username, password, email } = this.registerForm.value;
      this.twitterApiService.signup(username, password, email).subscribe(
        (response) => {
          console.log(
            'Registration successful:',
            response,
            'password',
            password
          );

          this.twitterApiService.login(email, password).subscribe(
            (loginResponse) => {
              this.authService.setToken(loginResponse.token);
              this.router.navigate(['/home']);
            },
            (loginError) => {
              console.error('Login failed:', loginError);
            }
          );
        },
        (error) => {
          console.error('Registration failed:', error);
        }
      );
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  markAllFieldsAsTouched() {
    for (const controlName in this.registerForm.controls) {
      if (this.registerForm.controls.hasOwnProperty(controlName)) {
        this.registerForm.controls[controlName].markAsTouched();
      }
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.registerForm.get(fieldName);
    return (
      control.invalid &&
      (control.touched || control.dirty || this.formSubmitted)
    );
  }

  navigateToLogIn(): void {
    this.router.navigate(['auth/login']);
  }
}
