import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TaskBoard } from './components/TaskBoard';
import { Login } from './components/Login';
import { apiService } from './services/api';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    setIsAuthenticated(apiService.isAuthenticated());
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    apiService.logout();
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header onLogout={handleLogout} />
      <main className="p-6">
        <TaskBoard />
      </main>
    </div>
  );
}