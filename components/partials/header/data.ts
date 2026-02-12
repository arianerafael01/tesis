

export const notifications: Notification[] = [];

export type Notification = {
  id: number;
  title: string;
  role?: string;
  desc: string;
  avatar: string;
  status?: string;
  unreadmessage: boolean;
  date: string;
}

