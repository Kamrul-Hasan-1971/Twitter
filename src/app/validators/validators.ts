// validators/custom-validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    confirmPassword?.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }

  return null;
};

export const mobileNumberValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const mobileRegex = /^[0-9]{10}$/; // Adjust the regex based on your requirements

  if (control.value && !mobileRegex.test(control.value)) {
    return { invalidMobile: true };
  }

  return null;
};
