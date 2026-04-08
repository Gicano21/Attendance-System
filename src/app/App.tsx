import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './components/AuthContext';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AttendanceMode } from './components/AttendanceMode';
import { AdminAuth } from './components/AdminAuth';
import { AdminDashboard } from './components/AdminDashboard';

type AppMode = 'welcome' | 'attendance' | 'admin-auth' | 'admin-dashboard';

function AppContent() {
  const [mode, setMode] = useState<AppMode>('welcome');
  const { isAuthenticated } = useAuth();

  // If authenticated and trying to go to admin, show dashboard directly
  useEffect(() => {
    if (isAuthenticated && mode === 'admin-auth') {
      setMode('admin-dashboard');
    }
  }, [isAuthenticated, mode]);

  const handleModeSelect = (selectedMode: 'attendance' | 'admin') => {
    if (selectedMode === 'attendance') {
      setMode('attendance');
    } else {
      setMode('admin-auth');
    }
  };

  const handleLoginSuccess = () => {
    setMode('admin-dashboard');
  };

  const handleBack = () => {
    setMode('welcome');
  };

  return (
    <div className="size-full">
      {mode === 'welcome' && <WelcomeScreen onSelectMode={handleModeSelect} />}
      {mode === 'attendance' && <AttendanceMode onBack={handleBack} />}
      {mode === 'admin-auth' && <AdminAuth onBack={handleBack} onLoginSuccess={handleLoginSuccess} />}
      {mode === 'admin-dashboard' && <AdminDashboard />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}