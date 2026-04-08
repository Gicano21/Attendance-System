import React from 'react';
import { QrCode, UserCog } from 'lucide-react';

interface WelcomeScreenProps {
  onSelectMode: (mode: 'attendance' | 'admin') => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectMode }) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl">
            <div className="text-4xl font-bold text-green-600">A</div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Student Attendance System
          </h1>
          <p className="text-xl text-green-50">
            Track attendance with QR codes and manage students efficiently
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Attendance Mode */}
          <button
            onClick={() => onSelectMode('attendance')}
            className="bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 group"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <QrCode className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Attendance</h2>
              <p className="text-gray-600 text-center">
                Scan QR code or enter attendance manually
              </p>
            </div>
          </button>

          {/* Admin Mode */}
          <button
            onClick={() => onSelectMode('admin')}
            className="bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 group"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
                <UserCog className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin</h2>
              <p className="text-gray-600 text-center">
                Manage programs, courses, and students
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
