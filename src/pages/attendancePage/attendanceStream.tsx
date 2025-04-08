import { useContext, useEffect, useState } from "react";
import AbnormalDetectionCard, { AttendanceCard } from "../../components/card/AttendanceCard";
import fallbackImage from "../../assets/no-attendance-image.png";
import noCameraImage from "../../assets/nocamera.svg";
import { Dropdown } from "primereact/dropdown";
import { format, parse, parseISO, subHours } from "date-fns";
import AttendanceTable from "../../components/attendanceTable/AttendanceTable";
import { useClassContext } from "../../contexts/classContext";
import { AuthContext } from "../../hooks/user";
// Định nghĩa interface cho dữ liệu trả về từ API
export interface ScheduleData {
    value: string; // schedule_id (giá trị của Dropdown)
    label: string; // start_time dưới dạng "HH:mm - dd/MM/yyyy" (label hiển thị)
    schedule_id: string; // schedule_id (lưu lại giá trị)
}

// Định nghĩa interface cho selectedDate để lưu cả `start_time` và `schedule_id`
export interface SelectedDate {
    value: string; // schedule_id của lịch học
    schedule_id: string; // schedule_id của lịch học
}

const AttendancePanel = () => {
    const [selectedDate, setSelectedDate] = useState<SelectedDate | null>(null); // selectedDate sử dụng interface SelectedDate
    const [availableDates, setAvailableDates] = useState<ScheduleData[]>([]); // availableDates sử dụng interface ScheduleData

    const [selectedImage, setSelectedImage] = useState<{ src: string; caption: string } | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [attendanceDetails, setAttendanceDetails] = useState<AttendanceCard[]>([]);

    const { currentUser } = useContext(AuthContext);
    const { selectedClass } = useClassContext();
    let timeout: ReturnType<typeof setTimeout>;  // Khai báo timeout ở đây để có thể truy cập trong toàn bộ component
    // Fetch các lịch học có thể lựa chọn từ API
    useEffect(() => {
        const fetchAvailableDates = async () => {
            if (!selectedClass || !currentUser) return;

            let url = `${import.meta.env.VITE_API_BASE_URL}/get-schedule-start-times?lecturer_id=${currentUser.userId}`;
            if (selectedClass.class_id !== '0') {
                url += `&class_id=${selectedClass.class_id}`;
            }
            try {
                const res = await fetch(url);
                const data = await res.json();

                if (!Array.isArray(data)) return;
                console.log('schedule', data);


                const formatted: ScheduleData[] = data.map(item => {
                    const utcDate = parseISO(item.start_time);
                    const adjustedDate = new Date(utcDate.getTime() - 7 * 60 * 60 * 1000); // trừ 7 giờ
                    const label = format(adjustedDate, "HH:mm - dd/MM/yyyy");

                    return {
                        value: item.schedule_id,
                        label,
                        schedule_id: item.schedule_id
                    };
                });

                const defaultSchedule: ScheduleData = {
                    value: "0",  // Thay thế với schedule_id của lịch mới
                    label: "Toàn bộ thời gian",  // Thay thế với thông tin của lịch mới
                    schedule_id: "0",  // Thay thế với schedule_id của lịch mới
                };

                setAvailableDates([defaultSchedule, ...formatted]); // Sắp xếp theo chiều ngược lại
                console.log('availableDates', availableDates);
                if (formatted.length > 0 || defaultSchedule) {
                    setSelectedDate({ value: defaultSchedule.schedule_id, schedule_id: defaultSchedule.schedule_id }); // Đặt giá trị mặc định cho selectedDate
                }
            } catch (err) {
                console.error("Lỗi khi lấy ngày điểm danh:", err);
            }
        };

        fetchAvailableDates();
    }, [selectedClass, currentUser]);

    // Cập nhật giá trị của selectedDate khi người dùng chọn một ngày điểm danh
    const handleDateChange = (schedule_id: string) => {
        console.log('schedule_id selected ', schedule_id);
        // Tìm kiếm schedule_id trong availableDates để lấy thông tin chi tiết
        const selected = availableDates.find(item => item.schedule_id === schedule_id);
        if (selected) {
            setSelectedDate({ value: selected.value, schedule_id: selected.schedule_id });
        }
    };


    // Fetch chi tiết điểm danh khi selectedDate thay đổi
    useEffect(() => {
        const fetchDetails = async () => {
            if (!selectedClass || !selectedDate || !currentUser) return;
            let url = `${import.meta.env.VITE_API_BASE_URL}/attendance-detail?lecturer_id=${currentUser.userId}`;
            console.log('selectedDate', selectedDate)
            if (selectedClass.class_id !== '0') {
                console.log('selectedClass.class_id', selectedClass.class_id)
                url += `&class_id=${selectedClass.class_id}`;
            }
            if (selectedDate.schedule_id !== '0') {
                console.log('selectedDate.schedule_id', selectedDate.schedule_id)
                url += `&schedule_id=${selectedDate.schedule_id}`;
            }
            console.log('selectedClass', selectedClass)
            console.log('url attendance', url);

            try {
                const res = await fetch(url);
                const data = await res.json();

                console.log('attendanceDetails', data);

                if (!Array.isArray(data) || data === null) {
                    setAttendanceDetails([]);
                    return;
                }

                const mappedData = data.map((item: any) => ({
                    attendanceID: item.attendance_id,
                    scheduleID: item.schedule_id,
                    studentID: item.student_id,
                    studentCode: item.student_code,
                    studentName: `${item.first_name} ${item.first_name}`,
                    attendanceTime:
                        item.attendance_time === '0001-01-01T00:00:00Z' || item.attendance_time === null
                            ? `Ngày vắng: ${format(subHours(parseISO(item.start_time), 7), "HH:mm - dd/MM/yyyy")}`
                            : `Điển danh lúc: ${format(parseISO(item.attendance_time), "HH:mm - dd/MM/yyyy")}`,
                    attendanceStatus: item.status,
                    note: item.note,
                    imageURL:
                        item.evidence_image_url && item.evidence_image_url !== ''
                            ? `${import.meta.env.VITE_API_BASE_URL}/facial_recognition/${item.evidence_image_url}`
                            : '',
                }));

                setAttendanceDetails(mappedData);
            } catch (err) {
                console.error("Lỗi khi lấy dữ liệu điểm danh:", err);
                setAttendanceDetails([]); // fallback nếu fetch lỗi
            }

        };

        fetchDetails();
    }, [selectedClass, selectedDate, currentUser]);

    // Hàm kiểm tra URL ảnh hợp lệ
    const getValidImage = (url: string) => (url && url.trim() !== "" ? url : fallbackImage);
    // WebSocket reconnect function
    const handleReconnect = () => {
        console.log("Reconnecting...");
        setIsStreaming(false);  // Đặt lại trạng thái streaming
        connectWebSocket(selectedDate?.schedule_id || '');  // Gọi lại hàm để kết nối WebSocket
    };
    const connectWebSocket = async (scheduleID: string) => {
        const canvas = document.getElementById("video-canvas") as HTMLCanvasElement | null;
        const fallbackImg = document.getElementById("fallback-image") as HTMLImageElement | null;

        if (!canvas || !fallbackImg) {
            console.warn("Canvas hoặc fallbackImg chưa được render.");
            return;
        }

        const ctx = canvas.getContext("2d");

        // Fetch thời gian lịch học
        if (scheduleID !== '0') {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get-schedule-times?schedule_id=${scheduleID}`);
                const data = await res.json();

                const startTime = new Date(data.start_time);
                const endTime = new Date(data.end_time);
                const now = new Date();
                const startMinus2Hours = new Date(startTime.getTime() - 2 * 60 * 60 * 1000);

                const isInRange = now > startMinus2Hours && now < endTime;

                if (!isInRange) {
                    canvas.style.display = "none";
                    fallbackImg.style.display = "block";
                    setIsStreaming(false);
                    return;
                }
            } catch (error) {
                return;
            }
        }
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get-attendance-socket-path?schedule_id=${scheduleID}`);
        const data = await res.json();
        console.log("WebSocket URL:", data.socket_path);
        if (!data.socket_path) {
            canvas.style.display = "none";
            fallbackImg.style.display = "block";
            setIsStreaming(false);
            return;
        }

        // Nếu hợp lệ mới tiếp tục kết nối WebSocket
        const ws = new WebSocket(`ws://localhost:8000/ws/${data.socket_path}`);
        console.log(`ws://localhost:8000/ws/${data.socket_path}`);
        const showFallback = () => {
            canvas.style.display = "none";
            fallbackImg.style.display = "block";
            setIsStreaming(false);
        };

        const showCanvas = () => {
            canvas.style.display = "block";
            fallbackImg.style.display = "none";
            setIsStreaming(true);
        };

        const resetTimeout = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                showFallback();
            }, 5000);
        };

        ws.onopen = () => {
            resetTimeout();
        };

        ws.onmessage = (event) => {
            resetTimeout();
            showCanvas();
            const img = new Image();
            img.onload = () => ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            img.src = `data:image/jpeg;base64,${event.data}`;
        };

        ws.onerror = () => {
            console.error("WebSocket lỗi");
            showFallback();
        };

        ws.onclose = () => {
            console.warn("WebSocket đóng");
            showFallback();
        };
    };

    // Gọi hàm connectWebSocket trong useEffect để kết nối WebSocket khi lần đầu tiên render
    useEffect(() => {
        connectWebSocket(selectedDate?.schedule_id || '');  // Gọi hàm để kết nối WebSocket
        return () => {
            clearTimeout(timeout);
        };
    }, [currentUser, selectedClass, selectedDate]);


    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#F3F7F5] rounded-[20px] p-5">
                <div className="md:col-span-2">
                    <div className="flex justify-between items-center w-full mb-2">
                        <span className="text-black text-lg font-semibold">Hình ảnh điểm danh</span>
                    </div>

                    <div className="flex flex-row gap-4 max-h-[500px] overflow-y-auto pr-2">
                        <div className="w-[375px] h-[500px] relative bg-white rounded-md overflow-hidden shadow">
                            {/* Canvas */}
                            <canvas
                                id="video-canvas"
                                width={375}
                                height={500}
                                className="absolute top-0 left-0 w-full h-full object-contain"
                            />
                            <img
                                id="fallback-image"
                                src={noCameraImage}
                                alt="No camera"
                                className="absolute top-0 left-0 w-full h-full object-contain z-10"
                                style={{ display: "none" }}
                            />


                            {/* Góc dưới bên trái */}
                            <p className="absolute bottom-2 left-2 bg-gray-400 text-white text-sm px-2 py-1 rounded-md shadow z-10">
                                {isStreaming ? "Streaming điểm danh" : "Không có kết nối"}
                            </p>

                            {/* Góc dưới bên phải */}
                            <button
                                onClick={handleReconnect}
                                className="absolute bottom-2 right-2 bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded-md shadow z-10"
                            >
                                Kết nối lại
                            </button>
                        </div>
                        <div className="w-1/2">
                            {selectedImage ? (
                                <div className="relative w-full h-[500px] flex justify-center items-center bg-white rounded-md overflow-hidden shadow">
                                    <img src={getValidImage(selectedImage.src)} alt="Selected" className="w-full h-full object-contain" />
                                    <p className="absolute bottom-2 left-2 bg-gray-400 text-white text-sm px-2 py-1 rounded-md">
                                        {selectedImage.caption}
                                    </p>
                                </div>
                            ) : (
                                <div className="relative w-full h-[500px] flex justify-center items-center bg-white rounded-md overflow-hidden shadow">
                                    <img src={fallbackImage} alt="Fallback" className="w-full h-full object-contain" />
                                    <p className="absolute bottom-2 left-2 bg-gray-400 text-white text-sm px-2 py-1 rounded-md">
                                        Chọn hình ảnh để hiển thị thông tin chi tiết
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="inline-flex flex-col gap-2 bg-white p-3 rounded-[8px] max-h-[540px] overflow-y-auto">
                    <div className="flex flex-row flex-wrap items-center justify-between gap-4 mb-2">
                        <div className="inline-flex flex-col">
                            <span className="text-left text-black font-semibold">
                                Số lượng: {attendanceDetails.length}
                            </span>
                            <span className="text-left text-black font-semibold">Lịch sử hoạt động</span>
                        </div>

                        <div className="min-w-[180px]">
                            <Dropdown
                                value={selectedDate?.schedule_id || ''}  // Sử dụng schedule_id làm giá trị cho Dropdown
                                onChange={(e) => handleDateChange(e.value)}  // Truyền e.value (schedule_id) vào handleDateChange
                                options={availableDates}
                                optionLabel="label"  // Dùng `label` là start_time đã format
                                optionValue="schedule_id"  // Dùng `schedule_id` làm giá trị thực
                                placeholder="Chọn thời gian điểm danh"
                                className="w-full text-sm border border-gray-300 rounded-md shadow-sm"
                                panelClassName="z-[999]"
                            />

                        </div>
                    </div>

                    {attendanceDetails.length === 0 ? (
                        <p className="text-gray-500 italic">Không có phiên điểm danh nào</p>
                    ) : (
                        attendanceDetails.map((alert, index) => (
                            <div
                                key={index}
                                className="cursor-pointer"
                                onClick={() =>
                                    setSelectedImage({
                                        src: alert.imageURL,
                                        caption: `${alert.studentName} - ${alert.studentCode} - ${alert.attendanceStatus}`,
                                    })
                                }
                            >
                                <AbnormalDetectionCard {...alert} />
                            </div>
                        ))
                    )}

                </div>
            </div>

            <div className="my-5">
                <AttendanceTable />
            </div>
        </div >
    );
};

export default AttendancePanel;
