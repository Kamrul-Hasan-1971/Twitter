import { Injectable } from '@angular/core';
import { SHA256 } from 'crypto-js';;

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  constructor() {}

  hashPassword(password: string): string {
    const hashedPassword = SHA256(password).toString();
    return hashedPassword;
  }
}
