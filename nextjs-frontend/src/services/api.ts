import { Task, CreateTaskPayload, UpdateTaskPayload } from '@/types'; // Using alias @

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }
  // Check if the response has content before trying to parse it as JSON
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json() as Promise<T>;
  } else {
    // Handle responses with no content (e.g., for DELETE requests)
    return Promise.resolve(undefined as unknown as T);
  }
}

export const getTasks = async (status?: string): Promise<Task[]> => {
  const url = new URL(`${API_BASE_URL}/tasks`);
  if (status) {
    url.searchParams.append('status', status);
  }
  const response = await fetch(url.toString());
  return handleResponse<Task[]>(response);
};

export const createTask = async (taskData: CreateTaskPayload): Promise<Task> => {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });
  return handleResponse<Task>(response);
};

export const updateTask = async (id: string, updates: UpdateTaskPayload): Promise<Task> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PATCH', // Or 'PUT' depending on your API design
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  return handleResponse<Task>(response);
};

export const deleteTask = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
  });
  await handleResponse<void>(response); // handleResponse will resolve to undefined for void
};

// Example of a function to get a single task, if needed later
export const getTaskById = async (id: string): Promise<Task> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
  return handleResponse<Task>(response);
};
