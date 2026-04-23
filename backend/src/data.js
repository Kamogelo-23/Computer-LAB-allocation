export const initialDb = {
  venues: [
    { id: 'v1', name: 'Lab A1', capacity: 40, type: 'lab', hasComputers: true },
    { id: 'v2', name: 'Hall B2', capacity: 120, type: 'lecture', hasComputers: false },
    { id: 'v3', name: 'Lab C4', capacity: 32, type: 'lab', hasComputers: true },
    { id: 'v4', name: 'Seminar D3', capacity: 25, type: 'seminar', hasComputers: false },
  ],
  courses: [
    { id: 'c1', code: 'CSC301', name: 'Advanced Databases', groupSize: 35, requiresLab: true, section: 'A', lecturerId: 'u3' },
    { id: 'c2', code: 'MAT210', name: 'Discrete Mathematics', groupSize: 90, requiresLab: false, section: 'MAIN', lecturerId: 'u4' },
    { id: 'c3', code: 'INF220', name: 'Systems Analysis', groupSize: 45, requiresLab: false, section: 'B', lecturerId: 'u3' },
    { id: 'c4', code: 'CSC410', name: 'Machine Learning', groupSize: 28, requiresLab: true, section: 'A', lecturerId: 'u4' },
  ],
  users: [
    { id: 'u1', name: 'Leila Moyo', email: 'lmoyo@tut.ac.za', role: 'Admin', courses: [], password: 'demo', settings: { emailNotif: true, inAppNotif: true, compact: false } },
    { id: 'u2', name: 'Sam Dube', email: 'sdube@tut.ac.za', role: 'Scheduler', courses: [], password: 'demo', settings: { emailNotif: true, inAppNotif: true, compact: false } },
    { id: 'u3', name: 'Dr Ndlovu', email: 'ndlovu@tut.ac.za', role: 'Lecturer', courses: ['c1', 'c3'], password: 'demo', settings: { emailNotif: true, inAppNotif: true, compact: false } },
    { id: 'u4', name: 'Dr Dlamini', email: 'dlamini@tut.ac.za', role: 'Lecturer', courses: ['c2', 'c4'], password: 'demo', settings: { emailNotif: true, inAppNotif: true, compact: false } },
  ],
  allocations: [
    { id: 'a1', courseId: 'c1', venueId: 'v1', lecturerId: 'u3', date: '2026-04-21', startTime: '09:00', endTime: '11:00', createdBy: 'u2', createdAt: new Date().toISOString() },
    { id: 'a2', courseId: 'c2', venueId: 'v2', lecturerId: 'u4', date: '2026-04-22', startTime: '13:00', endTime: '15:00', createdBy: 'u2', createdAt: new Date().toISOString() },
  ],
  notifications: [
    { id: 'n1', fromUserId: 'u2', toRole: 'All', toUserId: null, title: 'Welcome to LabConnect', message: 'The new scheduling platform is live!', createdAt: new Date().toISOString(), readBy: [] },
    { id: 'n2', fromUserId: 'u1', toRole: 'Lecturer', toUserId: null, title: 'Timetable Published', message: 'Semester 1 timetables are now available.', createdAt: new Date().toISOString(), readBy: [] },
  ],
  logs: [],
};
