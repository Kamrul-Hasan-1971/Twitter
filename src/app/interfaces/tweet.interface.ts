export interface Tweet {
  id: string;
  username: string;
  publishedTime: number;
  content: string;
  user: {
    active: boolean;
    email: string;
    id: string;
    username: string;
  };
}
