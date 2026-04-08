import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Clock } from 'lucide-react';
import { getAttendanceSchedules, addAttendanceSchedule, updateAttendanceSchedule, deleteAttendanceSchedule, getPrograms, getCourses } from '../../utils/storage';
import { AttendanceSchedule, Program, Course } from '../../utils/types';

export const SystemSettings: React.FC = () => {
  const [schedules, setSchedules] = useState<AttendanceSchedule[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    program: '',
    course: '',
    section: '',
    timeStart: '',
    timeEnd: '',
    daysOfWeek: [] as string[]
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSchedules(getAttendanceSchedules());
    setPrograms(getPrograms());
    setCourses(getCourses());
  };

  const handleAdd = () => {
    if (!formData.program || !formData.course) {
      alert('Please select program and course');
      return;
    }

    if (!formData.timeStart || !formData.timeEnd) {
      alert('Please set time range');
      return;
    }

    if (formData.daysOfWeek.length === 0) {
      alert('Please select at least one day');
      return;
    }

    const newSchedule: AttendanceSchedule = {
      id: `SCHED-${Date.now()}`,
      program: formData.program,
      course: formData.course,
      section: formData.section.trim(),
      timeStart: formData.timeStart,
      timeEnd: formData.timeEnd,
      daysOfWeek: formData.daysOfWeek
    };

    addAttendanceSchedule(newSchedule);
    resetForm();
    setShowAddForm(false);
    loadData();
  };

  const handleUpdate = (id: string) => {
    if (!formData.program || !formData.course) {
      alert('Please select program and course');
      return;
    }

    if (!formData.timeStart || !formData.timeEnd) {
      alert('Please set time range');
      return;
    }

    if (formData.daysOfWeek.length === 0) {
      alert('Please select at least one day');
      return;
    }

    updateAttendanceSchedule(id, {
      program: formData.program,
      course: formData.course,
      section: formData.section.trim(),
      timeStart: formData.timeStart,
      timeEnd: formData.timeEnd,
      daysOfWeek: formData.daysOfWeek
    });

    setEditingId(null);
    resetForm();
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      deleteAttendanceSchedule(id);
      loadData();
    }
  };

  const startEdit = (schedule: AttendanceSchedule) => {
    setEditingId(schedule.id);
    setFormData({
      program: schedule.program,
      course: schedule.course,
      section: schedule.section || '',
      timeStart: schedule.timeStart,
      timeEnd: schedule.timeEnd,
      daysOfWeek: schedule.daysOfWeek
    });
  };

  const resetForm = () => {
    setFormData({
      program: '',
      course: '',
      section: '',
      timeStart: '',
      timeEnd: '',
      daysOfWeek: []
    });
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }));
  };

  const getProgramName = (programId: string) => {
    return programs.find(p => p.id === programId)?.name || programId;
  };

  const getCourseName = (courseId: string) => {
    return courses.find(c => c.id === courseId)?.name || courseId;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
          <p className="text-gray-600 mt-1">Configure attendance time restrictions</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Schedule
          </button>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">How Attendance Schedules Work</h3>
            <p className="text-sm text-blue-800">
              Create schedules to allow students to time-in only during specific times and days.
              For example, set "Monday 1:00 PM - 2:00 PM" for a specific course, and students can only
              record attendance during that window. This helps ensure attendance accuracy and prevents
              early or late check-ins.
            </p>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            {editingId ? 'Edit Schedule' : 'Add New Schedule'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Program *</label>
              <select
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
              >
                <option value="">Select Program</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course *</label>
              <select
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
              >
                <option value="">Select Course</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section (Optional)</label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                placeholder="e.g., Section A"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-1"></div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
              <input
                type="time"
                value={formData.timeStart}
                onChange={(e) => setFormData({ ...formData, timeStart: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
              <input
                type="time"
                value={formData.timeEnd}
                onChange={(e) => setFormData({ ...formData, timeEnd: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Days of Week *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {daysOfWeek.map(day => (
                <label key={day} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.daysOfWeek.includes(day)}
                    onChange={() => toggleDay(day)}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="text-sm">{day}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
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

      {/* Schedules List */}
      <div className="space-y-3">
        {schedules.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No attendance schedules configured</p>
            <p className="text-sm mt-2">Click "Add Schedule" to create time restrictions</p>
          </div>
        ) : (
          schedules.map(schedule => (
            <div key={schedule.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      {getProgramName(schedule.program)} - {getCourseName(schedule.course)}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    {schedule.section && <p><span className="font-medium">Section:</span> {schedule.section}</p>}
                    <p><span className="font-medium">Time:</span> {schedule.timeStart} - {schedule.timeEnd}</p>
                    <p className="md:col-span-2"><span className="font-medium">Days:</span> {schedule.daysOfWeek.join(', ')}</p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => startEdit(schedule)}
                    className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
