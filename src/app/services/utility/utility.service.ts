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

  getTimeSincePublished(published: number): string {
    const now = new Date();
    const publishedDate = new Date(published);
    const elapsedMinutes = Math.floor(
      (now.getTime() - publishedDate.getTime()) / (1000 * 60)
    );

    if (elapsedMinutes < 1) {
      return 'Just now';
    } else if (elapsedMinutes < 60) {
      return `${elapsedMinutes} min ago`;
    } else if (elapsedMinutes < 1440) {
      const hours = Math.floor(elapsedMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(elapsedMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }
}
