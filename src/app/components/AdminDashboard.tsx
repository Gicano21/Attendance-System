import React, { useState } from 'react';
import { LogOut, BookOpen, GraduationCap, Users, ClipboardList, Settings as SettingsIcon, Cog } from 'lucide-react';
import { useAuth } from './AuthContext';
import { ProgramsManagement } from './admin/ProgramsManagement';
import { CoursesManagement } from './admin/CoursesManagement';
import { StudentsManagement } from './admin/StudentsManagement';
import { AttendanceView } from './admin/AttendanceView';
import { SystemSettings } from './admin/SystemSettings';
import { Settings } from './admin/Settings';

type AdminView = 'programs' | 'courses' | 'students' | 'attendance' | 'system' | 'settings';

export const AdminDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<AdminView>('programs');
  const { logout, currentUser } = useAuth();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      window.location.reload();
    }
  };

  const navItems = [
    { id: 'programs' as AdminView, label: 'Programs', icon: BookOpen },
    { id: 'courses' as AdminView, label: 'Courses', icon: GraduationCap },
    { id: 'students' as AdminView, label: 'Students', icon: Users },
    { id: 'attendance' as AdminView, label: 'Attendance', icon: ClipboardList },
    { id: 'system' as AdminView, label: 'System', icon: Cog },
    { id: 'settings' as AdminView, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-green-100">Welcome, {currentUser?.username}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-2 flex flex-wrap gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {currentView === 'programs' && <ProgramsManagement />}
          {currentView === 'courses' && <CoursesManagement />}
          {currentView === 'students' && <StudentsManagement />}
          {currentView === 'attendance' && <AttendanceView />}
          {currentView === 'system' && <SystemSettings />}
          {currentView === 'settings' && <Settings />}
        </div>
      </div>
    </div>
  );
};
