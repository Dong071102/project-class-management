import { useContext, useEffect, useRef, useState } from "react";
import fallbackImage from "../../assets/no-attendance-image.png";
import noCameraImage from "../../assets/nocamera.svg";
import { Dropdown } from "primereact/dropdown";
import { format, parse, parseISO, subHours } from "date-fns";
import AttendanceTable from "../../components/attendanceTable/AttendanceTable";
import { useClassContext } from "../../contexts/classContext";
import { AuthContext } from "../../hooks/user";
import HumanCouterCard, { HumanCouterCardProps } from "../../components/card/HumanCouterCard";
import { Toast } from "primereact/toast";
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

const HumanCouterPanel = () => {
    const [selectedDate, setSelectedDate] = useState<SelectedDate | null>(null); // selectedDate sử dụng interface SelectedDate
    const [availableDates, setAvailableDates] = useState<ScheduleData[]>([]); // availableDates sử dụng interface ScheduleData

    const [selectedImage, setSelectedImage] = useState<{ src: string; caption: string } | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [attendanceDetails, setAttendanceDetails] = useState<HumanCouterCardProps[]>([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [wsInstance, setWsInstance] = useState<WebSocket | null>(null);
    const { currentUser } = useContext(AuthContext);
    const { selectedClass } = useClassContext();
    const [reconnectFlag, setReconnectFlag] = useState(0);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const toast = useRef<Toast>(null);
    const [isFallback, setIsFallback] = useState(false);

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

    const captureScreenshot = () => {
        const canvas = canvasRef.current; if (!canvas) return;

        const dataUrl = canvas.toDataURL("image/png");
        const timestamp = format(new Date(), "HHmmss_ddMMyyyy");
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `snapshot_${timestamp}.png`;
        link.click();
    };

    // Fetch chi tiết điểm danh khi selectedDate thay đổi
    useEffect(() => {
        const fetchDetails = async () => {
            if (!selectedClass || !selectedDate || !currentUser) return;
            let url = `${import.meta.env.VITE_API_BASE_URL}/get-snapshot-details?lecturer_id=${currentUser.userId}`;
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
                    SnapshotID: item.snapshot_id,
                    ScheduleID: item.schedule_id,
                    PeopleCounter: item.people_counter,
                    CapturedAt: `${format(subHours(parseISO(item.captured_at), 7), "HH:mm - dd/MM/yyyy")}`,
                    StartTime: `${format(subHours(parseISO(item.start_time), 7), "HH:mm - dd/MM/yyyy")}`,
                    EndTime: `${format(subHours(parseISO(item.end_time), 7), "HH:mm - dd/MM/yyyy")}`,
                    ClassID: item.class_id,
                    ClassName: item.class_name,
                    CourseID: item.course_id,
                    CourseName: item.course_name,
                    RoomName: item.room_name,
                    ImageSrc: item.image_path && item.image_path !== ''
                        ? `${import.meta.env.VITE_API_BASE_URL}/human_couter/${item.image_path}`
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


    // WebSocket reconnect function
    useEffect(() => {
        const canvas = canvasRef.current;
        const fallbackImg = document.getElementById("fallback-image") as HTMLImageElement | null;
        const ctx = canvas?.getContext("2d");

        if (!canvas || !fallbackImg || !ctx) {
            console.warn("Canvas hoặc fallback chưa render.");
            return;
        }
        if (!selectedDate || !selectedDate.schedule_id || selectedDate.schedule_id === "0") {
            toast.current?.show({
                severity: "warn",
                summary: "Thiếu thông tin",
                detail: "Vui lòng chọn môn học và thời gian điểm danh để xem video.",
                life: 3000,
            });
            setIsFallback(true); // 👈 Cho fallback image hiển thị
            setIsStreaming(false);
            return;
        }




        let ws: WebSocket;
        let timeout: ReturnType<typeof setTimeout>;
        let isInFallback = false;

        const showFallback = () => {
            if (isInFallback) return;
            isInFallback = true;
            canvas.style.display = "none";
            fallbackImg.style.display = "block";
            fallbackImg.src = noCameraImage;
            setIsFallback(true);
            setIsStreaming(false);

        };

        const showCanvas = () => {
            if (!isInFallback) {
                return;
            }
            isInFallback = false;
            canvas.style.display = "block";
            fallbackImg.style.display = "none";
            setIsFallback(false);
            setIsStreaming(true);
        };

        const resetTimeout = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                console.warn("Timeout: không nhận frame → fallback");
                showFallback();
            }, 5000);
        };

        const connect = async () => {
            try {
                // 1. Kiểm tra thời gian học hợp lệ
                const scheduleRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get-schedule-times?schedule_id=${selectedDate.schedule_id}`);
                const scheduleData = await scheduleRes.json();

                const startTime = new Date(scheduleData.start_time);
                const endTime = new Date(scheduleData.end_time);
                const now = new Date();
                const startMinus2Hours = new Date(startTime.getTime() - 2 * 60 * 60 * 1000);

                const isInRange = now > startMinus2Hours && now < endTime;
                if (!isInRange) {
                    showFallback();
                    return;
                }

                // 2. Lấy đường dẫn socket
                const socketRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get-human-couter-socket-path?schedule_id=${selectedDate.schedule_id}`);
                const socketData = await socketRes.json();

                if (!socketData.socket_path) {
                    console.log("❌ Không có socket path");
                    showFallback();
                    return;
                }

                // 3. Kết nối WebSocket
                // ws = new WebSocket(`ws://localhost:8000/human_couter/${socketData.socket_path}`);
                ws = new WebSocket(`ws://localhost:8000/human_couter/${socketData.socket_path}`);
                setWsInstance(ws);

                ws.onopen = () => {
                    console.log("✅ WebSocket đã kết nối");
                    resetTimeout();
                    setIsReconnecting(false); // ✅ kết nối thành công
                };

                ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);

                        if (message.type === "video_frame" && message.frame) {
                            showCanvas();
                            resetTimeout();

                            const img = new Image();
                            img.onload = () => {
                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                            };
                            img.src = `data:image/jpeg;base64,${message.frame}`;
                        }

                        else if (message.type === "snapshot_response") {
                            alert(`📸 Snapshot saved: ${message.filename}\n👤 People: ${message.num_people}`);
                            // (Tùy chọn) xử lý thêm nếu có image_base64
                        }
                    } catch (err) {
                        console.error("❌ Lỗi khi xử lý WebSocket:", err);
                    }
                };

                ws.onerror = () => {
                    console.error("WebSocket lỗi");
                    toast.current?.show({
                        severity: "error",
                        summary: "Lỗi kết nối",
                        detail: "Không thể kết nối đến camera. Vui lòng thử lại sau.",
                        life: 3000,
                    });
                    showFallback();
                    setIsReconnecting(false); // ✅ kết nối thất bại
                };

                ws.onclose = () => {
                    console.warn("WebSocket bị đóng");
                    showFallback();
                };
            } catch (err) {
                console.error("❌ Lỗi khi connect:", err);
                showFallback();
            }
        };

        connect();

        return () => {
            clearTimeout(timeout);
            ws?.close();
        };
    }, [currentUser, selectedClass, selectedDate, reconnectFlag]);

    // Khi người dùng chọn một card ảnh, thay đổi fallback-image hiển thị
    useEffect(() => {
        const canvas = document.getElementById("video-canvas") as HTMLCanvasElement | null;
        const fallbackImg = document.getElementById("fallback-image") as HTMLImageElement | null;

        if (!canvas || !fallbackImg) return;

        if (selectedImage) {
            canvas.style.display = "none";
            fallbackImg.style.display = "block";
            fallbackImg.src = selectedImage.src; // cập nhật ảnh mới
        }
    }, [selectedImage]);

    // Gọi hàm connectWebSocket trong useEffect để kết nối WebSocket khi lần đầu tiên render




    return (
        <div>
            <Toast ref={toast} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#F3F7F5] rounded-[20px] p-5">
                <div className="md:col-span-2">
                    <div className="flex justify-between items-center w-full mb-2">
                        <span className="text-black text-lg font-semibold">Video giám sát</span>
                    </div>

                    <div className="w-full aspect-video relative bg-white rounded-md overflow-hidden shadow">
                        {/* Canvas (streaming) */}
                        <canvas
                            ref={canvasRef}
                            width={960}
                            height={540}
                            style={{ border: "1px solid black", display: "block", marginBottom: "10px" }}
                        />

                        {/* Fallback image (snapshot hoặc default) */}
                        <img
                            id="fallback-image"
                            src={
                                selectedImage
                                    ? selectedImage.src
                                    : isFallback
                                        ? noCameraImage
                                        : fallbackImage
                            }
                            alt="Fallback"
                            className={`absolute top-0 left-0 w-full h-full object-contain z-10 cursor-zoom-in ${selectedImage || isFallback ? "block" : "hidden"
                                }`}
                            onClick={() => setIsFullscreen(true)}
                        />


                        {/* Góc dưới bên trái */}
                        <p className="absolute bottom-2 left-2 bg-gray-400 text-white text-sm px-2 py-1 rounded-md shadow z-10">
                            {isStreaming ? "Streaming điểm danh" : selectedImage ? "Hình ảnh đã chọn" : "Không có kết nối"}
                        </p>

                        {/* Nút bên phải */}
                        <button
                            onClick={() => {
                                if (isStreaming) {
                                    captureScreenshot();
                                } else if (selectedImage) {
                                    setSelectedImage(null);
                                } else {
                                    if (!selectedDate?.schedule_id || selectedDate.schedule_id === "0") {
                                        toast.current?.show({
                                            severity: "error",
                                            summary: "Lỗi kết nối",
                                            detail: "Chưa chọn lớp học hoặc ngày, vui lòng chọn lớp học hoặc ngày điểm danh trước.",
                                            life: 3000,
                                        });
                                        return;
                                    }
                                    console.log("🔁 Reconnecting WebSocket...");
                                    setIsReconnecting(true); // 👉 show loading
                                    setReconnectFlag(prev => prev + 1);
                                }
                            }}
                            disabled={isReconnecting}
                            className={`absolute bottom-2 right-2 text-white text-sm px-3 py-1 rounded-md shadow z-10 ${isStreaming
                                ? "bg-blue-600 hover:bg-blue-700"
                                : selectedImage
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-green-600 hover:bg-green-700"
                                } ${isReconnecting ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {isReconnecting
                                ? "Đang kết nối..."
                                : isStreaming
                                    ? "Chụp ảnh"
                                    : selectedImage
                                        ? "Đóng ảnh"
                                        : "Kết nối lại"}
                        </button>


                    </div>


                </div>

                <div className="inline-flex flex-col gap-2 bg-white p-3 rounded-[8px] max-h-[540px] overflow-y-auto">
                    <div className="flex flex-row flex-wrap items-center justify-between gap-4 mb-2">
                        <div className="inline-flex flex-col">
                            <span className="text-left text-black font-semibold">
                                Số lần chụp: {attendanceDetails.length}
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
                                        src: alert.ImageSrc,
                                        caption: `${alert.ClassName} - ${alert.CourseName} - ${alert.CapturedAt}`,
                                    })
                                }
                            >
                                <HumanCouterCard {...alert} />
                            </div>
                        ))
                    )}

                </div>
            </div>

            <div className="my-5">
                <AttendanceTable />
            </div>
            {selectedImage && isFullscreen && (
                <div
                    className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
                    onClick={() => setIsFullscreen(false)}
                >
                    <img
                        src={selectedImage.src}
                        alt="Phóng to ảnh"
                        className="max-w-[90%] max-h-[90%] object-contain cursor-zoom-out rounded-lg shadow-xl"
                    />
                </div>
            )}

        </div >
    );
};

export default HumanCouterPanel;
