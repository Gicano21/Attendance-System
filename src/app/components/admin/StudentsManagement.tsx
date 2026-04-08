import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, QrCode as QrCodeIcon, Search } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getStudents, addStudent, updateStudent, deleteStudent, getPrograms, getCourses } from '../../utils/storage';
import { Student, Program, Course } from '../../utils/types';
import { useAuth } from '../AuthContext';

export const StudentsManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    students_id: '',
    lastName: '',
    firstName: '',
    middleName: '',
    extensionName: '',
    sex: 'Male' as 'Male' | 'Female',
    age: '',
    program: '',
    year: '',
    courses: [] as string[],
    section: '',
    accountHolder: [currentUser?.username || '']
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allStudents = getStudents();
    // Filter students by current instructor
    const myStudents = allStudents.filter(s =>
      s.accountHolder.includes(currentUser?.username || '')
    );
    setStudents(myStudents);
    setPrograms(getPrograms());
    setCourses(getCourses());
  };

  const handleAdd = () => {
    if (!formData.students_id.trim() || !formData.firstName.trim() || !formData.lastName.trim()) {
      alert('Please fill in required fields (Student ID, First Name, Last Name)');
      return;
    }

    if (!formData.program || !formData.year) {
      alert('Please select program and year');
      return;
    }

    if (formData.courses.length === 0) {
      alert('Please select at least one course');
      return;
    }

    const newStudent: Student = {
      students_id: formData.students_id.trim(),
      lastName: formData.lastName.trim(),
      firstName: formData.firstName.trim(),
      middleName: formData.middleName.trim(),
      extensionName: formData.extensionName.trim(),
      sex: formData.sex,
      age: parseInt(formData.age) || 0,
      program: formData.program,
      year: formData.year,
      courses: formData.courses,
      section: formData.section.trim(),
      accountHolder: formData.accountHolder
    };

    addStudent(newStudent);
    resetForm();
    setShowAddForm(false);
    loadData();
  };

  const handleUpdate = (id: string) => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert('Please fill in required fields');
      return;
    }

    if (formData.courses.length === 0) {
      alert('Please select at least one course');
      return;
    }

    updateStudent(id, {
      lastName: formData.lastName.trim(),
      firstName: formData.firstName.trim(),
      middleName: formData.middleName.trim(),
      extensionName: formData.extensionName.trim(),
      sex: formData.sex,
      age: parseInt(formData.age) || 0,
      program: formData.program,
      year: formData.year,
      courses: formData.courses,
      section: formData.section.trim(),
      accountHolder: formData.accountHolder
    });

    setEditingId(null);
    resetForm();
    loadData();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteStudent(id);
      loadData();
    }
  };

  const startEdit = (student: Student) => {
    setEditingId(student.students_id);
    setFormData({
      students_id: student.students_id,
      lastName: student.lastName,
      firstName: student.firstName,
      middleName: student.middleName,
      extensionName: student.extensionName || '',
      sex: student.sex,
      age: student.age.toString(),
      program: student.program,
      year: student.year,
      courses: student.courses,
      section: student.section || '',
      accountHolder: student.accountHolder
    });
  };

  const resetForm = () => {
    setFormData({
      students_id: '',
      lastName: '',
      firstName: '',
      middleName: '',
      extensionName: '',
      sex: 'Male',
      age: '',
      program: '',
      year: '',
      courses: [],
      section: '',
      accountHolder: [currentUser?.username || '']
    });
  };

  const toggleCourse = (courseId: string) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.includes(courseId)
        ? prev.courses.filter(c => c !== courseId)
        : [...prev.courses, courseId]
    }));
  };

  const getCourseNames = (courseIds: string[]): string => {
    return courseIds
      .map(id => courses.find(c => c.id === id)?.name || id)
      .join(', ');
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${student.firstName} ${student.middleName} ${student.lastName}`.toLowerCase();
    const studentId = student.students_id.toLowerCase();

    return fullName.includes(searchLower) || studentId.includes(searchLower);
  });

  const downloadQR = (studentId: string) => {
    const svg = document.getElementById(`qr-${studentId}`) as SVGElement;
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      canvas.width = 256;
      canvas.height = 256;

      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `QR-${studentId}.png`;
        link.href = url;
        link.click();
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Students Management</h2>
        {!showAddForm && !editingId && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 sm:flex-initial sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or ID..."
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Add Student
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            {editingId ? 'Edit Student' : 'Add New Student'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={formData.students_id}
              onChange={(e) => setFormData({ ...formData, students_id: e.target.value })}
              placeholder="Student ID *"
              disabled={!!editingId}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none disabled:bg-gray-100"
            />
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Last Name *"
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            />
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="First Name *"
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            />
            <input
              type="text"
              value={formData.middleName}
              onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
              placeholder="Middle Name *"
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            />
            <input
              type="text"
              value={formData.extensionName}
              onChange={(e) => setFormData({ ...formData, extensionName: e.target.value })}
              placeholder="Extension Name (e.g., Jr., Sr.)"
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            />
            <select
              value={formData.sex}
              onChange={(e) => setFormData({ ...formData, sex: e.target.value as 'Male' | 'Female' })}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="Age"
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            />
            <select
              value={formData.program}
              onChange={(e) => setFormData({ ...formData, program: e.target.value })}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            >
              <option value="">Select Program *</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            >
              <option value="">Select Year *</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
            <input
              type="text"
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              placeholder="Section (optional)"
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Courses: *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {courses.map(course => (
                <label key={course.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.courses.includes(course.id)}
                    onChange={() => toggleCourse(course.id)}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="text-sm">{course.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-5 h-5" />
              Save
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingId(null);
                resetForm();
              }}
              className="flex items-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">{searchTerm ? 'No students found' : 'No students added yet'}</p>
          <p className="text-sm mt-2">{searchTerm ? 'Try a different search term' : 'Click "Add Student" to get started'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map(student => (
            <div
              key={student.students_id}
              className="relative border-2 border-gray-200 rounded-lg p-4 hover:border-green-500 hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => startEdit(student)}
            >
              {/* Delete button - top right corner */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(student.students_id, `${student.firstName} ${student.lastName}`);
                }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 z-10"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>

              {/* Avatar and QR */}
              <div className="flex items-center justify-between mb-3">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowQR(student.students_id);
                  }}
                  className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                  title="Show QR Code"
                >
                  <QrCodeIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Student Info */}
              <h3 className="font-semibold text-gray-800 truncate group-hover:text-green-600 transition-colors mb-1">
                {student.firstName} {student.lastName} {student.extensionName}
              </h3>
              <p className="text-xs text-gray-600 truncate mb-2">
                ID: {student.students_id}
              </p>

              <div className="space-y-1 text-xs text-gray-600">
                <p className="truncate">
                  <span className="font-medium">Program:</span> {programs.find(p => p.id === student.program)?.name || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Year:</span> {student.year}
                </p>
                {student.section && (
                  <p className="truncate">
                    <span className="font-medium">Section:</span> {student.section}
                  </p>
                )}
                <p className="truncate">
                  <span className="font-medium">Sex:</span> {student.sex} • <span className="font-medium">Age:</span> {student.age}
                </p>
              </div>

              {/* Action hint */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center group-hover:text-green-600 transition-colors">
                  Click to edit
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowQR(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Student QR Code</h3>
            <div className="flex justify-center mb-4">
              <QRCodeSVG id={`qr-${showQR}`} value={showQR} size={256} level="H" />
            </div>
            <p className="text-center text-gray-600 mb-4">Student ID: {showQR}</p>
            <div className="flex gap-2">
              <button
                onClick={() => downloadQR(showQR)}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Download QR Code
              </button>
              <button
                onClick={() => setShowQR(null)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
