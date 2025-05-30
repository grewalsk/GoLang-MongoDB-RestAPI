"use client"; // Required for components using hooks like useState, useEffect

import React, { useState, useEffect, useCallback } from 'react';
import TaskList from './TaskList';
import { Task, CreateTaskPayload, UpdateTaskPayload } from '@/types';
import { getTasks, createTask, updateTask, deleteTask as apiDeleteTask } from '@/services/api';

const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('To Do'); // Default status

  const fetchTasks = useCallback(async () => {
    try {
      setError(null);
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      setError("Task title is required.");
      return;
    }
    const payload: CreateTaskPayload = {
      title: newTaskTitle,
      description: newTaskDescription,
      status: newTaskStatus
    };
    try {
      await createTask(payload);
      fetchTasks(); // Refetch tasks to show the new one
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskStatus('To Do'); // Reset form
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      console.error(err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await apiDeleteTask(id);
      fetchTasks(); // Refetch tasks
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      console.error(err);
    }
  };

  const handleUpdateTaskStatus = async (id: string, newStatus: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const updates: UpdateTaskPayload = { status: newStatus };
    try {
      await updateTask(id, updates);
      fetchTasks(); // Refetch tasks
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to update task ${id} to ${newStatus}`);
      console.error(err);
    }
  };

  // Filter tasks for each list
  const todoTasks = tasks.filter(task => task.status === 'To Do');
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress');
  const completedTasks = tasks.filter(task => task.status === 'Completed');

  return (
    <div className="p-4 bg-gray-50 min-h-screen w-full">
      {/* Create Task Form */}
      <form onSubmit={handleCreateTask} className="mb-8 p-4 bg-white shadow-md rounded-lg max-w-xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Add New Task</h2>
        {error && <p className="text-red-500 bg-red-100 p-2 rounded mb-4">{error}</p>}
        <div className="mb-4">
          <label htmlFor="newTaskTitle" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            id="newTaskTitle"
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="newTaskDescription" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
          <textarea
            id="newTaskDescription"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="newTaskStatus" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            id="newTaskStatus"
            value={newTaskStatus}
            onChange={(e) => setNewTaskStatus(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Task
        </button>
      </form>

      {/* Task Lists */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 justify-center">
        <TaskList title="To Do" tasks={todoTasks} onDeleteTask={handleDeleteTask} onUpdateTaskStatus={handleUpdateTaskStatus} />
        <TaskList title="In Progress" tasks={inProgressTasks} onDeleteTask={handleDeleteTask} onUpdateTaskStatus={handleUpdateTaskStatus} />
        <TaskList title="Completed" tasks={completedTasks} onDeleteTask={handleDeleteTask} onUpdateTaskStatus={handleUpdateTaskStatus} />
      </div>
    </div>
  );
};

export default TaskBoard;
