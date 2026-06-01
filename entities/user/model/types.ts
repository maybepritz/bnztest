export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface User {
  id: string;
  username: string;
  name: string | null;
  image: string | null;
  isVerified?: boolean;
  email?: string | null;
  bio?: string | null;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  _count?: {
    followers?: number;
    following?: number;
    posts?: number;
  };
  isFollowing?: boolean;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  lastSeen?: string | Date | null;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export type LoginFormErrors = Partial<Record<keyof LoginCredentials, string>>;
