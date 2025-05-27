import React from 'react';
import { LogOutIcon } from 'lucide-react';

interface HeaderProps {
  onLogout: () => void;
}

export function Header({ onLogout }: HeaderProps) {
  return <header className="sticky top-0 z-10 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <h1 className="text-xl font-semibold text-white">
              Task Management
            </h1>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <LogOutIcon className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>;
}