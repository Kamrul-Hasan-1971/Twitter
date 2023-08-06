import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TwitterApiService } from '../../services/api/twitter-api.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-twitter-login',
  templateUrl: './twitter-login.component.html',
  styleUrls: ['./twitter-login.component.scss'],
})
export class TwitterLoginComponent implements OnInit {
  loginForm: FormGroup;
  formSubmitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private twitterApiService: TwitterApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    this.formSubmitted = true;
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.twitterApiService.login(email, password).subscribe(
        (response) => {
          console.log('Login successful:', response);
          this.authService.setToken(response.token);
          this.router.navigate(['/home']);
        },
        (error) => {
          console.error('Login failed:', error);
        }
      );
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  markAllFieldsAsTouched() {
    for (const controlName in this.loginForm.controls) {
      if (this.loginForm.controls.hasOwnProperty(controlName)) {
        this.loginForm.controls[controlName].markAsTouched();
      }
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.loginForm.get(fieldName);
    return (
      control.invalid &&
      (control.touched || control.dirty || this.formSubmitted)
    );
  }

  navigateToRegister(): void {
    this.router.navigate(['auth/register']);
  }
}
