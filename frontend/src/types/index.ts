export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'done';
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  status?: 'open' | 'in_progress' | 'done';
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'open' | 'in_progress' | 'done';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
} 