import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskCard from '../TaskCard'; // Adjust path as necessary
import { Task } from '@/types'; // Adjust path as necessary

describe('TaskCard Component', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task Title',
    description: 'Test task description',
    status: 'To Do',
  };

  const mockOnDeleteTask = jest.fn();
  const mockOnUpdateTaskStatus = jest.fn();

  beforeEach(() => {
    // Clear mock call history before each test
    mockOnDeleteTask.mockClear();
    mockOnUpdateTaskStatus.mockClear();
  });

  it('renders task title, description, and status', () => {
    render(
      <TaskCard
        task={mockTask}
        onDeleteTask={mockOnDeleteTask}
        onUpdateTaskStatus={mockOnUpdateTaskStatus}
      />
    );

    expect(screen.getByText(mockTask.title)).toBeInTheDocument();
    expect(screen.getByText(mockTask.description!)).toBeInTheDocument();
    // Custom text matcher for "Current Status: To Do"
    expect(screen.getByText((content, element) => {
        const hasText = (node: Element | null) => node?.textContent === `Current Status: ${mockTask.status}` || (node?.textContent === "Current Status: " && node.nextSibling?.textContent === mockTask.status);
        const elementHasText = hasText(element);
        const childrenDontHaveText = Array.from(element?.children || []).every(child => !hasText(child));
        return elementHasText && childrenDontHaveText;
      })).toBeInTheDocument();
  });

  it('calls onDeleteTask with the task id when delete button is clicked', () => {
    render(
      <TaskCard
        task={mockTask}
        onDeleteTask={mockOnDeleteTask}
        onUpdateTaskStatus={mockOnUpdateTaskStatus}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockOnDeleteTask).toHaveBeenCalledTimes(1);
    expect(mockOnDeleteTask).toHaveBeenCalledWith(mockTask.id);
  });

  it('calls onUpdateTaskStatus with task id and new status when a status change button is clicked', () => {
    render(
      <TaskCard
        task={mockTask} // Current status is "To Do"
        onDeleteTask={mockOnDeleteTask}
        onUpdateTaskStatus={mockOnUpdateTaskStatus}
      />
    );

    // Based on statusOptions in TaskCard, "To Do" can move to "In Progress" or "Completed"
    const moveToInProgressButton = screen.getByRole('button', { name: /move to In Progress/i });
    fireEvent.click(moveToInProgressButton);

    expect(mockOnUpdateTaskStatus).toHaveBeenCalledTimes(1);
    expect(mockOnUpdateTaskStatus).toHaveBeenCalledWith(mockTask.id, 'In Progress');

    mockOnUpdateTaskStatus.mockClear(); // Clear for next button test

    const moveToCompletedButton = screen.getByRole('button', { name: /move to Completed/i });
    fireEvent.click(moveToCompletedButton);

    expect(mockOnUpdateTaskStatus).toHaveBeenCalledTimes(1);
    expect(mockOnUpdateTaskStatus).toHaveBeenCalledWith(mockTask.id, 'Completed');
  });

  it('does not render description if not provided', () => {
    const taskWithoutDescription: Task = { ...mockTask, description: undefined };
    render(
      <TaskCard
        task={taskWithoutDescription}
        onDeleteTask={mockOnDeleteTask}
        onUpdateTaskStatus={mockOnUpdateTaskStatus}
      />
    );
    expect(screen.queryByText(mockTask.description!)).not.toBeInTheDocument();
  });

  it('renders correct status change buttons based on current status', () => {
    const inProgressTask: Task = { ...mockTask, status: 'In Progress' };
    render(
      <TaskCard
        task={inProgressTask}
        onDeleteTask={mockOnDeleteTask}
        onUpdateTaskStatus={mockOnUpdateTaskStatus}
      />
    );
    expect(screen.getByRole('button', { name: /move to To Do/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /move to Completed/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /move to In Progress/i })).not.toBeInTheDocument();
  });
});
