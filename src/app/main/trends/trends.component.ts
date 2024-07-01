import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, interval, from } from 'rxjs';
import { switchMap, startWith, takeUntil } from 'rxjs/operators';
import { TwitterApiService } from 'src/app/services/api/twitter-api.service';
import { SharedDataService } from 'src/app/services/data/shared-data.service';

@Component({
  selector: 'app-trends',
  templateUrl: './trends.component.html',
  styleUrls: ['./trends.component.scss']
})
export class TrendsComponent implements OnInit, OnDestroy {
  private pollingIntervalMs = 5 * 60 * 1000; // Poll every 5 minutes
  private pollingSubscription: Subscription | undefined;
  trends: string[] = [];

  constructor(
    private twitterApiService: TwitterApiService, 
    private sharedDataService: SharedDataService
  ) { }

  ngOnInit(): void {
    // Fetch trends initially
    this.fetchTrends();

    // Start polling every 5 minutes after initial fetch
    this.pollingSubscription = interval(this.pollingIntervalMs).pipe(
      startWith(0), // Emit initial value to trigger immediate fetch
      switchMap(() => this.twitterApiService.getHashTrends()),
      takeUntil(this.sharedDataService.destroy$) // Stop polling when component is destroyed
    ).subscribe((hashTags: string[]) => {
      this.trends = hashTags;
    });
  }

  fetchTrends() {
    this.twitterApiService.getHashTrends().subscribe((hashTags: string[]) => {
      this.trends = hashTags;
    });
  }

  ngOnDestroy(): void {
    this.sharedDataService.destroy$.next(); // Emit signal to complete interval and subscription
    this.sharedDataService.destroy$.complete(); // Complete the subject to release resources

    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }
}
