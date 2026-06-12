export interface CurrentUser {
  id: string;
  username: string;
  nickname?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: CurrentUser;
}
