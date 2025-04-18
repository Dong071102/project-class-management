import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AuthContext } from '../hooks/user';

// Định nghĩa kiểu dữ liệu cho lớp học
export type oneClass = {
    class_id: string;
    class_name: string;
    course_id: string;
    course_name: string;
    semester_id: string;  // Học kỳ
};

// Định nghĩa kiểu dữ liệu cho học kỳ
export type Semester = {
    semester_id: string;
    semester: string; // Ví dụ: "Học kỳ 1"
    academic_year: string; // Ví dụ: "2023-2024"
};

interface ClassContextType {
    selectedClass: oneClass | null;
    setSelectedClass: (selected: oneClass | null) => void;
    classes: oneClass[];
    setClasses: (classes: oneClass[]) => void;
    semesters: Semester[];
    selectedSemester: Semester | null;
    setSelectedSemester: (semester: Semester | null) => void;
    loading: boolean;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export const ClassProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedClass, setSelectedClass] = useState<oneClass | null>(null);
    const [classes, setClasses] = useState<oneClass[]>([]);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const { currentUser } = useContext(AuthContext);

    // Fetch dữ liệu lớp học và học kỳ
    useEffect(() => {
        const fetchClassData = async () => {
            try {
                // Lấy lớp học từ API
                const semesterResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/semesters`);
                const semesterData: Semester[] = await semesterResponse.json();
                const defaultSemester: Semester = {
                    semester_id: "0", // Hoặc null, tuỳ logic xử lý
                    semester: ": toàn bộ",
                    academic_year: "năm học toàn bộ",
                    // Thêm các field khác nếu cần thiết tùy theo định nghĩa interface `Semester`
                };
                const updatedSemesterList = [defaultSemester, ...semesterData];
                setSemesters(updatedSemesterList);

                // Chọn học kỳ mặc định là học kỳ đầu tiên
                if (semesterData.length > 0) {
                    setSelectedSemester(semesterData[0]);
                    console.log('set default semester ', semesterData[0])
                }
                console.log("semesterData", semesterData);
                const classResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/classes/${currentUser?.userId}`);
                
                console.log("classResponse", `${import.meta.env.VITE_API_BASE_URL}/classes/${currentUser?.userId}`);
                const classData: oneClass[] = await classResponse.json();
                console.log('classData', classData)
                const defaultClass = {
                    class_id: "0",
                    class_name: "Tất cả lớp học",
                    course_id: '0',
                    course_name: "khoá học",
                    semester_id: "0"
                };

                // Thêm lớp học mặc định vào danh sách lớp
                if (classData && classData.length > 0) {
                    classData.splice(0, 0, defaultClass);
                    setClasses(classData);
                    setSelectedClass(defaultClass);
                } else {
                    setClasses(classData);
                }

                // Fetch danh sách học kỳ


                setLoading(false);
            } catch (error) {
                console.error("Error fetching:", error);
                setLoading(false);
            }
        };

        fetchClassData();
    }, [currentUser]);

    return (
        <ClassContext.Provider
            value={{
                selectedClass,
                setSelectedClass,
                classes,
                setClasses,
                semesters,
                selectedSemester,
                setSelectedSemester,
                loading,
            }}
        >
            {children}
        </ClassContext.Provider>
    );
};

// Custom hook để truy cập dữ liệu context
export const useClassContext = (): ClassContextType => {
    const context = useContext(ClassContext);
    if (!context) {
        throw new Error('useClassContext must be used within a ClassProvider');
    }
    return context;
};
