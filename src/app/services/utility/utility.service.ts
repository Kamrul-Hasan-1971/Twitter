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

  formatTweetContent(content: string): { text: string; type: 'text' | 'hashtag' | 'mention'; link?: string }[] {
    const parts: { text: string; type: 'text' | 'hashtag' | 'mention'; link?: string }[] = [];
    let startIndex = 0;

    while (startIndex < content.length) {
      if (content[startIndex] === '#') {
        const endIndex = this.findEndOfHashtag(content, startIndex);
        const hashtag = content.substring(startIndex, endIndex);
        parts.push({ text: hashtag, type: 'hashtag' });
        startIndex = endIndex;
      } else if (content[startIndex] === '@') {
        const endIndex = this.findEndOfMention(content, startIndex);
        const mention = content.substring(startIndex, endIndex);
        parts.push({ text: mention, type: 'mention' });
        startIndex = endIndex;
      } else {
        const endIndex = this.findEndOfPlainText(content, startIndex);
        const plainText = content.substring(startIndex, endIndex);
        parts.push({ text: plainText, type: 'text' });
        startIndex = endIndex;
      }
    }

    return parts;
  }

  private findEndOfHashtag(content: string, startIndex: number): number {
    let endIndex = startIndex + 1;
    while (endIndex < content.length && this.isValidHashtagCharacter(content[endIndex])) {
      endIndex++;
    }
    return endIndex;
  }

  private isValidHashtagCharacter(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char); // Allow letters, numbers, and underscore in hashtags
  }

  private findEndOfMention(content: string, startIndex: number): number {
    let endIndex = startIndex + 1;
    while (endIndex < content.length && this.isValidMentionCharacter(content[endIndex])) {
      endIndex++;
    }
    return endIndex;
  }

  private isValidMentionCharacter(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char); // Allow letters, numbers, and underscore in mentions
  }

  private findEndOfPlainText(content: string, startIndex: number): number {
    let endIndex = startIndex;
    while (endIndex < content.length && !this.isSpecialCharacter(content[endIndex])) {
      endIndex++;
    }
    return endIndex;
  }

  private isSpecialCharacter(char: string): boolean {
    return char === '#' || char === '@';
  }

}
