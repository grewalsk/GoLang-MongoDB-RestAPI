import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event'; // For more realistic user interactions
import TaskBoard from '../TaskBoard'; // Adjust path as necessary
import * as apiService from '@/services/api'; // Mock the entire module
import { Task } from '@/types';

// Mock the api service module
jest.mock('@/services/api');
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

// Mock TaskList to simplify TaskBoard tests
jest.mock('../TaskList', () => {
  // eslint-disable-next-line react/display-name
  return ({ title, tasks }: { title: string, tasks: Task[] }) => (
    <div data-testid={`task-list-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <h2>{title}</h2>
      {tasks.map(task => <div key={task.id} data-testid={`task-${task.id}`}>{task.title}</div>)}
    </div>
  );
});


describe('TaskBoard Component', () => {
  const mockTasksData: Task[] = [ // Renamed to avoid conflict in scope
    { id: '1', title: 'Task 1', description: 'Desc 1', status: 'To Do', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '2', title: 'Task 2', description: 'Desc 2', status: 'In Progress', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()},
    { id: '3', title: 'Task 3', description: 'Desc 3', status: 'Completed', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    mockedApiService.getTasks.mockClear();
    mockedApiService.createTask.mockClear();
    mockedApiService.deleteTask.mockClear();
    mockedApiService.updateTask.mockClear();

    // Default mock implementation for getTasks
    mockedApiService.getTasks.mockResolvedValue([...mockTasksData]); // Use a copy
    // Default mock implementation for createTask
    mockedApiService.createTask.mockImplementation(async (payload) => {
      return {
        id: 'new-task-id',
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Task;
    });
    mockedApiService.deleteTask.mockResolvedValue(undefined);
    mockedApiService.updateTask.mockImplementation(async (id, payload) => {
        const originalTask = mockTasksData.find(t => t.id === id);
        return { ...originalTask!, ...payload } as Task;
    });
  });

  it('fetches tasks on mount and displays them in respective lists', async () => {
    render(<TaskBoard />);

    expect(mockedApiService.getTasks).toHaveBeenCalledTimes(1);

    // Wait specifically for task elements to appear
    await waitFor(() => {
      expect(within(screen.getByTestId('task-list-to-do')).getByText('Task 1')).toBeInTheDocument();
    });

    expect(within(screen.getByTestId('task-list-in-progress')).getByText('Task 2')).toBeInTheDocument();
    expect(within(screen.getByTestId('task-list-completed')).getByText('Task 3')).toBeInTheDocument();
  });

  it('allows creating a new task', async () => {
    const user = userEvent.setup();

    const initialTasks: Task[] = []; // Start with no tasks for this test
    const newlyCreatedTask: Task = {
        id: 'new-task-id',
        title: 'New Test Task',
        description: 'A description for the new task',
        status: 'In Progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    mockedApiService.getTasks.mockResolvedValueOnce(initialTasks); // First call
    mockedApiService.createTask.mockResolvedValueOnce(newlyCreatedTask);
    // After creation, getTasks will be called again. It should return the list including the new task.
    mockedApiService.getTasks.mockResolvedValueOnce([newlyCreatedTask]);


    render(<TaskBoard />);

    // Wait for initial render (even if no tasks, the lists should be there)
    await waitFor(() => expect(screen.getByTestId('task-list-to-do')).toBeInTheDocument());
    expect(mockedApiService.getTasks).toHaveBeenCalledTimes(1);


    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const statusSelect = screen.getByLabelText(/status/i);
    const addButton = screen.getByRole('button', { name: /add task/i });

    const newTaskTitle = 'New Test Task';
    const newTaskDesc = 'A description for the new task';
    const newTaskStatus = 'In Progress';

    await user.type(titleInput, newTaskTitle);
    await user.type(descriptionInput, newTaskDesc);
    await user.selectOptions(statusSelect, newTaskStatus);
    await user.click(addButton);

    await waitFor(() => {
      expect(mockedApiService.createTask).toHaveBeenCalledTimes(1);
      expect(mockedApiService.createTask).toHaveBeenCalledWith({
        title: newTaskTitle,
        description: newTaskDesc,
        status: newTaskStatus,
      });
    });

    // Check if getTasks is called again to refresh the list
    expect(mockedApiService.getTasks).toHaveBeenCalledTimes(2);
    await waitFor(() => {
        expect(within(screen.getByTestId('task-list-in-progress')).getByText(newTaskTitle)).toBeInTheDocument();
    });
  });

  it('displays an error message if fetching tasks fails', async () => {
    mockedApiService.getTasks.mockRejectedValueOnce(new Error('Failed to fetch'));
    render(<TaskBoard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
  });

  it('displays an error message if creating a task fails', async () => {
    const user = userEvent.setup();
    mockedApiService.getTasks.mockResolvedValueOnce([]);
    mockedApiService.createTask.mockRejectedValueOnce(new Error('Failed to create'));
    render(<TaskBoard />);
    await waitFor(() => expect(mockedApiService.getTasks).toHaveBeenCalled());


    await user.type(screen.getByLabelText(/title/i), 'Error Task');
    await user.click(screen.getByRole('button', { name: /add task/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to create')).toBeInTheDocument();
    });
  });

});
