import React from 'react';
import { Task } from '@/types'; // Use the Task type

interface TaskCardProps {
  task: Task;
  onDeleteTask: (id: string) => void;
  onUpdateTaskStatus: (id: string, newStatus: string) => void;
}

const statusOptions: { [key: string]: string[] } = {
  "To Do": ["In Progress", "Completed"],
  "In Progress": ["To Do", "Completed"],
  "Completed": ["To Do", "In Progress"], // Or just "Archive" or no change
};


const TaskCard: React.FC<TaskCardProps> = ({ task, onDeleteTask, onUpdateTaskStatus }) => {
  const { id, title, description, status } = task;

  const availableStatuses = statusOptions[status] || [];

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 mb-4 hover:shadow-xl transition-shadow duration-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      {description && <p className="text-gray-700 text-sm mb-3 whitespace-pre-wrap">{description}</p>}
      <div className="text-xs text-gray-500 mb-3">Current Status: <span className="font-medium text-gray-700">{status}</span></div>

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          {availableStatuses.map(newStatus => (
            <button
              key={newStatus}
              onClick={() => onUpdateTaskStatus(id, newStatus)}
              className={`px-2 py-1 text-xs rounded-md transition-colors duration-150
                ${newStatus === "In Progress" ? "bg-yellow-500 hover:bg-yellow-600 text-white" :
                  newStatus === "Completed" ? "bg-green-500 hover:bg-green-600 text-white" :
                  "bg-blue-500 hover:bg-blue-600 text-white" // Default for "To Do" or other custom statuses
                }`}
            >
              Move to {newStatus}
            </button>
          ))}
        </div>
        <button
          onClick={() => onDeleteTask(id)}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-md shadow-sm transition-colors duration-150"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
