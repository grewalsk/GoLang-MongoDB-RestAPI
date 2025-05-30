import React from 'react';
import TaskCard from './TaskCard';
import { Task } from '@/types'; // Use the Task type from types/index.ts

interface TaskListProps {
  title: string;
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onUpdateTaskStatus: (id: string, newStatus: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ title, tasks, onDeleteTask, onUpdateTaskStatus }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md w-full md:w-96 flex-shrink-0">
      <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">{title}</h2>
      <div className="space-y-4 h-[calc(100vh-12rem)] overflow-y-auto pr-1"> {/* Adjust height as needed */}
        {tasks.length > 0 ? (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task} // Pass the whole task object
              onDeleteTask={onDeleteTask}
              onUpdateTaskStatus={onUpdateTaskStatus}
            />
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No tasks in this list.</p>
        )}
      </div>
    </div>
  );
};

export default TaskList;
