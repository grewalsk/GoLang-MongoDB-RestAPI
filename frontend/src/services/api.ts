import { Task, CreateTaskRequest, UpdateTaskRequest, LoginRequest, LoginResponse, ApiResponse, ApiError } from '../types';

const API_BASE_URL = 'http://localhost:8080/v1';

class ApiService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: 'network_error',
        message: 'Network error occurred'
      }));
      throw new Error(errorData.message || 'Request failed');
    }

    return response.json();
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.token = response.token;
    localStorage.setItem('auth_token', response.token);
    
    return response;
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Task methods
  async getTasks(): Promise<Task[]> {
    const response = await this.request<ApiResponse<Task[]>>('/tasks');
    return response.data;
  }

  async getTask(id: string): Promise<Task> {
    const response = await this.request<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data;
  }

  async createTask(task: CreateTaskRequest): Promise<Task> {
    const response = await this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
    return response;
  }

  async updateTask(id: string, updates: UpdateTaskRequest): Promise<Task> {
    const response = await this.request<ApiResponse<Task>>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return response.data;
  }

  async deleteTask(id: string): Promise<void> {
    await this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService(); 