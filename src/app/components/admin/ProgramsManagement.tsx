import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { getPrograms, addProgram, updateProgram, deleteProgram } from '../../utils/storage';
import { Program } from '../../utils/types';

export const ProgramsManagement: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = () => {
    setPrograms(getPrograms());
  };

  const handleAdd = () => {
    if (!formData.name.trim()) {
      alert('Please enter a program name');
      return;
    }

    const newProgram: Program = {
      id: `PROG-${Date.now()}`,
      name: formData.name.trim()
    };

    addProgram(newProgram);
    setFormData({ name: '' });
    setShowAddForm(false);
    loadPrograms();
  };

  const handleUpdate = (id: string) => {
    if (!formData.name.trim()) {
      alert('Please enter a program name');
      return;
    }

    updateProgram(id, { name: formData.name.trim() });
    setEditingId(null);
    setFormData({ name: '' });
    loadPrograms();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteProgram(id);
      loadPrograms();
    }
  };

  const startEdit = (program: Program) => {
    setEditingId(program.id);
    setFormData({ name: program.name });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Programs Management</h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Program
          </button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Add New Program</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              placeholder="Program name (e.g., Computer Science)"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            />
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
                  setFormData({ name: '' });
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

      {/* Programs List */}
      <div className="space-y-3">
        {programs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No programs added yet</p>
            <p className="text-sm mt-2">Click "Add Program" to get started</p>
          </div>
        ) : (
          programs.map(program => (
            <div key={program.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
              {editingId === program.id ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleUpdate(program.id)}
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
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{program.name}</h3>
                    <p className="text-sm text-gray-500">ID: {program.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(program)}
                      className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(program.id, program.name)}
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
