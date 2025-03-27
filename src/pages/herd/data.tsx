export const AttendanceService = {
  getAttendanceData() {
      return [
          {
              id: '1',
              studentId: 'MNC001',
              fullName: 'Nguyễn Văn A',
              className: 'Nhập môn công nghệ',
              attendanceDate: '2025-02-01',
              attendanceStatus: 'Có mặt',
              totalAttendanceDays: 20
          },
          {
              id: '2',
              studentId: 'MNC002',
              fullName: 'Trần Thị B',
              className: 'Nhập môn công nghệ',
              attendanceDate: '2025-02-01',
              attendanceStatus: 'Vắng',
              totalAttendanceDays: 19
          },
          {
              id: '3',
              studentId: 'MNC003',
              fullName: 'Lê Thị C',
              className: 'Nhập môn công nghệ',
              attendanceDate: '2025-02-02',
              attendanceStatus: 'Đến trễ',
              totalAttendanceDays: 18
          },
          {
              id: '4',
              studentId: 'MNC004',
              fullName: 'Phan Văn D',
              className: 'Nhập môn công nghệ',
              attendanceDate: '2025-02-02',
              attendanceStatus: 'Vắng',
              totalAttendanceDays: 17
          },
          {
              id: '5',
              studentId: 'MNC005',
              fullName: 'Nguyễn Thị E',
              className: 'Nhập môn công nghệ',
              attendanceDate: '2025-02-03',
              attendanceStatus: 'Có mặt',
              totalAttendanceDays: 16
          },
          {
              id: '6',
              studentId: 'MNC006',
              fullName: 'Đặng Thị F',
              className: 'Nhập môn công nghệ',
              attendanceDate: '2025-02-03',
              attendanceStatus: 'Có mặt',
              totalAttendanceDays: 15
          },
          {
              id: '7',
              studentId: 'MNC007',
              fullName: 'Bùi Văn G',
              className: 'Nhập môn công nghệ',
              attendanceDate: '2025-02-04',
              attendanceStatus: 'Vắng',
              totalAttendanceDays: 14
          },
          {
              id: '8',
              studentId: 'MNC008',
              fullName: 'Lê Văn H',
              className: 'Nhập môn công nghệ',
              attendanceDate: '2025-02-04',
              attendanceStatus: 'Có mặt',
              totalAttendanceDays: 13
          },
          {
              id: '9',
              studentId: 'MNC009',
              fullName: 'Nguyễn Văn I',
              className: 'Nhập môn công nghệ',
              attendanceDate: '2025-02-05',
              attendanceStatus: 'Có mặt',
              totalAttendanceDays: 12
          },
          {
              id: '10',
              studentId: 'MNC010',
              fullName: 'Trần Thị K',
              className: 'Nhập môn công nghệ',
              attendanceDate: '2025-02-05',
              attendanceStatus: 'Vắng',
              totalAttendanceDays: 11
          }
      ];
  },

  getAttendanceMini() {
      return Promise.resolve(this.getAttendanceData().slice(0, 5));
  },

  getAttendanceSmall() {
      return Promise.resolve(this.getAttendanceData().slice(0, 10));
  },

  getAttendance() {
      return Promise.resolve(this.getAttendanceData());
  },
};
