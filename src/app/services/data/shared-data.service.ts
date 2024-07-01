import { Injectable } from '@angular/core';
import { User } from 'src/app/interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  followingIdsSet: Set<string>;
  users: User[];

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

  seUsersList(users: User[]) {
    this.users = users;
  }

  geUsersList(users: User[]) {
    return this.users || [];
  }

}
