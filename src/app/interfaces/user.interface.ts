export interface User {
  userId: string
  username: string;
  email: string;
  active: boolean;
  isFollowing?: boolean;
}
