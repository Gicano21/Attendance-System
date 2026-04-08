import React, { useState } from 'react';
import { ArrowLeft, QrCode, Keyboard } from 'lucide-react';
import { QRScanner } from './QRScanner';
import { ManualAttendance } from './ManualAttendance';

interface AttendanceModeProps {
  onBack: () => void;
}

export const AttendanceMode: React.FC<AttendanceModeProps> = ({ onBack }) => {
  const [mode, setMode] = useState<'select' | 'scan' | 'manual'>('select');

  if (mode === 'scan') {
    return <QRScanner onBack={() => setMode('select')} />;
  }

  if (mode === 'manual') {
    return <ManualAttendance onBack={() => setMode('select')} />;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-white hover:text-green-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-lg">Back</span>
        </button>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Attendance Mode
          </h1>
          <p className="text-xl text-green-50">
            Choose how you want to record attendance
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* QR Scanner */}
          <button
            onClick={() => setMode('scan')}
            className="bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 group"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <QrCode className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Scan QR Code</h2>
              <p className="text-gray-600 text-center">
                Scan student QR code for quick attendance
              </p>
            </div>
          </button>

          {/* Manual Entry */}
          <button
            onClick={() => setMode('manual')}
            className="bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 group"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
                <Keyboard className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Manual Entry</h2>
              <p className="text-gray-600 text-center">
                Enter student ID manually
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
