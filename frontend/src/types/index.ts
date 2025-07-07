// Tipos globais do VotaFacil

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  options: string[];
  expiresAt: string;
  image?: string;
  createdBy: User;
  votes: Vote[];
  closed: boolean;
  createdAt: string;
}

export interface Vote {
  user: string;
  option: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
