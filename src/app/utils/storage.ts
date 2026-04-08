// Local storage utility to simulate JSON database
import { Student, TimeIn, AdminAccount, Program, Course, AttendanceSchedule } from './types';

const DB_PREFIX = 'myDataBase_';

// Initialize default admin account if none exists
const initializeDefaultData = () => {
  const admins = getAdminAccounts();
  if (admins.length === 0) {
    // Create default admin
    const defaultAdmin: AdminAccount = {
      account_id: 1,
      username: 'admin',
      gmail: 'admin@school.edu',
      password: 'admin123'
    };
    localStorage.setItem(DB_PREFIX + 'admin_accounts', JSON.stringify([defaultAdmin]));
    localStorage.setItem(DB_PREFIX + 'account_counter', '2');
  }

  // Initialize other collections if they don't exist
  if (!localStorage.getItem(DB_PREFIX + 'students')) {
    localStorage.setItem(DB_PREFIX + 'students', JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_PREFIX + 'time_in')) {
    localStorage.setItem(DB_PREFIX + 'time_in', JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_PREFIX + 'programs')) {
    localStorage.setItem(DB_PREFIX + 'programs', JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_PREFIX + 'courses')) {
    localStorage.setItem(DB_PREFIX + 'courses', JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_PREFIX + 'attendance_schedules')) {
    localStorage.setItem(DB_PREFIX + 'attendance_schedules', JSON.stringify([]));
  }
};

// Admin Accounts
export const getAdminAccounts = (): AdminAccount[] => {
  const data = localStorage.getItem(DB_PREFIX + 'admin_accounts');
  return data ? JSON.parse(data) : [];
};

export const saveAdminAccounts = (accounts: AdminAccount[]) => {
  localStorage.setItem(DB_PREFIX + 'admin_accounts', JSON.stringify(accounts));
};

export const addAdminAccount = (account: Omit<AdminAccount, 'account_id'>): AdminAccount => {
  const accounts = getAdminAccounts();
  const counter = parseInt(localStorage.getItem(DB_PREFIX + 'account_counter') || '1');
  const newAccount = { ...account, account_id: counter };
  accounts.push(newAccount);
  saveAdminAccounts(accounts);
  localStorage.setItem(DB_PREFIX + 'account_counter', String(counter + 1));
  return newAccount;
};

export const updateAdminAccount = (accountId: number, updates: Partial<AdminAccount>) => {
  const accounts = getAdminAccounts();
  const index = accounts.findIndex(a => a.account_id === accountId);
  if (index !== -1) {
    accounts[index] = { ...accounts[index], ...updates };
    saveAdminAccounts(accounts);
  }
};

// Students
export const getStudents = (): Student[] => {
  const data = localStorage.getItem(DB_PREFIX + 'students');
  return data ? JSON.parse(data) : [];
};

export const saveStudents = (students: Student[]) => {
  localStorage.setItem(DB_PREFIX + 'students', JSON.stringify(students));
};

export const addStudent = (student: Student) => {
  const students = getStudents();
  students.push(student);
  saveStudents(students);
};

export const updateStudent = (studentId: string, updates: Partial<Student>) => {
  const students = getStudents();
  const index = students.findIndex(s => s.students_id === studentId);
  if (index !== -1) {
    students[index] = { ...students[index], ...updates };
    saveStudents(students);
  }
};

export const deleteStudent = (studentId: string) => {
  const students = getStudents().filter(s => s.students_id !== studentId);
  saveStudents(students);
};

// Time In
export const getTimeIns = (): TimeIn[] => {
  const data = localStorage.getItem(DB_PREFIX + 'time_in');
  return data ? JSON.parse(data) : [];
};

export const saveTimeIns = (timeIns: TimeIn[]) => {
  localStorage.setItem(DB_PREFIX + 'time_in', JSON.stringify(timeIns));
};

export const addTimeIn = (timeIn: TimeIn) => {
  const timeIns = getTimeIns();
  timeIns.push(timeIn);
  saveTimeIns(timeIns);
};

// Programs
export const getPrograms = (): Program[] => {
  const data = localStorage.getItem(DB_PREFIX + 'programs');
  return data ? JSON.parse(data) : [];
};

export const savePrograms = (programs: Program[]) => {
  localStorage.setItem(DB_PREFIX + 'programs', JSON.stringify(programs));
};

export const addProgram = (program: Program) => {
  const programs = getPrograms();
  programs.push(program);
  savePrograms(programs);
};

export const updateProgram = (programId: string, updates: Partial<Program>) => {
  const programs = getPrograms();
  const index = programs.findIndex(p => p.id === programId);
  if (index !== -1) {
    programs[index] = { ...programs[index], ...updates };
    savePrograms(programs);
  }
};

export const deleteProgram = (programId: string) => {
  const programs = getPrograms().filter(p => p.id !== programId);
  savePrograms(programs);
};

// Courses
export const getCourses = (): Course[] => {
  const data = localStorage.getItem(DB_PREFIX + 'courses');
  return data ? JSON.parse(data) : [];
};

export const saveCourses = (courses: Course[]) => {
  localStorage.setItem(DB_PREFIX + 'courses', JSON.stringify(courses));
};

export const addCourse = (course: Course) => {
  const courses = getCourses();
  courses.push(course);
  saveCourses(courses);
};

export const updateCourse = (courseId: string, updates: Partial<Course>) => {
  const courses = getCourses();
  const index = courses.findIndex(c => c.id === courseId);
  if (index !== -1) {
    courses[index] = { ...courses[index], ...updates };
    saveCourses(courses);
  }
};

export const deleteCourse = (courseId: string) => {
  const courses = getCourses().filter(c => c.id !== courseId);
  saveCourses(courses);
};

// Attendance Schedules
export const getAttendanceSchedules = (): AttendanceSchedule[] => {
  const data = localStorage.getItem(DB_PREFIX + 'attendance_schedules');
  return data ? JSON.parse(data) : [];
};

export const saveAttendanceSchedules = (schedules: AttendanceSchedule[]) => {
  localStorage.setItem(DB_PREFIX + 'attendance_schedules', JSON.stringify(schedules));
};

export const addAttendanceSchedule = (schedule: AttendanceSchedule) => {
  const schedules = getAttendanceSchedules();
  schedules.push(schedule);
  saveAttendanceSchedules(schedules);
};

export const updateAttendanceSchedule = (scheduleId: string, updates: Partial<AttendanceSchedule>) => {
  const schedules = getAttendanceSchedules();
  const index = schedules.findIndex(s => s.id === scheduleId);
  if (index !== -1) {
    schedules[index] = { ...schedules[index], ...updates };
    saveAttendanceSchedules(schedules);
  }
};

export const deleteAttendanceSchedule = (scheduleId: string) => {
  const schedules = getAttendanceSchedules().filter(s => s.id !== scheduleId);
  saveAttendanceSchedules(schedules);
};

// Check if attendance is allowed at current time
export const canTimeInNow = (program: string, course: string, section?: string): boolean => {
  const schedules = getAttendanceSchedules();
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

  // Find matching schedule
  const matchingSchedule = schedules.find(s => {
    const programMatch = s.program === program;
    const courseMatch = s.course === course;
    const sectionMatch = !s.section || s.section === section;
    const dayMatch = s.daysOfWeek.includes(currentDay);
    const timeMatch = currentTime >= s.timeStart && currentTime <= s.timeEnd;

    return programMatch && courseMatch && sectionMatch && dayMatch && timeMatch;
  });

  return !!matchingSchedule;
};

// Initialize data on module load
initializeDefaultData();
