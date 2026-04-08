import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { getCourses, addCourse, updateCourse, deleteCourse, getPrograms } from '../../utils/storage';
import { Course, Program } from '../../utils/types';

export const CoursesManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', programs: [] as string[] });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCourses(getCourses());
    setPrograms(getPrograms());
  };

  const handleAdd = () => {
    if (!formData.name.trim()) {
      alert('Please enter a course name');
      return;
    }

    if (formData.programs.length === 0) {
      alert('Please select at least one program');
      return;
    }

    const newCourse: Course = {
      id: `COURSE-${Date.now()}`,
      name: formData.name.trim(),
      programs: formData.programs
    };

    addCourse(newCourse);
    setFormData({ name: '', programs: [] });
    setShowAddForm(false);
    loadData();
  };

  const handleUpdate = (id: string) => {
    if (!formData.name.trim()) {
      alert('Please enter a course name');
      return;
    }

    if (formData.programs.length === 0) {
      alert('Please select at least one program');
      return;
    }

    updateCourse(id, { name: formData.name.trim(), programs: formData.programs });
    setEditingId(null);
    setFormData({ name: '', programs: [] });
    loadData();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteCourse(id);
      loadData();
    }
  };

  const startEdit = (course: Course) => {
    setEditingId(course.id);
    setFormData({ name: course.name, programs: course.programs });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', programs: [] });
  };

  const toggleProgram = (programId: string) => {
    setFormData(prev => ({
      ...prev,
      programs: prev.programs.includes(programId)
        ? prev.programs.filter(p => p !== programId)
        : [...prev.programs, programId]
    }));
  };

  const getProgramNames = (programIds: string[]): string => {
    return programIds
      .map(id => programs.find(p => p.id === id)?.name || id)
      .join(', ');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Courses Management</h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Course
          </button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Add New Course</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Course name (e.g., Data Structures)"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Programs:</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {programs.map(program => (
                  <label key={program.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.programs.includes(program.id)}
                      onChange={() => toggleProgram(program.id)}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-sm">{program.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-5 h-5" />
                Save
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ name: '', programs: [] });
                }}
                className="flex items-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Courses List */}
      <div className="space-y-3">
        {courses.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No courses added yet</p>
            <p className="text-sm mt-2">Click "Add Course" to get started</p>
          </div>
        ) : (
          courses.map(course => (
            <div key={course.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
              {editingId === course.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Programs:</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {programs.map(program => (
                        <label key={program.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.programs.includes(program.id)}
                            onChange={() => toggleProgram(program.id)}
                            className="w-4 h-4 text-green-600"
                          />
                          <span className="text-sm">{program.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(course.id)}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{course.name}</h3>
                    <p className="text-sm text-gray-500">ID: {course.id}</p>
                    <p className="text-sm text-gray-600 mt-1">Programs: {getProgramNames(course.programs)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(course)}
                      className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course.id, course.name)}
                      className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
