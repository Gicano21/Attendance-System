import React, { useState } from 'react';
import { Palette, User, Lock, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { getAdminAccounts, updateAdminAccount } from '../../utils/storage';

export const Settings: React.FC = () => {
  const { currentUser } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark' | 'green' | 'blue'>('green');

  // Change username state
  const [newUsername, setNewUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const themes = [
    { id: 'light' as const, name: 'Light', colors: 'from-gray-100 to-gray-200' },
    { id: 'dark' as const, name: 'Dark', colors: 'from-gray-800 to-gray-900' },
    { id: 'green' as const, name: 'Green', colors: 'from-green-400 to-emerald-600' },
    { id: 'blue' as const, name: 'Blue', colors: 'from-blue-400 to-indigo-600' }
  ];

  const handleChangeUsername = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newUsername.trim()) {
      setError('Please enter a new username');
      return;
    }

    if (!confirmPassword) {
      setError('Please enter your password to confirm');
      return;
    }

    if (!currentUser) {
      setError('No user logged in');
      return;
    }

    // Verify password
    if (currentUser.password !== confirmPassword) {
      setError('Incorrect password');
      return;
    }

    // Check if username already exists
    const accounts = getAdminAccounts();
    const existingUser = accounts.find(a => a.username === newUsername.trim() && a.account_id !== currentUser.account_id);

    if (existingUser) {
      setError('Username already taken');
      return;
    }

    // Update username
    updateAdminAccount(currentUser.account_id, { username: newUsername.trim() });

    // Update current user in localStorage
    const updatedUser = { ...currentUser, username: newUsername.trim() };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    setSuccess('Username updated successfully!');
    setNewUsername('');
    setConfirmPassword('');

    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>

      <div className="space-y-6">
        {/* Theme Settings */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-800">Theme</h3>
          </div>

          <p className="text-gray-600 mb-4">Choose your preferred theme</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  theme === t.id ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-full h-24 rounded-lg bg-gradient-to-br ${t.colors} mb-2`} />
                <p className="font-medium text-gray-800">{t.name}</p>
                {theme === t.id && (
                  <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Theme customization is currently for preview only. It will be applied in a future update.
            </p>
          </div>
        </div>

        {/* Change Username */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-800">Change Username</h3>
          </div>

          <form onSubmit={handleChangeUsername} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Current Username</label>
              <input
                type="text"
                value={currentUser?.username || ''}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">New Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                  placeholder="Enter new username"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Update Username
            </button>
          </form>
        </div>

        {/* Account Info */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h3>
          <div className="space-y-2 text-gray-700">
            <p><strong>Account ID:</strong> {currentUser?.account_id}</p>
            <p><strong>Username:</strong> {currentUser?.username}</p>
            <p><strong>Email:</strong> {currentUser?.gmail}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
