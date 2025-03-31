// data.ts
export interface Student {
    id: string;  // id của sinh viên
    studentCode: string;  // mã sinh viên
    fullName: string;  // tên đầy đủ
    attendanceDays: number;  // tổng số ngày tham gia
    presentDays: number;  // số ngày có mặt
    lateDatys: number;  // số ngày đi muộn
    absentDatys: number;  // số ngày vắng mặt
}

export const StudentService = {
    // Thay thế từ dữ liệu giả thành gọi API thực tế
    getStudents(selectedClassId: string, selectedCourse: string, selectedUser: string) {
        let apiUrl = `${import.meta.env.VITE_API_BASE_URL}/student-attendance-summary/${selectedUser}`;  // Thay thế với URL thực tế

        if (selectedClassId !== '' && selectedClassId !== '0') {
            apiUrl = `${apiUrl}?class_id=${selectedClassId}`;
        }
        // URL API thực tế bạn muốn gọi
        console.log('call api', apiUrl)
        return fetch(apiUrl)
            .then((res) => res.json()) // Giải mã dữ liệu JSON từ API
            .then((d) => {
                // Dữ liệu trả về từ API đã cung cấp các trường tương ứng với `Student` interface
                return d.map((student: any) => ({
                    id: student.studentId,  // ID của sinh viên từ trường `studentId` trong dữ liệu trả về
                    studentCode: student.studentCode,  // studentCode làm `studentId`
                    fullName: student.fullName,
                    attendanceDays: student.attendanceDays,  // Chuyển đổi số ngày tham gia thành dạng "x/15"
                    presentDays: student.presentDays,  // Dữ liệu trực tiếp từ API
                    lateDatys: student.lateDays,  // Dữ liệu trực tiếp từ API
                    absentDatys: student.absentDays  // Dữ liệu trực tiếp từ API
                })) as Student[];  // Đảm bảo trả về kiểu `Student[]`
            })
            .catch((error) => {
                // Fallback data khi không thể fetch từ API
                console.error("Error fetching student data:", error);
                return Promise.resolve([

                ] as Student[]);  // Dữ liệu giả để fallback
            });
    }
};
