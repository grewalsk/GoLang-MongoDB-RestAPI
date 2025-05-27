import React, { useState, useEffect } from 'react';
import { TaskCard } from './TaskCard';
import { Task } from '../types';
import { apiService } from '../services/api';

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const fetchedTasks = await apiService.getTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (title: string, description: string) => {
    try {
      const newTask = await apiService.createTask({
        title,
        description,
        status: 'open'
      });
      setTasks(prev => [...prev, newTask]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await apiService.updateTask(id, updates);
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await apiService.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const columns = [
    {
      id: 'open',
      title: 'New Task',
      status: 'open' as const,
      tasks: tasks.filter(task => task.status === 'open')
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      status: 'in_progress' as const,
      tasks: tasks.filter(task => task.status === 'in_progress')
    },
    {
      id: 'done',
      title: 'Completed',
      status: 'done' as const,
      tasks: tasks.filter(task => task.status === 'done')
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex space-x-6 min-w-max">
        {columns.map(column => (
          <div key={column.id} className="w-80 bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-200">{column.title}</h3>
              <div className="w-6 h-6 bg-gray-700 rounded border-2 border-dashed border-gray-600 hover:border-purple-500 transition-colors duration-200 cursor-pointer"></div>
            </div>
            <div className="space-y-4">
              {column.tasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onUpdate={handleUpdateTask}
                  onDelete={handleDeleteTask}
                />
              ))}
              <NewTaskButton 
                onCreateTask={(title, description) => handleCreateTask(title, description)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface NewTaskButtonProps {
  onCreateTask: (title: string, description: string) => void;
}

function NewTaskButton({ onCreateTask }: NewTaskButtonProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreateTask(title.trim(), description.trim());
      setTitle('');
      setDescription('');
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <form onSubmit={handleSubmit} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 mb-2"
          autoFocus
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 mb-3 resize-none"
          rows={2}
        />
        <div className="flex space-x-2">
          <button
            type="submit"
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
          >
            Add Task
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <button
      onClick={() => setIsCreating(true)}
      className="w-full py-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-purple-500 hover:text-purple-400 transition-all duration-200 hover:bg-gray-700/50"
    >
      <span className="text-sm font-medium">+ New Task</span>
    </button>
  );
}