import { getTasks, createTask, updateTask, deleteTask, getTaskById } from '../api';
import { Task, CreateTaskPayload, UpdateTaskPayload } from '@/types';

// Mock the global fetch function
const mockFetch = global.fetch as jest.Mock;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1';

describe('API Service', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  // Test suite for getTasks
  describe('getTasks', () => {
    it('should fetch tasks successfully', async () => {
      const mockTasks: Task[] = [{ id: '1', title: 'Test Task', status: 'To Do' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasks,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });

      const tasks = await getTasks();
      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/tasks`);
      expect(tasks).toEqual(mockTasks);
    });

    it('should fetch tasks with status query parameter', async () => {
      const mockTasks: Task[] = [{ id: '1', title: 'Test Task', status: 'In Progress' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasks,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });

      const status = 'In Progress';
      const tasks = await getTasks(status);
      // URLSearchParams encodes space as '+' or %20. Let's build the expected URL robustly.
      const expectedUrl = new URL(`${API_BASE_URL}/tasks`);
      expectedUrl.searchParams.append('status', status);
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl.toString());
      expect(tasks).toEqual(mockTasks);
    });

    it('should throw an error if fetching tasks fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server Error' }),
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });

      await expect(getTasks()).rejects.toThrow('Server Error');
    });
  });

  // Test suite for createTask
  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const taskData: CreateTaskPayload = { title: 'New Task', description: 'A new task', status: 'To Do' };
      const mockCreatedTask: Task = { id: '2', ...taskData };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCreatedTask,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });

      const createdTask = await createTask(taskData);
      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      expect(createdTask).toEqual(mockCreatedTask);
    });

    it('should throw an error if creating a task fails', async () => {
      const taskData: CreateTaskPayload = { title: 'New Task' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Bad Request' }),
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });
      await expect(createTask(taskData)).rejects.toThrow('Bad Request');
    });
  });

  // Test suite for updateTask
  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const taskId = '1';
      const updates: UpdateTaskPayload = { status: 'Completed' };
      const mockUpdatedTask: Task = { id: taskId, title: 'Old Title', status: 'Completed' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedTask,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });

      const updatedTask = await updateTask(taskId, updates);
      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      expect(updatedTask).toEqual(mockUpdatedTask);
    });

    it('should throw an error if updating a task fails', async () => {
      const taskId = '1';
      const updates: UpdateTaskPayload = { status: 'Completed' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not Found' }),
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });
      await expect(updateTask(taskId, updates)).rejects.toThrow('Not Found');
    });
  });

  // Test suite for deleteTask
  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      const taskId = '1';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        // No JSON body for a successful 204 No Content response
        headers: new Headers(),
      });

      await deleteTask(taskId);
      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
      });
    });

    it('should throw an error if deleting a task fails', async () => {
      const taskId = '1';
       mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server Error' }),
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });
      await expect(deleteTask(taskId)).rejects.toThrow('Server Error');
    });
  });

  // Test suite for getTaskById
  describe('getTaskById', () => {
    it('should fetch a single task successfully', async () => {
      const taskId = '1';
      const mockTask: Task = { id: taskId, title: 'Specific Task', status: 'In Progress' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTask,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });

      const task = await getTaskById(taskId);
      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/tasks/${taskId}`);
      expect(task).toEqual(mockTask);
    });

    it('should throw an error if fetching a single task fails', async () => {
      const taskId = '1';
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not Found' }),
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });
      await expect(getTaskById(taskId)).rejects.toThrow('Not Found');
    });
  });
});
