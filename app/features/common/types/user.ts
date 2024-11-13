export type User = {
  id: number;
  uid: string;
  profileId: string;
  email?: string;
  iconUrl?: string;
  displayName: string;
  nickname: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: number;
};
