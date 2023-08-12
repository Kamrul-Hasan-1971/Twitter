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
