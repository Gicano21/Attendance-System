import React, { useState, useEffect, useMemo } from 'react';
import { Filter, Calendar, Users as UsersIcon, X } from 'lucide-react';
import { getTimeIns, getStudents, getPrograms, getCourses } from '../../utils/storage';
import { TimeIn, Student, Program, Course } from '../../utils/types';
import { useAuth } from '../AuthContext';

export const AttendanceView: React.FC = () => {
  const { currentUser } = useAuth();
  const [timeIns, setTimeIns] = useState<TimeIn[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // Filters
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Selected student for details view
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

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

    // Filter time-ins for my students
    const allTimeIns = getTimeIns();
    const myStudentIds = myStudents.map(s => s.students_id);
    const myTimeIns = allTimeIns.filter(t => myStudentIds.includes(t.students_id));
    setTimeIns(myTimeIns);

    setPrograms(getPrograms());
    setCourses(getCourses());
  };

  // Filter data based on selections
  const filteredData = useMemo(() => {
    return timeIns.filter(timeIn => {
      const student = students.find(s => s.students_id === timeIn.students_id);
      if (!student) return false;

      const programMatch = selectedProgram === 'all' || student.program === selectedProgram;
      const courseMatch = selectedCourse === 'all' || timeIn.course === selectedCourse;
      const dateMatch = !selectedDate || timeIn.date === selectedDate;

      return programMatch && courseMatch && dateMatch;
    });
  }, [timeIns, students, selectedProgram, selectedCourse, selectedDate]);

  // Prepare chart data - group by date
  const chartData = useMemo(() => {
    const chartDataMap = new Map<string, number>();
    filteredData.forEach((timeIn, idx) => {
      if (timeIn?.date && typeof timeIn.date === 'string' && timeIn.date.trim()) {
        chartDataMap.set(timeIn.date, (chartDataMap.get(timeIn.date) || 0) + 1);
      }
    });

    return Array.from(chartDataMap.entries())
      .map(([date, count], index) => ({
        date: String(date),
        count: Number(count),
        name: String(date),
        id: `chart-date-${index}`
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData]);

  // Course distribution data
  const courseDistribution = useMemo(() => {
    const courseDistributionMap = new Map<string, { name: string; count: number }>();
    filteredData.forEach((timeIn, idx) => {
      if (timeIn?.course && typeof timeIn.course === 'string' && timeIn.course.trim()) {
        const courseName = courses.find(c => c.id === timeIn.course)?.name || timeIn.course;
        const existing = courseDistributionMap.get(timeIn.course);
        if (existing) {
          existing.count += 1;
        } else {
          courseDistributionMap.set(timeIn.course, { name: String(courseName), count: 1 });
        }
      }
    });

    return Array.from(courseDistributionMap.entries())
      .map(([courseId, data], index) => ({
        course: String(data.name),
        count: Number(data.count),
        name: String(data.name),
        id: `chart-course-${index}`
      }));
  }, [filteredData, courses]);

  // Get student details for filtered attendance
  const studentDetails = useMemo(() => {
    const studentAttendance = filteredData.reduce((acc: any, timeIn) => {
      const student = students.find(s => s.students_id === timeIn.students_id);
      if (student) {
        const key = timeIn.students_id;
        if (!acc[key]) {
          acc[key] = {
            student,
            records: []
          };
        }
        acc[key].records.push(timeIn);
      }
      return acc;
    }, {});

    return Object.values(studentAttendance) as Array<{ student: Student; records: TimeIn[] }>;
  }, [filteredData, students]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Attendance Overview</h2>

      {/* Filters */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            >
              <option value="all">All Programs</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            >
              <option value="all">All Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedProgram('all');
            setSelectedCourse('all');
            setSelectedDate('');
          }}
          className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium"
        >
          Clear Filters
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Attendance</p>
              <p className="text-3xl font-bold mt-1">{filteredData.length}</p>
            </div>
            <Calendar className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Unique Students</p>
              <p className="text-3xl font-bold mt-1">{studentDetails.length}</p>
            </div>
            <UsersIcon className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Average per Day</p>
              <p className="text-3xl font-bold mt-1">
                {chartData.length > 0 ? Math.round(filteredData.length / chartData.length) : 0}
              </p>
            </div>
            <Calendar className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Charts - Both in One Card */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Attendance Analytics</h3>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
          {/* Daily Attendance Chart */}
          <div className="border-r-0 md:border-r-2 border-gray-200 pr-0 md:pr-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Daily Attendance
            </h4>
            {chartData.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {chartData.map((item, index) => {
                  const maxCount = Math.max(...chartData.map(d => d.count));
                  const percentage = (item.count / maxCount) * 100;
                  return (
                    <div key={`daily-${index}-${item.date}`} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.date}</span>
                        <span className="font-semibold text-green-600">{item.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-6">
                        <div
                          className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        >
                          {percentage > 20 && <span className="text-xs text-white font-medium">{item.count}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </div>

          {/* Course Distribution Chart */}
          <div className="pl-0 md:pl-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-indigo-600" />
              Course Distribution
            </h4>
            {courseDistribution.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {courseDistribution.map((item, index) => {
                  const maxCount = Math.max(...courseDistribution.map(d => d.count));
                  const percentage = (item.count / maxCount) * 100;
                  return (
                    <div key={`course-${index}-${item.course}`} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 truncate flex-1 mr-2">{item.course}</span>
                        <span className="font-semibold text-indigo-600">{item.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-6">
                        <div
                          className="bg-indigo-500 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        >
                          {percentage > 20 && <span className="text-xs text-white font-medium">{item.count}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Student Attendance - Grid View */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Attendance Records</h3>

        {studentDetails.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No attendance records found</p>
            <p className="text-sm mt-2">Try adjusting your filters or add attendance records</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {studentDetails.map(({ student, records }) => (
              <button
                key={student.students_id}
                onClick={() => setSelectedStudentId(student.students_id)}
                className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-500 hover:shadow-lg transition-all duration-200 text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                  </div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                    {records.length}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-800 truncate group-hover:text-green-600 transition-colors">
                  {student.firstName} {student.lastName}
                </h4>
                <p className="text-xs text-gray-600 truncate mt-1">
                  {student.students_id}
                </p>
                <p className="text-xs text-gray-500 truncate mt-1">
                  {programs.find(p => p.id === student.program)?.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {student.year}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {selectedStudentId && (() => {
        const studentDetail = studentDetails.find(sd => sd.student.students_id === selectedStudentId);
        if (!studentDetail) return null;
        const { student, records } = studentDetail;

        return (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedStudentId(null)}
          >
            <div
              className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6 border-b pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {student.firstName} {student.middleName} {student.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {student.students_id} • {programs.find(p => p.id === student.program)?.name} • {student.year}
                    </p>
                    {student.section && (
                      <p className="text-sm text-gray-600">Section: {student.section}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudentId(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{records.length}</p>
                  <p className="text-sm text-gray-600">Total Records</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {new Set(records.map(r => r.date)).size}
                  </p>
                  <p className="text-sm text-gray-600">Unique Days</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {new Set(records.map(r => r.course)).size}
                  </p>
                  <p className="text-sm text-gray-600">Courses</p>
                </div>
              </div>

              {/* Attendance Records Table */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Attendance History</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Course</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record, idx) => (
                        <tr
                          key={`${student.students_id}-${record.course}-${record.date}-${record.time}-${idx}`}
                          className="border-t border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">{courses.find(c => c.id === record.course)?.name || record.course}</td>
                          <td className="px-4 py-3">{record.date}</td>
                          <td className="px-4 py-3">{record.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
