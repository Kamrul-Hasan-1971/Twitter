// timeline.component.ts
import { Component, OnInit } from '@angular/core';

export interface Tweet {
  id: number;
  username: string;
  timestamp: string;
  content: string;
  user: {
    active: boolean;
    email: string;
    id: number;
    username: string;
  };
}

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements OnInit {
  tweets: any[] = [
    {
      content: 'Hello World',
      id: 10,
      published: 'Sun, 02 Apr 2023 10:30:18 GMT',
      user: {
        active: true,
        email: 'johndoe@example.com',
        id: 2,
        username: 'johndoe',
      },
    },
    {
      content: 'Exciting news! Just launched my new project.',
      id: 11,
      published: 'Sun, 02 Apr 2023 12:45:22 GMT',
      user: {
        active: true,
        email: 'janedoe@example.com',
        id: 3,
        username: 'janedoe',
      },
    },
  ];

  constructor() {}

  ngOnInit(): void {
    const storedTweets = localStorage.getItem('tweets');
    if (storedTweets) {
      this.tweets = JSON.parse(storedTweets);
    }
  }

  onTweetCreated(newTweet: Tweet) {
    this.tweets.unshift(newTweet);
    localStorage.setItem('tweets', JSON.stringify(this.tweets));
  }

  getTimeSincePublished(published: string): string {
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
