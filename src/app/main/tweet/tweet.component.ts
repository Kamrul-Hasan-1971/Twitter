import { Component, EventEmitter, Output } from '@angular/core';
import { Tweet } from '../timeline/timeline.component';
import { TwitterApiService } from 'src/app/services/api/twitter-api.service';

@Component({
  selector: 'app-tweet',
  templateUrl: './tweet.component.html',
  styleUrls: ['./tweet.component.scss'],
})
export class TweetComponent {
  tweetText: string = '';
  charCount: number = 160;
  @Output() tweetCreated = new EventEmitter<Tweet>();

  constructor(private twitterApiService: TwitterApiService) {}

  onInputChange(): void {
    this.charCount = 160 - this.tweetText.length;
  }

  canTweet(): boolean {
    return this.tweetText.trim() !== '' && this.charCount >= 0;
  }

  onTweet(): void {
    if (this.canTweet()) {
      const tweetText = this.tweetText;
      this.tweetText = '';
      this.charCount = 160;
      this.twitterApiService.createTweet(tweetText).subscribe(
        (response: any) => {
          console.log('Tweet created:', response.tweet);
          this.tweetCreated.emit(response.tweet);
        },
        (error) => {
          console.error('Error creating tweet:', error);
        }
      );
    }
  }
}
