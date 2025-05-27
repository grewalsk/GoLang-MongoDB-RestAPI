import React, { useState } from 'react';
import { ClockIcon, UserIcon, EditIcon, TrashIcon, CheckIcon, XIcon } from 'lucide-react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);

  const handleSave = () => {
    onUpdate(task.id, {
      title: editTitle,
      description: editDescription
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus: Task['status']) => {
    onUpdate(task.id, { status: newStatus });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500';
      case 'in_progress':
        return 'bg-orange-500';
      case 'done':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isEditing) {
    return (
      <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 mb-2"
          placeholder="Task title"
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 mb-3 resize-none"
          placeholder="Description"
          rows={3}
        />
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center"
          >
            <CheckIcon className="w-4 h-4 mr-1" />
            Save
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center"
          >
            <XIcon className="w-4 h-4 mr-1" />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors duration-200 flex-1">
          {task.title}
        </h4>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
          >
            <EditIcon className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
          >
            <TrashIcon className="w-3 h-3" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-gray-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Status Indicator */}
      <div className={`h-1 rounded-full mb-3 ${getStatusColor(task.status)} opacity-80`}></div>

      {/* Status Selector */}
      <div className="mb-3">
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value as Task['status'])}
          className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-xs text-white focus:outline-none focus:border-purple-500"
          onClick={(e) => e.stopPropagation()}
        >
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-1">
          <ClockIcon className="w-3 h-3" />
          <span>Created: {formatDate(task.created_at)}</span>
        </div>
        {task.updated_at !== task.created_at && (
          <span>Updated: {formatDate(task.updated_at)}</span>
        )}
      </div>
    </div>
  );
}