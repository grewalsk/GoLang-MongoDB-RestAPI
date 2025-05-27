import React, { useState } from 'react';
import { apiService } from '../services/api';

interface LoginProps {
  onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await apiService.login({ email, password });
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Login</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-400 text-center">
          <p>Demo credentials:</p>
          <p>Email: admin@example.com | Password: admin123</p>
        </div>
      </div>
    </div>
  );
} 