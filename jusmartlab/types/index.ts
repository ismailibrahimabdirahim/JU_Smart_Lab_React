/**
 * JU Smart Lab – shared types (backend-ready)
 */

export type FacultyId = 1 | 2 | 3 | 4 | 5;

export const FACULTY_IDS: FacultyId[] = [1, 2, 3, 4, 5];

export const FACULTY_LABELS: Record<FacultyId, string> = {
  1: 'Computer Science',
  2: 'Medicine',
  3: 'Health Science',
  4: 'Engineering',
  5: 'Economics',
};

export type ProblemType = 'Software' | 'Hardware' | 'Network' | 'Other';

export type ProblemStatus = 'Pending' | 'Fixed';

export interface BatchOption {
  id: string;
  label: string;
  facultyId: FacultyId;
}

export interface ClassOption {
  id: string;
  label: string;
  batchId: string;
}

export interface StudentOption {
  id: string;
  fullName: string;
  classId: string;
}

export interface ProblemSubmission {
  id: string;
  studentName: string;
  facultyId: FacultyId;
  batchId: string;
  classId: string;
  computerNumber: string;
  serverNumber?: string;
  problemType: ProblemType;
  description: string;
  status: ProblemStatus;
  submittedAt: string; // ISO timestamp
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin';
  status: 'active' | 'inactive';
}
