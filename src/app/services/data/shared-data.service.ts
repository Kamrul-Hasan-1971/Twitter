import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Tweet } from 'src/app/interfaces/tweet.interface';
import { IUser } from 'src/app/interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  followingIdsSet: Set<string>;
  users: IUser[];
  updateTweetList: Subject<{doc:Tweet, type: string}> = new Subject();
  destroy$ = new Subject<void>(); // Subject to signal component destruction



  constructor() {
    this.followingIdsSet = new Set<string>();
  }

  setFollowingEmailList(followingList: string[]) {
    // Clear the existing set
    this.followingIdsSet.clear();

    // Add new elements from followingList to the set
    followingList.forEach(id => {
      this.followingIdsSet.add(id);
    });
  }

  getFollowingEmailList(): Set<string> {
    return this.followingIdsSet;
  }

  seUsersList(users: IUser[]) {
    this.users = users;
  }

  geUsersList(users: IUser[]) {
    return this.users || [];
  }

}
