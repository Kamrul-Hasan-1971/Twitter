export interface IUser {
  userId: string
  username: string;
  email: string;
  active: boolean;
  isFollowing?: boolean;
}
