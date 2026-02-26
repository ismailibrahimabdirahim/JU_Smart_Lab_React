/**
 * Mock data for JU Smart Lab (frontend-only, backend-ready)
 * Data matches the JUSmartLabDB database structure exactly.
 */

import type {
  BatchOption,
  ClassOption,
  StudentOption,
  ProblemSubmission,
  FacultyId,
} from '@/types';

// ============================================================
// BATCHES — matches DB Batches table
// ============================================================
export const MOCK_BATCHES: BatchOption[] = [
  // Computer Science (FacultyID 1)
  { id: 'cs-b16', label: 'B16', facultyId: 1 },
  { id: 'cs-b15', label: 'B15', facultyId: 1 },
  { id: 'cs-b14', label: 'B14', facultyId: 1 },
  { id: 'cs-b13', label: 'B13', facultyId: 1 },
  // Medicine (FacultyID 2)
  { id: 'med-mbbs', label: 'MBBS', facultyId: 2 },
  // Health Science (FacultyID 3)
  { id: 'health-bhs', label: 'BHS', facultyId: 3 },
  // Engineering (FacultyID 4)
  { id: 'eng-b16', label: 'B16', facultyId: 4 },
  { id: 'eng-b15', label: 'B15', facultyId: 4 },
  // Economics (FacultyID 5)
  { id: 'econ-b16', label: 'B16', facultyId: 5 },
  { id: 'econ-b15', label: 'B15', facultyId: 5 },
];

// ============================================================
// CLASSES — matches DB Classes table
// ============================================================
export const MOCK_CLASSES: ClassOption[] = [
  // CS B16
  { id: 'cs-b16-a', label: 'Class A', batchId: 'cs-b16' },
  { id: 'cs-b16-b', label: 'Class B', batchId: 'cs-b16' },
  // CS B15
  { id: 'cs-b15-a', label: 'Class A', batchId: 'cs-b15' },
  { id: 'cs-b15-b', label: 'Class B', batchId: 'cs-b15' },
  // CS B14
  { id: 'cs-b14-a', label: 'Class A', batchId: 'cs-b14' },
  // CS B13
  { id: 'cs-b13-a', label: 'Class A', batchId: 'cs-b13' },
  // Medicine MBBS
  { id: 'med-mbbs-a', label: 'Class A – Girls', batchId: 'med-mbbs' },
  { id: 'med-mbbs-b', label: 'Class B – Boys', batchId: 'med-mbbs' },
  // Health Science BHS
  { id: 'health-bhs-a', label: 'Class A', batchId: 'health-bhs' },
  { id: 'health-bhs-b', label: 'Class B', batchId: 'health-bhs' },
  // Engineering B16
  { id: 'eng-b16-a', label: 'Class A', batchId: 'eng-b16' },
  // Engineering B15
  { id: 'eng-b15-a', label: 'Class A', batchId: 'eng-b15' },
  // Economics B16
  { id: 'econ-b16-a', label: 'Class A', batchId: 'econ-b16' },
  // Economics B15
  { id: 'econ-b15-a', label: 'Class A', batchId: 'econ-b15' },
];

// ============================================================
// STUDENTS — matches DB Students table (all names from DB)
// ============================================================
export const MOCK_STUDENTS: StudentOption[] = [
  // --- Computer Science B16 Class A ---
  { id: 's-cs16a-1', fullName: 'Ahmed Mohamed Ali', classId: 'cs-b16-a' },
  { id: 's-cs16a-2', fullName: 'Fatima Hassan Abdi', classId: 'cs-b16-a' },
  { id: 's-cs16a-3', fullName: 'Omar Yusuf Mohamed', classId: 'cs-b16-a' },
  { id: 's-cs16a-4', fullName: 'Aisha Nur Farah', classId: 'cs-b16-a' },
  { id: 's-cs16a-5', fullName: 'Mohamed Ismail Ahmed', classId: 'cs-b16-a' },

  // --- Computer Science B16 Class B ---
  { id: 's-cs16b-1', fullName: 'Hassan Omar Ali', classId: 'cs-b16-b' },
  { id: 's-cs16b-2', fullName: 'Khadra Ahmed Mohamed', classId: 'cs-b16-b' },
  { id: 's-cs16b-3', fullName: 'Yusuf Abdi Hassan', classId: 'cs-b16-b' },
  { id: 's-cs16b-4', fullName: 'Halima Nur Omar', classId: 'cs-b16-b' },
  { id: 's-cs16b-5', fullName: 'Abdirahman Farah Ismail', classId: 'cs-b16-b' },

  // --- Computer Science B15 Class A ---
  { id: 's-cs15a-1', fullName: 'Ali Ahmed Hassan', classId: 'cs-b15-a' },
  { id: 's-cs15a-2', fullName: 'Maryam Omar Abdi', classId: 'cs-b15-a' },
  { id: 's-cs15a-3', fullName: 'Hassan Yusuf Mohamed', classId: 'cs-b15-a' },
  { id: 's-cs15a-4', fullName: 'Faduma Nur Ahmed', classId: 'cs-b15-a' },
  { id: 's-cs15a-5', fullName: 'Ismail Farah Ali', classId: 'cs-b15-a' },

  // --- Computer Science B15 Class B ---
  { id: 's-cs15b-1', fullName: 'Mohamud Ahmed Geedi', classId: 'cs-b15-b' },
  { id: 's-cs15b-2', fullName: 'Safia Abdi Nur', classId: 'cs-b15-b' },
  { id: 's-cs15b-3', fullName: 'Bashir Omar Hassan', classId: 'cs-b15-b' },
  { id: 's-cs15b-4', fullName: 'Nasra Yusuf Mohamed', classId: 'cs-b15-b' },
  { id: 's-cs15b-5', fullName: 'Ibrahim Ali Farah', classId: 'cs-b15-b' },

  // --- Computer Science B14 Class A ---
  { id: 's-cs14a-1', fullName: 'Aisha Mohamed Duale', classId: 'cs-b14-a' },
  { id: 's-cs14a-2', fullName: 'Omar Hassan Abdi', classId: 'cs-b14-a' },
  { id: 's-cs14a-3', fullName: 'Fartun Ahmed Yusuf', classId: 'cs-b14-a' },
  { id: 's-cs14a-4', fullName: 'Mohamed Nur Ismail', classId: 'cs-b14-a' },
  { id: 's-cs14a-5', fullName: 'Hamdi Ali Barre', classId: 'cs-b14-a' },

  // --- Computer Science B13 Class A ---
  { id: 's-cs13a-1', fullName: 'Abdirahman Ahmed Hassan', classId: 'cs-b13-a' },
  { id: 's-cs13a-2', fullName: 'Habiba Omar Mohamed', classId: 'cs-b13-a' },
  { id: 's-cs13a-3', fullName: 'Yasin Abdi Farah', classId: 'cs-b13-a' },
  { id: 's-cs13a-4', fullName: 'Naima Yusuf Ali', classId: 'cs-b13-a' },
  { id: 's-cs13a-5', fullName: 'Ahmed Nur Geedi', classId: 'cs-b13-a' },

  // --- Medicine Class A – Girls ---
  { id: 's-med-a-1', fullName: 'Amina Ahmed Ali', classId: 'med-mbbs-a' },
  { id: 's-med-a-2', fullName: 'Khadra Omar Mohamed', classId: 'med-mbbs-a' },
  { id: 's-med-a-3', fullName: 'Fadumo Yusuf Abdi', classId: 'med-mbbs-a' },
  { id: 's-med-a-4', fullName: 'Maryam Hassan Nur', classId: 'med-mbbs-a' },
  { id: 's-med-a-5', fullName: 'Halima Farah Ismail', classId: 'med-mbbs-a' },

  // --- Medicine Class B – Boys ---
  { id: 's-med-b-1', fullName: 'Ahmed Mohamed Hassan', classId: 'med-mbbs-b' },
  { id: 's-med-b-2', fullName: 'Omar Ali Yusuf', classId: 'med-mbbs-b' },
  { id: 's-med-b-3', fullName: 'Yusuf Abdi Farah', classId: 'med-mbbs-b' },
  { id: 's-med-b-4', fullName: 'Hassan Nur Ahmed', classId: 'med-mbbs-b' },
  { id: 's-med-b-5', fullName: 'Abdirahman Geedi Mohamed', classId: 'med-mbbs-b' },

  // --- Health Science Class A ---
  { id: 's-health-a-1', fullName: 'Asha Ahmed Omar', classId: 'health-bhs-a' },
  { id: 's-health-a-2', fullName: 'Fatima Mohamed Abdi', classId: 'health-bhs-a' },
  { id: 's-health-a-3', fullName: 'Aisha Yusuf Hassan', classId: 'health-bhs-a' },
  { id: 's-health-a-4', fullName: 'Hawa Ali Nur', classId: 'health-bhs-a' },
  { id: 's-health-a-5', fullName: 'Safia Farah Ismail', classId: 'health-bhs-a' },

  // --- Health Science Class B ---
  { id: 's-health-b-1', fullName: 'Ahmed Omar Mohamed', classId: 'health-bhs-b' },
  { id: 's-health-b-2', fullName: 'Mohamed Abdi Yusuf', classId: 'health-bhs-b' },
  { id: 's-health-b-3', fullName: 'Abdirahman Hassan Ali', classId: 'health-bhs-b' },
  { id: 's-health-b-4', fullName: 'Ismail Nur Farah', classId: 'health-bhs-b' },
  { id: 's-health-b-5', fullName: 'Abdullahi Ahmed Geedi', classId: 'health-bhs-b' },

  // --- Engineering B16 Class A ---
  { id: 's-eng16-a-1', fullName: 'Ahmed Hassan Ali', classId: 'eng-b16-a' },
  { id: 's-eng16-a-2', fullName: 'Omar Mohamed Abdi', classId: 'eng-b16-a' },
  { id: 's-eng16-a-3', fullName: 'Yusuf Ahmed Farah', classId: 'eng-b16-a' },
  { id: 's-eng16-a-4', fullName: 'Fatima Ali Nur', classId: 'eng-b16-a' },
  { id: 's-eng16-a-5', fullName: 'Hassan Mohamed Ismail', classId: 'eng-b16-a' },

  // --- Engineering B15 Class A ---
  { id: 's-eng15-a-1', fullName: 'Mohamed Abdi Hassan', classId: 'eng-b15-a' },
  { id: 's-eng15-a-2', fullName: 'Aisha Omar Yusuf', classId: 'eng-b15-a' },
  { id: 's-eng15-a-3', fullName: 'Abdirahman Ahmed Ali', classId: 'eng-b15-a' },
  { id: 's-eng15-a-4', fullName: 'Halima Nur Mohamed', classId: 'eng-b15-a' },
  { id: 's-eng15-a-5', fullName: 'Ismail Farah Abdi', classId: 'eng-b15-a' },

  // --- Economics B16 Class A ---
  { id: 's-econ16-a-1', fullName: 'Ali Mohamed Hassan', classId: 'econ-b16-a' },
  { id: 's-econ16-a-2', fullName: 'Fatima Abdi Omar', classId: 'econ-b16-a' },
  { id: 's-econ16-a-3', fullName: 'Ahmed Yusuf Nur', classId: 'econ-b16-a' },
  { id: 's-econ16-a-4', fullName: 'Amina Hassan Mohamed', classId: 'econ-b16-a' },
  { id: 's-econ16-a-5', fullName: 'Omar Ali Farah', classId: 'econ-b16-a' },

  // --- Economics B15 Class A ---
  { id: 's-econ15-a-1', fullName: 'Mohamed Hassan Abdi', classId: 'econ-b15-a' },
  { id: 's-econ15-a-2', fullName: 'Khadra Omar Ahmed', classId: 'econ-b15-a' },
  { id: 's-econ15-a-3', fullName: 'Yusuf Ali Mohamed', classId: 'econ-b15-a' },
  { id: 's-econ15-a-4', fullName: 'Halima Nur Hassan', classId: 'econ-b15-a' },
  { id: 's-econ15-a-5', fullName: 'Abdullahi Farah Ismail', classId: 'econ-b15-a' },
];

// ============================================================
// SAMPLE PROBLEMS
// ============================================================
export const MOCK_PROBLEMS: ProblemSubmission[] = [
  {
    id: '1',
    studentName: 'Ahmed Mohamed Ali',
    facultyId: 1 as FacultyId,
    batchId: 'cs-b16',
    classId: 'cs-b16-a',
    computerNumber: '12',
    serverNumber: 'Server 1',
    problemType: 'Software',
    description: 'VS Code not opening',
    status: 'Pending',
    submittedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    studentName: 'Safia Abdi Nur',
    facultyId: 1 as FacultyId,
    batchId: 'cs-b15',
    classId: 'cs-b15-b',
    computerNumber: '5',
    serverNumber: 'Server 1',
    problemType: 'Hardware',
    description: 'Keyboard keys not responding',
    status: 'Fixed',
    submittedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    studentName: 'Ahmed Hassan Ali',
    facultyId: 4 as FacultyId,
    batchId: 'eng-b16',
    classId: 'eng-b16-a',
    computerNumber: '35',
    serverNumber: 'Server 2',
    problemType: 'Network',
    description: 'No internet connection',
    status: 'Pending',
    submittedAt: new Date(Date.now() - 1800000).toISOString(),
  },
];
