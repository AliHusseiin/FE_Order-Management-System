export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
  userId: number;
}

export interface ApiResponse<T> {
  message: string;
  statusCode: number;
  success: boolean;
  timestamp: string;
  data: T;
}

export interface User {
  id: number;
  username: string;
  role: string;
}