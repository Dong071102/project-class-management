// Mỗi phần tử dữ liệu attendance ban đầu
export interface AttendanceItem {
    student_id: string;
    student_code: string;
    first_name: string;
    last_name: string;
    class_id: string;
    class_name: string;
    course_id: string;
    course_name: string;
    status: string;          // "absent" | "present" | "late" | ...
    attendance_time: string; // "0001-01-01T00:00:00Z", ...
    start_time: string;      // "2025-03-28T20:00:00Z", ...
    note: string;
}

// Dữ liệu sau khi đã pivot
export interface Student {
    student_id: string;
    student_code: string;
    first_name: string;
    last_name: string;
    // attendanceByDate: key = "yyyy-MM-dd", value = "absent" | "present" | ...
    attendanceByDate: Record<string, string | undefined>;
}

// Kiểu trả về sau khi transform
export interface TransformResult {
    dates: string[];     // Mảng các ngày duy nhất (định dạng "yyyy-MM-dd")
    students: Student[]; // Mảng sinh viên, mỗi sinh viên có 1 map date -> status
}
export function transformAttendanceData(attendanceData: AttendanceItem[]): TransformResult {
    const uniqueDatesSet = new Set<string>();

    // Map để gom theo student_id
    const studentMap = new Map<string, Student>();

    attendanceData.forEach((item) => {
        // Tách date (yyyy-MM-dd) từ start_time
        const dateKey = item.start_time.split("T")[0];
        uniqueDatesSet.add(dateKey);

        // Nếu chưa có student này trong Map thì khởi tạo
        if (!studentMap.has(item.student_id)) {
            studentMap.set(item.student_id, {
                student_id: item.student_id,
                student_code: item.student_code,
                first_name: item.first_name,
                last_name: item.last_name,
                attendanceByDate: {}
            });
        }

        // Lấy student từ Map
        const studentObj = studentMap.get(item.student_id);
        if (studentObj) {
            // Gán status vào attendanceByDate
            studentObj.attendanceByDate[dateKey] = item.status;
        }
    });

    // Mảng ngày duy nhất (sắp xếp tăng dần)
    const dates = Array.from(uniqueDatesSet).sort();

    // Mảng sinh viên
    const students = Array.from(studentMap.values());

    return { dates, students };
}

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
