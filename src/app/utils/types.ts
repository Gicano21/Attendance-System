// Data types for the attendance system

export interface Student {
  students_id: string;
  lastName: string;
  firstName: string;
  middleName: string;
  extensionName?: string;
  sex: 'Male' | 'Female';
  age: number;
  program: string;
  year: string;
  courses: string[]; // Multiple courses
  section?: string;
  accountHolder: string[]; // Multiple instructors
}

export interface TimeIn {
  students_id: string;
  course: string;
  date: string;
  time: string;
}

export interface AdminAccount {
  account_id: number;
  username: string;
  gmail: string;
  password: string;
}

export interface Program {
  id: string;
  name: string;
}

export interface Course {
  id: string;
  name: string;
  programs: string[]; // Multiple programs
}

export interface AttendanceSchedule {
  id: string;
  program: string;
  course: string;
  section?: string;
  timeStart: string; // e.g., "13:00"
  timeEnd: string; // e.g., "14:00"
  daysOfWeek: string[]; // e.g., ["Monday", "Wednesday"]
}
