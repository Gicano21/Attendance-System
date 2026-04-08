import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Search } from 'lucide-react';
import { getStudents, addTimeIn, canTimeInNow } from '../utils/storage';
import { Student } from '../utils/types';

interface ManualAttendanceProps {
  onBack: () => void;
}

export const ManualAttendance: React.FC<ManualAttendanceProps> = ({ onBack }) => {
  const [studentId, setStudentId] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [scannedStudent, setScannedStudent] = useState<Student | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId.trim()) {
      setMessage({ type: 'error', text: 'Please enter a student ID' });
      return;
    }

    const students = getStudents();
    const student = students.find(s => s.students_id === studentId.trim());

    if (!student) {
      setMessage({ type: 'error', text: 'Student not found!' });
      setScannedStudent(null);
      return;
    }

    setScannedStudent(student);

    // Check each course for valid time-in
    let successCount = 0;
    let restrictedCount = 0;

    student.courses.forEach(course => {
      const canTimeIn = canTimeInNow(student.program, course, student.section);

      if (canTimeIn) {
        // Add time-in record
        const now = new Date();
        addTimeIn({
          students_id: studentId.trim(),
          course: course,
          date: now.toISOString().split('T')[0],
          time: now.toTimeString().slice(0, 8)
        });
        successCount++;
      } else {
        restrictedCount++;
      }
    });

    if (successCount > 0 && restrictedCount === 0) {
      setMessage({
        type: 'success',
        text: `Welcome ${student.firstName} ${student.lastName}! Attendance recorded for all courses.`
      });
    } else if (successCount > 0 && restrictedCount > 0) {
      setMessage({
        type: 'warning',
        text: `Attendance recorded for ${successCount} course(s). ${restrictedCount} course(s) not available at this time.`
      });
    } else {
      setMessage({
        type: 'warning',
        text: `Sorry ${student.firstName}, no courses are available for time-in at this moment.`
      });
    }

    setTimeout(() => {
      setMessage(null);
      setScannedStudent(null);
      setStudentId('');
    }, 4000);
  };

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

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Manual Attendance
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter Student ID"
                className="w-full px-4 py-4 pr-12 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Search className="w-6 h-6" />
              </button>
            </div>
          </form>

          {/* Status Message */}
          {message && (
            <div className={`p-4 rounded-lg flex items-start gap-3 ${
              message.type === 'success' ? 'bg-green-50 border border-green-200' :
              message.type === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-yellow-50 border border-yellow-200'
            }`}>
              {message.type === 'success' && <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />}
              {message.type === 'error' && <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />}
              {message.type === 'warning' && <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />}
              <div>
                <p className={`font-semibold ${
                  message.type === 'success' ? 'text-green-800' :
                  message.type === 'error' ? 'text-red-800' :
                  'text-yellow-800'
                }`}>
                  {message.text}
                </p>
                {scannedStudent && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Program: {scannedStudent.program}</p>
                    <p>Year: {scannedStudent.year}</p>
                    <p>Courses: {scannedStudent.courses.join(', ')}</p>
                    {scannedStudent.section && <p>Section: {scannedStudent.section}</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          {!message && (
            <div className="text-center text-gray-600">
              <p className="text-lg">Enter the student ID to record attendance</p>
              <p className="text-sm mt-2">Make sure the ID is correct before submitting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
