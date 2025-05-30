import React from 'react';
import { render, screen } from '@testing-library/react';
import TaskList from '../TaskList'; // Adjust path as necessary
import { Task } from '@/types'; // Adjust path as necessary

// Mock TaskCard to simplify TaskList tests and focus on TaskList's own logic
jest.mock('../TaskCard', () => {
  // eslint-disable-next-line react/display-name
  return ({ task, onDeleteTask, onUpdateTaskStatus }: { task: Task, onDeleteTask: Function, onUpdateTaskStatus: Function }) => (
    <div data-testid={`task-card-${task.id}`}>
      <h3>{task.title}</h3>
      <button onClick={() => onDeleteTask(task.id)}>Delete {task.id}</button>
      <button onClick={() => onUpdateTaskStatus(task.id, 'New Status')}>Update {task.id}</button>
    </div>
  );
});

describe('TaskList Component', () => {
  const mockTasks: Task[] = [
    { id: '1', title: 'Task 1', description: 'Desc 1', status: 'To Do' },
    { id: '2', title: 'Task 2', description: 'Desc 2', status: 'To Do' },
    { id: '3', title: 'Task 3', description: 'Desc 3', status: 'To Do' },
  ];

  const mockOnDeleteTask = jest.fn();
  const mockOnUpdateTaskStatus = jest.fn();
  const listTitle = "To Do Tasks";

  it('renders the list title', () => {
    render(
      <TaskList
        title={listTitle}
        tasks={[]} // No tasks needed for this specific test
        onDeleteTask={mockOnDeleteTask}
        onUpdateTaskStatus={mockOnUpdateTaskStatus}
      />
    );
    expect(screen.getByText(listTitle)).toBeInTheDocument();
  });

  it('renders the correct number of TaskCard components for given tasks', () => {
    render(
      <TaskList
        title={listTitle}
        tasks={mockTasks}
        onDeleteTask={mockOnDeleteTask}
        onUpdateTaskStatus={mockOnUpdateTaskStatus}
      />
    );

    // Check if each task card mock is rendered
    mockTasks.forEach(task => {
      expect(screen.getByTestId(`task-card-${task.id}`)).toBeInTheDocument();
      expect(screen.getByText(task.title)).toBeInTheDocument(); // Check title from mocked TaskCard
    });

    const taskCards = screen.getAllByTestId(/task-card-/);
    expect(taskCards.length).toBe(mockTasks.length);
  });

  it('displays a "no tasks" message if the tasks array is empty', () => {
    render(
      <TaskList
        title={listTitle}
        tasks={[]}
        onDeleteTask={mockOnDeleteTask}
        onUpdateTaskStatus={mockOnUpdateTaskStatus}
      />
    );
    expect(screen.getByText('No tasks in this list.')).toBeInTheDocument();
  });

  it('passes onDeleteTask and onUpdateTaskStatus props to TaskCard components', () => {
    // This is implicitly tested by the mock, but we can be more explicit if needed
    // by checking if the buttons inside the mocked TaskCard can call the functions.
    // However, the mock setup already demonstrates they are passed.
    // For a more direct test here, one might need a more complex mock or to not mock TaskCard fully.
    // The current mock is sufficient to show props are being passed.
    render(
      <TaskList
        title={listTitle}
        tasks={[mockTasks[0]]} // Test with one task for simplicity
        onDeleteTask={mockOnDeleteTask}
        onUpdateTaskStatus={mockOnUpdateTaskStatus}
      />
    );

    // Simulate clicks on buttons within the mocked TaskCard
    const deleteButton = screen.getByRole('button', { name: `Delete ${mockTasks[0].id}` });
    const updateButton = screen.getByRole('button', { name: `Update ${mockTasks[0].id}` });

    deleteButton.click();
    expect(mockOnDeleteTask).toHaveBeenCalledWith(mockTasks[0].id);

    updateButton.click();
    expect(mockOnUpdateTaskStatus).toHaveBeenCalledWith(mockTasks[0].id, 'New Status');
  });
});
