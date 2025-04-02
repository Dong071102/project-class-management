import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { format, startOfWeek, addDays, parse, getWeek, isBefore, isEqual, isAfter } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from "primereact/toast";
import { AuthContext } from '../../hooks/user';
import { toZonedTime } from 'date-fns-tz';
// --- Interface cho dữ liệu môn học ---
interface ScheduleFetched {
    schedule_id: string;
    course_name: string;
    course_id: string;
    class_id: string;
    class_name: string;
    lecturer_id: string;
    classroom_id: string;
    room_name: string;
    start_time: string; // ISO string, ví dụ "2025-03-28T20:00:00Z"
    end_time: string;   // ISO string
    topic: string;
    description: string;
}
interface Subject {
    id: string;
    day: number;
    name: string;
    courseId: string;
    roomId: string;
    roomName: string;
    classId: string;
    topic: string;
    description: string;
    lecturerId: string;
    startTime: string; // Format "HH:mm"
    endTime: string;   // Format "HH:mm"
    class: string;
    classroom: string;
    color?: string;
    date: Date;
    editable: boolean;
}
interface Classroom {
    classroom_id: string;
    room_name: string;
    room_type: string;
    location: string;
    description: string;

}
interface Course {
    course_id: string;
    course_name: string;
    main_lecturer: string;
    total_lesson: number;
}
interface Class {
    class_id: string;
    class_name: string;
    course_id: string;
    lecturer_id: string;
    current_lession: string;

}
// --- Dữ liệu mẫu ---

// --- Cấu hình Lịch ---
const START_HOUR = 7;
const END_HOUR = 19;
const HOUR_HEIGHT_PX = 60;
const WEEK_STARTS_ON: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1;

const WeeklyScheduler: React.FC = () => {

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [newSubject, setNewSubject] = useState<Omit<Subject, 'id' | 'day' | 'date'>>({
        name: "",
        startTime: "",
        endTime: "",
        class: "",
        classroom: "",
        courseId: "",
        lecturerId: "",
        roomId: "",
        roomName: "",
        classId: "",
        color: 'bg-green-100 border-green-300',
        editable: true,
        topic: "",
        description: ""
    });

    const { currentUser } = useContext(AuthContext);
    const [selectedDateForNewSubject, setSelectedDateForNewSubject] = useState<Date | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
    const [timeError, setTimeError] = useState('');
    const [classroomOptions, setClassroomOptions] = useState<Classroom[]>([]);
    const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const [loadingSubjects, setLoadingSubjects] = useState<boolean>(false);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course>();
    const [coursesLoading, setCoursesLoading] = useState<boolean>(true);
    const [classes, setClasses] = useState<Class[]>([]); // ✅ Đảm bảo khởi tạo []
    const [selectedClass, setSelectedClass] = useState<Class>();
    const [classesLoading, setSlassesLoading] = useState<boolean>(true);
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: 19 - 7 }, (_, i) => 7 + i);

    // --- Hàm tính toán vị trí và chiều cao cho sự kiện ---
    const calculateStyle = (startTime: string, endTime: string): React.CSSProperties => {
        const baseDate = new Date(2000, 0, 1); // ngày bất kỳ

        const start = parse(startTime, 'HH:mm', baseDate);
        const end = parse(endTime, 'HH:mm', baseDate);

        // ✅ Nếu end nhỏ hơn hoặc bằng start → cộng 1 ngày (qua đêm)
        if (end <= start) {
            end.setDate(end.getDate() + 1);
        }

        // Số phút từ 00:00
        const startMinutes = start.getHours() * 60 + start.getMinutes();
        const endMinutes = end.getHours() * 60 + end.getMinutes();

        // Số phút tính từ giờ bắt đầu của lịch
        const top = ((startMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT_PX;
        const height = ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT_PX;

        return {
            top: `${Math.max(0, top)}px`,
            height: `${Math.max(1, height)}px`, // ít nhất là 1px để hiển thị
            position: 'absolute',
            left: '3px',
            right: '3px',
            zIndex: 10,
        };
    };


    useEffect(() => {
        setLoading(true);
        fetch(`${import.meta.env.VITE_API_BASE_URL}/get-classrooms`)
            .then(response => response.json())
            .then((data: Classroom[]) => {
                if (Array.isArray(data)) {
                    const modifiedData: Classroom[] = [
                        { classroom_id: '0', room_name: 'Lịch dạy của tôi', room_type: '', location: '', description: '' }, // phần tử bạn muốn thêm đầu tiên
                        ...data
                    ];
                    setClassroomOptions(modifiedData);
                    setSelectedClassroom(modifiedData[0]); // chọn mặc định là phần tử đầu tiên
                } else {
                    setClassroomOptions([]);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error("Lỗi khi tải classroom options:", error);
                setLoading(false);
            });
    }, []);

    function convertSchedulesToSubjects(schedules: ScheduleFetched[], currentUserId: string): Subject[] {
        return schedules.map((schedule) => {
            // 🔥 Loại bỏ "Z" nếu không thực sự là UTC
            const cleanStart = schedule.start_time.replace('Z', '').replace('T', ' ');
            const cleanEnd = schedule.end_time.replace('Z', '').replace('T', ' ');

            const startDate = parse(cleanStart, 'yyyy-MM-dd HH:mm:ss', new Date());
            const endDate = parse(cleanEnd, 'yyyy-MM-dd HH:mm:ss', new Date());

            if (endDate < startDate) {
                endDate.setDate(endDate.getDate() + 1);
            }

            const day = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1;
            const startTimeFormatted = format(startDate, 'HH:mm');
            const endTimeFormatted = format(endDate, 'HH:mm');
            const color = schedule.lecturer_id === currentUserId
                ? 'bg-green-100 border-green-300'
                : 'bg-red-100 border-red-300';
            //bg-green-100 border-gray-300
            const editable = schedule.lecturer_id === currentUserId;
            return {
                id: schedule.schedule_id,
                day,
                name: schedule.course_name,
                courseId: schedule.course_id,
                roomId: schedule.classroom_id,
                roomName: schedule.room_name,
                classId: schedule.class_id,
                lecturerId: schedule.lecturer_id,
                startTime: startTimeFormatted,
                endTime: endTimeFormatted,
                class: schedule.class_name,
                classroom: schedule.classroom_id,
                color,
                date: startDate,
                topic: schedule.topic || '', // Add topic
                description: schedule.description || '', // Add description
                editable: editable,

            };
        });
    }

    useEffect(() => {
        if (selectedClassroom) {
            setLoadingSubjects(true);

            const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
            const weekStartStr = format(weekStart, 'yyyy-MM-dd');

            let url = `${import.meta.env.VITE_API_BASE_URL}/get-schedules?week_start=${weekStartStr}`;

            if (selectedClassroom.classroom_id === '0') {
                // Nếu chọn "Tất cả lớp học", thay vào đó dùng lecturer_id
                url += `&lecturer_id=${currentUser?.userId}`;
            } else {
                // Nếu chọn lớp học cụ thể
                url += `&classroom_id=${selectedClassroom.classroom_id}`;
            }

            console.log('fetching schedules from:', url);

            fetch(url)
                .then(response => response.json())
                .then((data: ScheduleFetched[]) => {
                    const converted = convertSchedulesToSubjects(data, currentUser?.userId || '');
                    setSubjects(converted);
                    setLoadingSubjects(false);
                })
                .catch(error => {
                    console.error("Lỗi khi tải Subject:", error);
                    setLoadingSubjects(false);
                });
        }
    }, [selectedClassroom, currentDate, currentUser]);


    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/get-courses-by-lecturerID?lecturer_id=${currentUser?.userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data: Course[]) => {

                setCourses(data);
                setCoursesLoading(false);
            })
            .catch(error => {
                setCourses([]);

                console.error('Error fetching courses:', error);
                setCoursesLoading(false);
            });
    }, [selectedCourse]);


    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/get-class-by-course-id?course_id=${selectedCourse?.course_id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data: Class[]) => {

                setClasses(data);
                setSlassesLoading(false);
            })
            .catch(error => {
                setClasses([]);

                console.error('Error fetching courses:', error);
                setSlassesLoading(false);
            });
    }, [selectedCourse]);

    // --- Xử lý thay đổi giờ bắt đầu với kiểm tra ---
    const handleStartTimeChange = (e: any) => {
        const time = e.value as Date;
        const formattedTime = format(time, 'HH:mm');
        setNewSubject({ ...newSubject, startTime: formattedTime });
        if (newSubject.endTime) {
            const start = parse(formattedTime, 'HH:mm', new Date());
            const end = parse(newSubject.endTime, 'HH:mm', new Date());
            if (end < start) {
                setTimeError('Giờ kết thúc không được nhỏ hơn giờ bắt đầu');
            } else {
                setTimeError('');
            }
        }
    };

    // --- Xử lý thay đổi giờ kết thúc với kiểm tra ---
    const handleEndTimeChange = (e: any) => {
        const time = e.value as Date;
        const formattedTime = format(time, 'HH:mm');
        setNewSubject({ ...newSubject, endTime: formattedTime });
        if (newSubject.startTime) {
            const start = parse(newSubject.startTime, 'HH:mm', new Date());
            const end = parse(formattedTime, 'HH:mm', new Date());
            if (end < start) {
                setTimeError('Giờ kết thúc không được nhỏ hơn giờ bắt đầu');
            } else {
                setTimeError('');
            }
        }
    };
    // --- Xử lý thêm môn học ---

    function isOverlapping(newStart: Date, newEnd: Date, day: Date, editingId: string | null): boolean {
        return subjects.some(subject => {
            if (editingId && subject.id === editingId) return false;
            if (format(subject.date, 'yyyy-MM-dd') !== format(day, 'yyyy-MM-dd')) return false;

            const existingStart = parse(subject.startTime, 'HH:mm', subject.date);
            const existingEnd = parse(subject.endTime, 'HH:mm', subject.date);

            return (
                (isBefore(newStart, existingEnd) && isAfter(newEnd, existingStart)) ||
                isEqual(newStart, existingStart) ||
                isEqual(newEnd, existingEnd)
            );
        });
    }
    const handleAddSubject = async () => {
        if (!newSubject.name || !newSubject.startTime || !newSubject.endTime || !selectedDateForNewSubject || !selectedClassroom || selectedClassroom.classroom_id === '0') {
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng nhập đầy đủ thông tin.', life: 3000 });
            return;
        }

        const baseDate = new Date(2000, 0, 1);
        let start = parse(newSubject.startTime, 'HH:mm', baseDate);
        let end = parse(newSubject.endTime, 'HH:mm', baseDate);

        if (start >= end) {
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi giờ học',
                detail: 'Giờ bắt đầu phải nhỏ hơn giờ kết thúc.',
                life: 3000
            });
            return;
        }

        const fullStart = new Date(Date.UTC(
            selectedDateForNewSubject.getFullYear(),
            selectedDateForNewSubject.getMonth(),
            selectedDateForNewSubject.getDate(),
            start.getHours(),
            start.getMinutes(),
            0
        ));

        const fullEnd = new Date(Date.UTC(
            selectedDateForNewSubject.getFullYear(),
            selectedDateForNewSubject.getMonth(),
            selectedDateForNewSubject.getDate() + (end.getDate() !== start.getDate() ? 1 : 0),
            end.getHours(),
            end.getMinutes(),
            0
        ));

        if (isOverlapping(fullStart, fullEnd, selectedDateForNewSubject, null)) {
            toast.current?.show({ severity: 'warn', summary: 'Trùng lịch', detail: 'Thời gian bị trùng với buổi học khác!', life: 3000 });
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/add-schedule`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    class_id: newSubject.classId,
                    classroom_id: selectedClassroom.classroom_id,
                    start_time: fullStart.toISOString(),
                    end_time: fullEnd.toISOString(),
                    topic: newSubject.topic,
                    description: newSubject.description,
                })
            });

            if (!response.ok) throw new Error('Lỗi khi thêm buổi học');

            const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
            const weekStartStr = format(weekStart, 'yyyy-MM-dd');
            let url = `${import.meta.env.VITE_API_BASE_URL}/get-schedules?week_start=${weekStartStr}`;
            if (selectedClassroom.classroom_id === '0') url += `&lecturer_id=${currentUser?.userId}`;
            else url += `&classroom_id=${selectedClassroom.classroom_id}`;

            const res = await fetch(url);
            const data: ScheduleFetched[] = await res.json();
            setSubjects(convertSchedulesToSubjects(data, currentUser?.userId || ''));

            toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm lịch học.', life: 3000 });
            hideDialog();
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: err.message, life: 3000 });
        }
    };




    // --- Xử lý chỉnh sửa môn học ---

    const handleEditSubject = async () => {
        if (!editingSubjectId || !newSubject.name || !newSubject.startTime || !newSubject.endTime || !selectedDateForNewSubject || !selectedClassroom || selectedClassroom.classroom_id === '0') {
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng nhập đầy đủ thông tin.', life: 3000 });
            return;
        }

        const baseDate = new Date(2000, 0, 1);
        let start = parse(newSubject.startTime, 'HH:mm', baseDate);
        let end = parse(newSubject.endTime, 'HH:mm', baseDate);

        if (end <= start) {
            end = addDays(end, 1);
        }

        const fullStart = new Date(selectedDateForNewSubject);
        fullStart.setHours(start.getHours(), start.getMinutes(), 0, 0);

        const fullEnd = new Date(selectedDateForNewSubject);
        if (end.getDate() !== start.getDate()) {
            fullEnd.setDate(fullEnd.getDate() + 1);
        }
        fullEnd.setHours(end.getHours(), end.getMinutes(), 0, 0);

        if (isOverlapping(fullStart, fullEnd, selectedDateForNewSubject, editingSubjectId)) {
            toast.current?.show({ severity: 'warn', summary: 'Trùng lịch', detail: 'Thời gian bị trùng với buổi học khác!', life: 3000 });
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/update-schedule/${editingSubjectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    class_id: newSubject.classId,
                    classroom_id: selectedClassroom.classroom_id,
                    start_time: fullStart.toISOString(),
                    end_time: fullEnd.toISOString(),
                    topic: newSubject.topic,
                    description: newSubject.description,
                })
            });

            if (!response.ok) throw new Error('Lỗi khi cập nhật buổi học');

            const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
            const weekStartStr = format(weekStart, 'yyyy-MM-dd');
            let url = `${import.meta.env.VITE_API_BASE_URL}/get-schedules?week_start=${weekStartStr}`;
            if (selectedClassroom.classroom_id === '0') url += `&lecturer_id=${currentUser?.userId}`;
            else url += `&classroom_id=${selectedClassroom.classroom_id}`;

            const res = await fetch(url);
            const data: ScheduleFetched[] = await res.json();
            setSubjects(convertSchedulesToSubjects(data, currentUser?.userId || ''));

            toast.current?.show({ severity: 'success', summary: 'Cập nhật', detail: 'Lịch học đã được cập nhật.', life: 3000 });
            hideDialog();
        } catch (err: any) {
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: err.message, life: 3000 });
        }
    };




    // --- Xử lý xóa môn học ---

    const handleDeleteSubject = async () => {
        if (!editingSubjectId) return;
        console.log('editingSubjectId', editingSubjectId)
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/delete-schedule/${editingSubjectId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Lỗi khi xóa lịch học');

            const updatedSubjects = subjects.filter(subject => subject.id !== editingSubjectId);
            setSubjects(updatedSubjects);

            toast.current?.show({ severity: 'success', summary: 'Đã xóa', detail: 'Lịch học đã được xóa.', life: 3000 });
            hideDialog();
        } catch (error: any) {
            toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: error.message, life: 3000 });
        }
    };
    const timeValidationMessage = useMemo(() => {
        if (!newSubject.startTime || !newSubject.endTime) return null;

        const base = new Date(2000, 0, 1);
        const start = parse(newSubject.startTime, 'HH:mm', base);
        const end = parse(newSubject.endTime, 'HH:mm', base);

        return start >= end ? 'Giờ bắt đầu phải nhỏ hơn giờ kết thúc.' : null;
    }, [newSubject.startTime, newSubject.endTime]);


    // --- Xử lý khi click vào ô giờ trống ---
    const handleCellClick = (dayIndex: number, hour: number) => {
        if (!selectedClassroom || selectedClassroom.classroom_id === '0') {
            toast.current?.show({
                severity: "warn",
                summary: "Thông báo",
                detail: "Vui lòng chọn phòng học trước khi thêm lịch học.",
                life: 3000
            });
            return;
        }
        setSelectedDayIndex(dayIndex);
        const clickedDate = days[dayIndex];
        setSelectedDateForNewSubject(clickedDate);
        const suggestedStartTime = `${hour.toString().padStart(2, '0')}:00`;
        const suggestedEndTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
        setSelectedTime(suggestedStartTime);
        setNewSubject({ ...newSubject, startTime: suggestedStartTime, endTime: suggestedEndTime });
        setEditingSubjectId(null);
        setIsDialogOpen(true);
    };

    // --- Xử lý khi click vào môn học đã có ---
    const handleSubjectClick = (subject: Subject) => {
        setEditingSubjectId(subject.id);
        setNewSubject({
            name: subject.name,
            startTime: subject.startTime,
            endTime: subject.endTime,
            class: subject.class,
            classroom: subject.classroom,
            courseId: subject.courseId,
            roomId: subject.roomId,
            roomName: subject.roomName,
            classId: subject.classId,
            lecturerId: currentUser?.userId || "", // Ensure lecturerId is included
            color: subject.color || 'bg-green-100 border-green-300',
            editable: subject.editable, // ✅ lấy đúng giá trị
            topic: subject.topic, description: subject.description
        });
        setSelectedDateForNewSubject(subject.date);
        const dayIndex = days.findIndex(d => d.toDateString() === subject.date.toDateString());
        setSelectedDayIndex(dayIndex);
        setIsDialogOpen(true);
    };

    // --- Hàm đóng Dialog ---
    const hideDialog = () => {
        setIsDialogOpen(false);
        setEditingSubjectId(null);
        setSelectedDayIndex(null);
        setSelectedTime(null);
        setSelectedDateForNewSubject(null);
        setNewSubject({ name: "", startTime: "", endTime: "", class: "", classroom: "", lecturerId: currentUser?.userId || "", courseId: "", roomId: "", roomName: "", classId: "", color: 'bg-green-100 border-green-300', topic: '', description: '', editable: true });
    };

    // --- Dialog Footer ---
    const dialogFooter = () => (
        <div>
            <Button
                label="Hủy"
                onClick={hideDialog}
                className="p-button-danger"
                style={{ backgroundColor: '#fcbe31', color: 'white', border: '1px solid #fcbe31' }} />

            {editingSubjectId !== null ? (
                newSubject.editable ? ( // ✅ kiểm tra quyền chỉnh sửa
                    <>
                        <Button
                            label="Xóa"
                            onClick={handleDeleteSubject}
                            className="p-button-danger"
                            style={{ backgroundColor: '#fb2c36', color: 'white', border: '1px solid #fb2c36' }}
                        />
                        <Button
                            label="Lưu Thay Đổi"
                            icon="pi pi-check"
                            onClick={handleEditSubject}
                            autoFocus
                        />
                    </>
                ) : (
                    <small className="text-red-500 pl-2">Bạn không có quyền chỉnh sửa lịch này.</small>
                )
            ) : (
                <Button label="Lưu" onClick={handleAddSubject} autoFocus />
            )}
        </div>
    );

    const goToPreviousWeek = () => setCurrentDate(addDays(currentDate, -7));
    const goToNextWeek = () => setCurrentDate(addDays(currentDate, 7));
    const goToCurrentWeek = () => setCurrentDate(new Date());

    return (
        <div>
            <Toast ref={toast} />

            <div className="flex flex-col h-screen p-4 bg-gray-50 text-sm">
                {/* Header: Tuần, Điều hướng và Dropdown chọn tòa nhà/phòng */}
                <div className="flex justify-between items-center mb-4 px-2">
                    <div className="flex items-center gap-2">
                        <Button icon="pi pi-angle-left" onClick={goToPreviousWeek} className="p-button-sm p-button-rounded p-button-text" />
                        <Button icon="pi pi-angle-right" onClick={goToNextWeek} className="p-button-sm p-button-rounded p-button-text" />
                        <Button label="Hôm nay" onClick={goToCurrentWeek} className="p-button-sm p-button-outlined" />
                        <h2 className="text-xl font-semibold ml-4">
                            Tuần {getWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON, locale: vi })}
                            <span className="text-base font-normal ml-2">
                                ({format(weekStart, 'dd/MM')} - {format(addDays(weekStart, 6), 'dd/MM/yyyy')})
                            </span>
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Dropdown
                            id="classroomHeader"
                            value={selectedClassroom}
                            options={classroomOptions}
                            optionLabel="room_name"
                            onChange={(e) => setSelectedClassroom(e.value)}
                            placeholder="Chọn tòa nhà/phòng"
                        />
                    </div>
                </div>

                {/* Container cho Lịch */}
                <div className="flex flex-grow overflow-auto border border-gray-300 rounded shadow">
                    {/* Cột hiển thị Giờ */}
                    <div className="w-16 text-xs text-right bg-gray-100 border-r border-gray-300 sticky left-0 z-30">
                        <div className="h-10 border-b border-gray-300 sticky top-0 z-50 bg-gray-100"></div>
                        {hours.map(hour => (
                            <div
                                key={`time-${hour}`}
                                style={{ height: `${HOUR_HEIGHT_PX}px` }}
                                className="flex items-center justify-end pr-2 border-b border-gray-200"
                            >
                                {`${hour.toString().padStart(2, '0')}:00`}
                            </div>
                        ))}
                    </div>

                    {/* Lưới chính của Lịch (7 ngày) */}
                    <div className="flex-grow grid grid-cols-7">
                        {days.map((day, dayIndex) => (
                            <div key={day.toISOString()} className="relative border-r border-gray-200 last:border-r-0">
                                <div className="h-10 text-center border-b border-gray-300 sticky top-0 z-50 bg-white flex flex-col justify-center">
                                    <span className="font-semibold capitalize">{format(day, "eeee", { locale: vi })}</span>
                                    <span className="text-xs text-gray-500">{format(day, "dd/MM")}</span>
                                </div>
                                <div className="relative bg-white">
                                    {hours.map(hour => (
                                        <div
                                            key={`${dayIndex}-${hour}`}
                                            style={{ height: `${HOUR_HEIGHT_PX}px` }}
                                            className="border-b border-gray-200 hover:bg-sky-50 cursor-pointer transition-colors duration-150"
                                            onClick={() => handleCellClick(dayIndex, hour)}
                                            title={`Thêm vào ${format(day, "EEEE", { locale: vi })} lúc ${hour}:00`}
                                        ></div>
                                    ))}
                                    {subjects
                                        .filter(subject => format(subject.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
                                        .map((subject) => {
                                            const style = calculateStyle(subject.startTime, subject.endTime);
                                            if (!style.top || !style.height || style.visibility === 'hidden') return null;
                                            return (
                                                <div
                                                    key={subject.id}
                                                    style={style}
                                                    className={`rounded border p-1 text-[11px] leading-tight overflow-hidden shadow-sm hover:shadow-md hover:z-20 transition-shadow duration-150 cursor-pointer ${subject.color || 'bg-green-100 border-green-300'}`}
                                                    title={`${subject.name} (${subject.startTime} - ${subject.endTime})\nLớp: ${subject.class}\nTòa: ${subject.roomName}`}
                                                    onClick={() => handleSubjectClick(subject)}
                                                >
                                                    <p className="font-semibold truncate">{subject.name}</p>
                                                    <p className="truncate">Lớp: {subject.class} </p>
                                                    <p className="truncate">{subject.startTime} - {subject.endTime}</p>
                                                    <p className="truncate">Phòng học:  {subject.roomName}</p>
                                                </div>
                                            );
                                        })}

                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dialog Thêm/Chỉnh Sửa Môn Học (không có trường chọn tòa nhà/phòng) */}
                <Dialog
                    header={
                        <div className="flex flex-col items-center">
                            <span>
                                {editingSubjectId !== null ? "Chỉnh sửa Môn Học" : "Thêm Môn Học"}
                            </span>
                            {selectedDateForNewSubject && (
                                <span className="text-sm text-gray-600">
                                    {format(selectedDateForNewSubject, "eeee, dd/MM/yyyy", { locale: vi })}
                                </span>
                            )}
                        </div>



                    }
                    visible={isDialogOpen}
                    style={{ width: 'min(90vw, 400px)' }}
                    modal
                    footer={dialogFooter}
                    onHide={hideDialog}
                >
                    <div className="p-fluid flex flex-col gap-4 mt-4">
                        <div className="p-field">
                            <label className="font-semibold mb-1 block">Tên môn học *</label>
                            <Dropdown
                                id="subjectName"
                                value={courses.find(c => c.course_id === newSubject.courseId) || null}
                                optionLabel="course_name"
                                options={courses}
                                onChange={(e) => {
                                    setNewSubject({
                                        ...newSubject,
                                        name: e.value.course_name,
                                        courseId: e.value.course_id,
                                    });
                                    setSelectedCourse(e.value);
                                }}
                                placeholder="Chọn môn học"
                            />
                        </div>
                        <div className="p-field">
                            <label className="font-semibold mb-1 block">Lớp học *</label>
                            <Dropdown
                                id="className"
                                emptyMessage="Chưa có lớp học nào được thêm vào môn học này"
                                value={(classes || []).find(cls => cls.class_id === newSubject.classId) || null}
                                options={classes || []}
                                optionLabel="class_name"
                                onChange={(e) => {
                                    setNewSubject({
                                        ...newSubject,
                                        class: e.value.class_name,
                                        classId: e.value.class_id,
                                    });
                                    setSelectedClass(e.value);
                                }}
                                placeholder="Chọn lớp học"
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="p-field flex-1">
                                <label className="font-semibold mb-1 block">Giờ bắt đầu *</label>
                                <Calendar
                                    value={newSubject.startTime ? parse(newSubject.startTime, 'HH:mm', new Date()) : undefined}
                                    onChange={(e) => e.value && setNewSubject({ ...newSubject, startTime: format(e.value, 'HH:mm') })}
                                    timeOnly
                                    hourFormat="24"
                                    required
                                />
                            </div>
                            <div className="p-field flex-1">
                                <label className="font-semibold mb-1 block">Giờ kết thúc *</label>
                                <Calendar
                                    value={newSubject.endTime ? parse(newSubject.endTime, 'HH:mm', new Date()) : undefined}
                                    onChange={(e) => e.value && setNewSubject({ ...newSubject, endTime: format(e.value, 'HH:mm') })}
                                    timeOnly
                                    hourFormat="24"
                                    required
                                />
                            </div>


                        </div>
                        <div>
                            {timeValidationMessage && (
                                <small style={{ color: 'red' }}>{timeValidationMessage}</small>
                            )}
                        </div>
                        <div className="p-field">
                            <label className="font-semibold mb-1 block">Chủ đề</label>
                            <InputText
                                value={newSubject.topic}
                                onChange={(e) => setNewSubject({ ...newSubject, topic: e.target.value })}
                                placeholder="Nhập chủ đề"
                            />
                        </div>

                        <div className="p-field">
                            <label className="font-semibold mb-1 block">Mô tả</label>
                            <InputText
                                value={newSubject.description}
                                onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                                placeholder="Nhập mô tả nội dung"
                            />
                        </div>
                    </div>
                </Dialog>




            </div>
        </div>
    );
};

export default WeeklyScheduler;
