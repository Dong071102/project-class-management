// src/components/WeeklyScheduler.tsx
import React, { useState } from 'react';
import { format, startOfWeek, addDays, parse, getWeek } from 'date-fns';
import { vi } from 'date-fns/locale'; // Import locale tiếng Việt
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';

// --- Interface cho dữ liệu môn học ---
interface Subject {
    id: number;
    day: number; // 0 = Chủ Nhật, 1 = Thứ 2, ..., 6 = Thứ 7 (date-fns default) - Sẽ điều chỉnh để khớp Thứ 2 = 1
    name: string;
    startTime: string; // Format "HH:mm"
    endTime: string; // Format "HH:mm"
    class: string;
    building: string;
    color?: string; // Optional: Tailwind background/border color class
    date: Date; // Thêm thuộc tính date
}

// --- Dữ liệu mẫu (đã chỉnh sửa cho API và môn CNTT) ---
const initialSubjectsData: Subject[] = [
    { id: 1, day: 1, name: "Lập trình Web", startTime: "09:00", endTime: "11:00", class: "CTK45B", building: "A27.5", color: 'bg-blue-100 border-blue-300', date: new Date(2025, 2, 31) }, // Thứ Hai tuần này (31/03/2025)
    { id: 2, day: 2, name: "Cơ sở dữ liệu", startTime: "14:00", endTime: "16:00", class: "CTK45A", building: "A24.1", color: 'bg-green-100 border-green-300', date: new Date(2025, 3, 1) },  // Thứ Ba tuần này (01/04/2025)
    { id: 3, day: 3, name: "Mạng máy tính", startTime: "10:00", endTime: "12:00", class: "CTK45A", building: "A27.5", color: 'bg-yellow-100 border-yellow-300', date: new Date(2025, 3, 2) },  // Thứ Tư tuần này (02/04/2025)
    { id: 4, day: 4, name: "Phân tích thiết kế hệ thống", startTime: "07:30", endTime: "09:30", class: "CTK45A", building: "A24.1", color: 'bg-red-100 border-red-300', date: new Date(2025, 3, 3) },  // Thứ Năm tuần này (03/04/2025)
    { id: 5, day: 5, name: "Hhee", startTime: "16:00", endTime: "17:30", class: "CTK45A", building: "A27.5", color: 'bg-purple-100 border-purple-300', date: new Date(2025, 3, 4) },  // Thứ Sáu tuần này (04/04/2025)
    { id: 6, day: 1, name: "Thiết kế giao diện người dùng", startTime: "13:00", endTime: "15:00", class: "CTK45A", building: "A24.1", color: 'bg-pink-100 border-pink-300', date: new Date(2025, 4, 7) },  // Thứ Hai tuần sau (07/04/2025)
    { id: 7, day: 3, name: "Kiểm thử phần mềm", startTime: "14:30", endTime: "16:30", class: "QA302", building: "A24.1", color: 'bg-indigo-100 border-indigo-300', date: new Date(2025, 4, 9) },  // Thứ Tư tuần sau (09/04/2025)
];

// --- Cấu hình Lịch ---
const START_HOUR = 7; // Lịch bắt đầu từ 7h sáng
const END_HOUR = 19; // Lịch kết thúc lúc 19h tối (hiển thị đến ngay trước 19:00)
const HOUR_HEIGHT_PX = 60; // Chiều cao của 1 giờ trong pixels
const WEEK_STARTS_ON: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1; // 1 = Thứ Hai

const WeeklyScheduler: React.FC = () => {
    const [subjects, setSubjects] = useState<Subject[]>(initialSubjectsData);
    const [currentDate, setCurrentDate] = useState(new Date()); // Để quản lý tuần hiện tại
    const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null); // Index trong mảng days (0-6)
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [newSubject, setNewSubject] = useState<Omit<Subject, 'id' | 'day' | 'date'>>({ name: "", startTime: "", endTime: "", class: "", building: "", color: 'bg-gray-100 border-gray-300' });
    const [selectedDateForNewSubject, setSelectedDateForNewSubject] = useState<Date | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSubjectId, setEditingSubjectId] = useState<number | null>(null); // ID của môn học đang được chỉnh sửa

    const weekStart = startOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

    // --- Hàm tính toán vị trí và chiều cao cho sự kiện ---
    const calculateStyle = (startTime: string, endTime: string): React.CSSProperties => {
        try {
            // Dùng một ngày cố định để parse giờ cho đúng
            const baseDate = new Date(2000, 0, 1);
            const start = parse(startTime, 'HH:mm', baseDate);
            const end = parse(endTime, 'HH:mm', baseDate);

            // Kiểm tra nếu parse không thành công
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                console.error(`Invalid time format: Start=${startTime}, End=${endTime}`);
                return { position: 'absolute', top: '0px', height: '20px', visibility: 'hidden' }; // Ẩn nếu lỗi
            }

            // Kiểm tra end time phải lớn hơn start time
            if (start >= end) {
                console.error(`End time must be after start time: Start=${startTime}, End=${endTime}`);
                 return { position: 'absolute', top: '0px', height: '20px', visibility: 'hidden' }; // Ẩn nếu lỗi
            }


            const startMinutes = start.getHours() * 60 + start.getMinutes();
            const endMinutes = end.getHours() * 60 + end.getMinutes();
            const schedulerStartMinutes = START_HOUR * 60;

            // Tính toán top và height dựa trên pixel
            const top = ((startMinutes - schedulerStartMinutes) / 60) * HOUR_HEIGHT_PX;
            const height = ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT_PX;

            // Đảm bảo giá trị không âm và nằm trong khoảng hiển thị của lịch
             const calculatedTop = Math.max(0, top);
             // Giới hạn height nếu sự kiện vượt quá giờ kết thúc hiển thị
             const schedulerEndMinutes = END_HOUR * 60;
             const maxPossibleMinutes = schedulerEndMinutes - startMinutes;
             const calculatedDurationMinutes = Math.min(endMinutes - startMinutes, maxPossibleMinutes);
             const calculatedHeight = (calculatedDurationMinutes / 60) * HOUR_HEIGHT_PX;


            // Chỉ hiển thị nếu thời gian bắt đầu nằm trong khoảng giờ làm việc
             if(startMinutes < schedulerStartMinutes || startMinutes >= schedulerEndMinutes) {
                 return { position: 'absolute', visibility: 'hidden' }; // Ẩn nếu ngoài giờ
             }


            return {
                top: `${calculatedTop}px`,
                height: `${Math.max(10, calculatedHeight)}px`, // Chiều cao tối thiểu để dễ thấy
                position: 'absolute',
                left: '3px', // Khoảng cách nhỏ từ lề trái cột
                right: '3px', // Khoảng cách nhỏ từ lề phải cột
                zIndex: 10, // Đảm bảo sự kiện nổi lên trên các ô giờ
            };
        } catch (error) {
            console.error("Error calculating style:", error);
            return { position: 'absolute', top: '0px', height: '20px', visibility: 'hidden' }; // Fallback style on error
        }
    };

    // --- Xử lý thêm môn học ---
    const handleAddSubject = () => {
        // --- Validation cơ bản ---
        if (!newSubject.name || !newSubject.startTime || !newSubject.endTime || !selectedDateForNewSubject) {
            alert("Vui lòng nhập đầy đủ thông tin môn học và chọn ngày.");
            return;
        }
        try {
            const baseDate = new Date(2000, 0, 1);
            const start = parse(newSubject.startTime, 'HH:mm', baseDate);
            const end = parse(newSubject.endTime, 'HH:mm', baseDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new Error("Invalid time format");
            if (start >= end) throw new Error("End time must be after start time");

            const actualDayOfWeek = selectedDateForNewSubject.getDay();
            const nextId = subjects.length > 0 ? Math.max(...subjects.map(s => s.id)) + 1 : 1;
            const subjectToAdd: Subject = {
                id: nextId,
                day: actualDayOfWeek === 0 ? 6 : actualDayOfWeek - 1, // Chuyển đổi 0 (CN) thành 6 (date-fns), và 1 (T2) thành 0...
                ...newSubject,
                date: selectedDateForNewSubject,
                // Random màu nếu muốn
                // color: `bg-${['red', 'blue', 'green', 'yellow', 'purple', 'pink'][Math.floor(Math.random() * 6)]}-100 border-${['red', 'blue', 'green', 'yellow', 'purple', 'pink'][Math.floor(Math.random() * 6)]}-300`
            };

            setSubjects([...subjects, subjectToAdd]);
            setIsDialogOpen(false);
            setEditingSubjectId(null);
            // Reset form state
            setSelectedDayIndex(null);
            setSelectedTime(null);
            setSelectedDateForNewSubject(null);
            setNewSubject({ name: "", startTime: "", endTime: "", class: "", building: "", color: 'bg-gray-100 border-gray-300' });

        } catch (error: any) {
            alert(`Lỗi: ${error.message}. Vui lòng kiểm tra lại thời gian nhập (HH:mm).`);
        }
    };

    // --- Xử lý chỉnh sửa môn học ---
    const handleEditSubject = () => {
        if (!editingSubjectId || !newSubject.name || !newSubject.startTime || !newSubject.endTime || !selectedDateForNewSubject) {
            alert("Vui lòng nhập đầy đủ thông tin môn học.");
            return;
        }
        try {
            const baseDate = new Date(2000, 0, 1);
            const start = parse(newSubject.startTime, 'HH:mm', baseDate);
            const end = parse(newSubject.endTime, 'HH:mm', baseDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new Error("Invalid time format");
            if (start >= end) throw new Error("End time must be after start time");

            const updatedSubjects = subjects.map(subject => {
                if (subject.id === editingSubjectId) {
                    const actualDayOfWeek = selectedDateForNewSubject.getDay();
                    return {
                        ...subject,
                        name: newSubject.name,
                        startTime: newSubject.startTime,
                        endTime: newSubject.endTime,
                        class: newSubject.class,
                        building: newSubject.building,
                        date: selectedDateForNewSubject,
                        day: actualDayOfWeek === 0 ? 6 : actualDayOfWeek - 1,
                        color: newSubject.color || 'bg-gray-100 border-gray-300',
                    };
                }
                return subject;
            });
            setSubjects(updatedSubjects);
            setIsDialogOpen(false);
            setEditingSubjectId(null);
            // Reset form state
            setSelectedDayIndex(null);
            setSelectedTime(null);
            setSelectedDateForNewSubject(null);
            setNewSubject({ name: "", startTime: "", endTime: "", class: "", building: "", color: 'bg-gray-100 border-gray-300' });
        } catch (error: any) {
            alert(`Lỗi: ${error.message}. Vui lòng kiểm tra lại thời gian nhập (HH:mm).`);
        }
    };

    // --- Xử lý xóa môn học ---
    const handleDeleteSubject = () => {
        if (editingSubjectId !== null) {
            const updatedSubjects = subjects.filter(subject => subject.id !== editingSubjectId);
            setSubjects(updatedSubjects);
            setIsDialogOpen(false);
            setEditingSubjectId(null);
            // Reset form state
            setSelectedDayIndex(null);
            setSelectedTime(null);
            setSelectedDateForNewSubject(null);
            setNewSubject({ name: "", startTime: "", endTime: "", class: "", building: "", color: 'bg-gray-100 border-gray-300' });
        }
    };

    // --- Xử lý khi click vào ô giờ trống ---
    const handleCellClick = (dayIndex: number, hour: number) => {
        setSelectedDayIndex(dayIndex);
        const clickedDate = days[dayIndex]; // Lấy ngày được click từ mảng days
        setSelectedDateForNewSubject(clickedDate); // Lưu ngày được chọn
        // Định dạng giờ thành HH:00 để gợi ý cho startTime
        const suggestedStartTime = `${hour.toString().padStart(2, '0')}:00`;
        const suggestedEndTime = `${(hour + 1).toString().padStart(2, '0')}:00`; // Gợi ý kết thúc sau 1 tiếng
        setSelectedTime(suggestedStartTime);
        setNewSubject({ ...newSubject, startTime: suggestedStartTime, endTime: suggestedEndTime }); // Đặt giờ bắt đầu/kết thúc gợi ý
        setEditingSubjectId(null); // Đảm bảo không ở chế độ chỉnh sửa
        setIsDialogOpen(true);
    }

    // --- Xử lý khi click vào môn học đã có ---
    const handleSubjectClick = (subject: Subject) => {
        setEditingSubjectId(subject.id);
        setNewSubject({
            name: subject.name,
            startTime: subject.startTime,
            endTime: subject.endTime,
            class: subject.class,
            building: subject.building,
            color: subject.color || 'bg-gray-100 border-gray-300',
        });
        setSelectedDateForNewSubject(subject.date);
        // Find the day index (0-6, Monday is 0)
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
          setNewSubject({ name: "", startTime: "", endTime: "", class: "", building: "", color: 'bg-gray-100 border-gray-300' }); // Reset form
     };

     // --- Dialog Footer ---
    const dialogFooter = () => (
        <div>
            <Button label="Hủy" icon="pi pi-times" onClick={hideDialog} className="p-button-text" />
            {editingSubjectId !== null ? (
                <>
                    <Button label="Xóa" icon="pi pi-trash" onClick={handleDeleteSubject} className="p-button-danger" />
                    <Button label="Lưu Thay Đổi" icon="pi pi-check" onClick={handleEditSubject} autoFocus />
                </>
            ) : (
                <Button label="Lưu" icon="pi pi-check" onClick={handleAddSubject} autoFocus />
            )}
        </div>
    );

     // --- Hàm chuyển tuần ---
     const goToPreviousWeek = () => setCurrentDate(addDays(currentDate, -7));
     const goToNextWeek = () => setCurrentDate(addDays(currentDate, 7));
     const goToCurrentWeek = () => setCurrentDate(new Date());


    return (
        <div className="flex flex-col h-screen p-4 bg-gray-50 text-sm">
            {/* Header: Tuần và Điều hướng */}
            <div className="flex justify-between items-center mb-4 px-2">
                <div className="flex items-center gap-2">
                    <Button icon="pi pi-angle-left" onClick={goToPreviousWeek} className="p-button-sm p-button-rounded p-button-text" />
                    <Button icon="pi pi-angle-right" onClick={goToNextWeek} className="p-button-sm p-button-rounded p-button-text" />
                    <Button label="Hôm nay" onClick={goToCurrentWeek} className="p-button-sm p-button-outlined" />
                    <h2 className="text-xl font-semibold ml-4">
                        Tuần {getWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON, locale: vi })}
                        <span className='text-base font-normal ml-2'>({format(weekStart, 'dd/MM')} - {format(addDays(weekStart, 6), 'dd/MM/yyyy')})</span>
                    </h2>
                </div>
                 {/* Có thể thêm các nút Theo ngày/tháng/năm ở đây */}
                 <div></div>
            </div>

            {/* Container cho Lịch */}
            <div className="flex flex-grow overflow-auto border border-gray-300 rounded shadow">
                {/* Cột hiển thị Giờ */}
                <div className="w-16 text-xs text-right bg-gray-100 border-r border-gray-300 sticky left-0 z-30"> {/* Added sticky and z-index */}
                    {/* Ô trống góc trên bên trái */}
                    <div className="h-10 border-b border-gray-300 sticky top-0 z-50 bg-gray-100">
                    </div>
                    {/* Danh sách giờ */}
                    {hours.map(hour => (
                        <div
                            key={`time-${hour}`}
                            style={{ height: `${HOUR_HEIGHT_PX}px` }}
                            className="flex items-center justify-end pr-2 border-b border-gray-200 "
                            >
                            {`${hour.toString().padStart(2, '0')}:00`}
                        </div>
                    ))}
                </div>

                {/* Lưới chính của Lịch (7 ngày) */}
                <div className="flex-grow grid grid-cols-7">
                    {days.map((day, dayIndex) => (
                        // Cột cho mỗi ngày
                        <div key={day.toISOString()} className="relative border-r border-gray-200 last:border-r-0">
                            {/* Header của ngày (Thứ và Ngày) */}
                            <div className="h-10 text-center border-b border-gray-300 sticky top-0 z-50 bg-white flex flex-col justify-center"> {/* Increased z-index to 50 */}
                                <span className="font-semibold capitalize">{format(day, "eeee", { locale: vi })}</span> {/* Thứ */}
                                <span className="text-xs text-gray-500">{format(day, "dd/MM")}</span> {/* Ngày/Tháng */}
                            </div>

                            {/* Vùng nội dung của ngày (nơi chứa ô giờ và sự kiện) */}
                            <div className="relative bg-white">
                                {/* Vẽ các đường kẻ ngang cho từng giờ và tạo ô để click */}
                                {hours.map(hour => (
                                    <div
                                        key={`${dayIndex}-${hour}`}
                                        style={{ height: `${HOUR_HEIGHT_PX}px` }}
                                        className="border-b border-gray-200 hover:bg-sky-50 cursor-pointer transition-colors duration-150"
                                        onClick={() => handleCellClick(dayIndex, hour)}
                                        title={`Thêm vào ${format(day, "EEEE", { locale: vi })} lúc ${hour}:00`}
                                        ></div>
                                ))}

                                {/* Render các môn học/sự kiện cho ngày này */}
                                {subjects
                                    .filter(subject => {
                                        const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON });
                                        const endOfWeekDate = addDays(startOfWeekDate, 6);
                                        return subject.date >= startOfWeekDate && subject.date <= endOfWeekDate && subject.date.getDay() === day.getDay();
                                    })
                                    .map((subject) => {
                                        const style = calculateStyle(subject.startTime, subject.endTime);
                                        // Chỉ render nếu style hợp lệ (có top, height)
                                        if (!style.top || !style.height || style.visibility === 'hidden') return null;

                                        return (
                                            <div
                                                key={subject.id}
                                                style={style}
                                                className={`rounded border p-1 text-[11px] leading-tight overflow-hidden shadow-sm hover:shadow-md hover:z-20 transition-shadow duration-150 cursor-pointer ${subject.color || 'bg-gray-100 border-gray-300'}`}
                                                title={`${subject.name} (${subject.startTime} - ${subject.endTime})\nLớp: ${subject.class}\nTòa: ${subject.building}`}
                                                onClick={() => handleSubjectClick(subject)}
                                                >
                                                <p className="font-semibold truncate">{subject.name}</p>
                                                <p className="truncate">{subject.class} - {subject.building}</p>
                                                <p className="truncate">{subject.startTime} - {subject.endTime}</p>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dialog Thêm/Chỉnh Sửa Môn Học */}
            <Dialog
                header={editingSubjectId !== null ? "Chỉnh sửa Môn Học" : `Thêm Môn Học: ${selectedDayIndex !== null ? format(days[selectedDayIndex], 'EEEE, dd/MM/yyyy', { locale: vi }) : ''}`}
                visible={isDialogOpen}
                style={{ width: 'min(90vw, 400px)' }} // Responsive width
                modal
                footer={dialogFooter}
                onHide={hideDialog}
                >
                <div className="p-fluid flex flex-col gap-4 mt-4">
                    <div className="p-field">
                        <label htmlFor="subjectName" className="font-semibold mb-1 block">Tên môn học *</label>
                        <InputText id="subjectName" placeholder="Ví dụ: Toán Cao Cấp" value={newSubject.name} onChange={e => setNewSubject({ ...newSubject, name: e.target.value })} required />
                    </div>
                     <div className="flex gap-4">
                         <div className="p-field flex-1">
                             <label htmlFor="startTime" className="font-semibold mb-1 block">Giờ bắt đầu *</label>
                             {/* Sử dụng input type="time" cho trình duyệt hỗ trợ */}
                             <InputText id="startTime" type="time" value={newSubject.startTime} onChange={e => setNewSubject({ ...newSubject, startTime: e.target.value })} required />
                             {/* Hoặc dùng Calendar của PrimeReact:
                             <Calendar id="startTime" value={parse(newSubject.startTime || "00:00", "HH:mm", new Date())} onChange={(e) => setNewSubject({...newSubject, startTime: format(e.value as Date, "HH:mm")})} timeOnly hourFormat="24" />
                             */}
                         </div>
                         <div className="p-field flex-1">
                             <label htmlFor="endTime" className="font-semibold mb-1 block">Giờ kết thúc *</label>
                             <InputText id="endTime" type="time" value={newSubject.endTime} onChange={e => setNewSubject({ ...newSubject, endTime: e.target.value })} required />
                         </div>
                     </div>

                     <div className="p-field">
                         <label htmlFor="className" className="font-semibold mb-1 block">Lớp</label>
                         <InputText id="className" placeholder="Ví dụ: CTK45A" value={newSubject.class} onChange={e => setNewSubject({ ...newSubject, class: e.target.value })} />
                     </div>
                      <div className="p-field">
                         <label htmlFor="buildingName" className="font-semibold mb-1 block">Tòa nhà/Phòng</label>
                         <InputText id="buildingName" placeholder="Ví dụ: A27.5" value={newSubject.building} onChange={e => setNewSubject({ ...newSubject, building: e.target.value })} />
                     </div>
                      <div className="p-field">
                         <label htmlFor="subjectDate" className="font-semibold mb-1 block">Ngày *</label>
                         <input type="date" id="subjectDate" value={selectedDateForNewSubject ? format(selectedDateForNewSubject, 'yyyy-MM-dd') : ''} onChange={e => setSelectedDateForNewSubject(parse(e.target.value, 'yyyy-MM-dd', new Date()))} required />
                     </div>
                      {/* Có thể thêm ô chọn màu ở đây */}
                </div>
            </Dialog>
        </div>
    );
};

export default WeeklyScheduler;