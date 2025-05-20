import React, { useEffect, useState, useContext, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FiChevronUp, FiChevronDown, FiSearch, FiPlus, FiTrash2, FiEdit } from "react-icons/fi";
import { useClassContext } from "../../contexts/classContext";
import { AuthContext } from "../../hooks/user";
import { Toast } from "primereact/toast";
import { InputNumberValueChangeEvent } from "primereact/inputnumber";
import { RadioButton } from "primereact/radiobutton";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { classNames } from "primereact/utils";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { FaExclamationTriangle, FaFileExport } from "react-icons/fa";
import { InputTextarea } from "primereact/inputtextarea";
import { format } from "date-fns";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MdFilterAltOff } from "react-icons/md";
import { Dropdown } from "primereact/dropdown";

// Định nghĩa kiểu AttendanceItem ban đầu
export interface AttendanceItem {
    attendance_id: string,
    student_id: string;
    student_code: string;
    first_name: string;
    last_name: string;
    class_id: string;
    schedule_id: string;
    class_name: string;
    course_id: string;
    course_name: string;
    status: string;          // "absent" | "present" | "late" | ...
    attendance_time: string; // "0001-01-01T00:00:00Z", ...
    start_time: string;      // "2025-03-28T20:00:00Z", ...
    note: string;
    evidence_image_url: string | null;
}

export interface LateInfo {
    status: string;
    lateHours?: number;
}

export interface PivotedStudent {
    id: string;
    studentId: string;
    fullName: string;
    className: string;
    courseName: string;
    course_id: string;
    onTimeCount: number; // Số lần đúng giờ
    lateCount: number; // Số lần trễ
    absentCount: number; // Số lần vắng mặt
    [key: string]: any;
}

const emtyStudent: PivotedStudent = {
    attendance_id: '0',
    id: '',
    studentId: '',
    fullName: '',
    className: '',
    courseName: '',
    schedule_id: '',
    course_id: '',
    onTimeCount: 0,
    lateCount: 0,
    absentCount: 0

    // Các cột động: key là ngày, giá trị có thể là đối tượng LateInfo hoặc đơn giản là một string (nếu status khác "late")
}

export interface PivotResult {
    dates: string[];
    pivotData: PivotedStudent[];
}

export function transformAttendanceToPivot(attendanceData: AttendanceItem[]): PivotResult {
    const uniqueDates = new Set<string>();
    const studentMap = new Map<string, PivotedStudent>();

    attendanceData.forEach((item) => {
        const startUTC = new Date(item.start_time);
        startUTC.setHours(startUTC.getHours() - 7);  // Trừ 7h để về đúng UTC
        const dateKey = startUTC.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });

        uniqueDates.add(dateKey);

        if (!studentMap.has(item.student_id)) {
            studentMap.set(item.student_id, {

                id: item.student_id,
                // attendance_id: item.attendance_id,
                studentId: item.student_code,
                fullName: `${item.last_name} ${item.first_name}`,
                className: item.class_name,
                courseName: item.course_name,
                // schedule_id: item.schedule_id, // thêm dòng này
                course_id: item.course_id,     // nếu cần dùng
                start_time: item.start_time,   // nếu cần gửi hoặc hiển thị
                onTimeCount: 0,
                lateCount: 0,
                absentCount: 0
            });
        }
        const pivotStudent = studentMap.get(item.student_id);
        // console.log('pivotStudent,', pivotStudent)câp
        if (pivotStudent) {

            if (item.status === "late") {
                const attendanceTimeUTC = new Date(item.attendance_time);
                attendanceTimeUTC.setHours(attendanceTimeUTC.getHours() - 7);

                const startTimeUTC = new Date(item.start_time);
                startTimeUTC.setHours(startTimeUTC.getHours() - 7);

                const diffMs = attendanceTimeUTC.getTime() - startTimeUTC.getTime();

                const diffHours = diffMs / (1000 * 60);
                pivotStudent[dateKey] = {
                    status: item.status, lateHours: diffHours,
                    schedule_id: item.schedule_id,
                    attendance_id: item.attendance_id,
                    evidence_image_url: item.evidence_image_url
                };
                pivotStudent.lateCount++;
                console.log('pivotStudent.lateCount', pivotStudent.lateCount)
            }
            else if (item.status === "absent") {
                pivotStudent[dateKey] = {
                    status: item.status,
                    schedule_id: item.schedule_id,
                    attendance_id: item.attendance_id,
                    evidence_image_url: item.evidence_image_url

                };
                pivotStudent.absentCount++;
                console.log('pivotStudent.absentCount', pivotStudent.absentCount)
            }
            else if (item.status === "present") {
                pivotStudent[dateKey] = {
                    status: item.status,
                    schedule_id: item.schedule_id,
                    attendance_id: item.attendance_id,
                    evidence_image_url: item.evidence_image_url

                };
                pivotStudent.onTimeCount++;
                console.log('pivotStudent.onTimeCount', pivotStudent.onTimeCount)
            }
        }
    });

    const datesArray = Array.from(uniqueDates).sort(
        (a, b) => new Date(b.split("/").reverse().join("-")).getTime() - new Date(a.split("/").reverse().join("-")).getTime()
    );


    return {
        dates: datesArray,
        pivotData: Array.from(studentMap.values())
    };

}

// Hàm chuyển đổi status sang tiếng Việt
const mapStatus = (status?: string) => {
    if (!status) return "";
    switch (status) {
        case "absent":
            return "Vắng";
        case "present":
            return "Có mặt";
        case "late":
            return "Đi trễ";
        default:
            return status;
    }
};

const AttendanceReportPivotDataTable: React.FC = () => {
    const [dates, setDates] = useState<string[]>([]);
    const [pivotData, setPivotData] = useState<PivotedStudent[]>([]);
    const [product, setProduct] = useState<PivotedStudent>(emtyStudent);
    const [deleteProductDialog, setDeleteProductDialog] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    // Tự động chọn ngày đầu tiên có dữ liệu của học sinh khi mở Dialog

    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const dt = useRef<any>(null);
    const { selectedClass, selectedSemester } = useClassContext();
    const { currentUser } = useContext(AuthContext);
    const toast = useRef<Toast>(null);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [productDialog, setProductDialog] = useState<boolean>(false);
    const [importExportDialog, setImportExportDialog] = useState(false);

    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
    const [selectedType, setSelectedType] = useState<string>("all");
    const [selectedPercent, setSelectedPercent] = useState<number>(100);
    const [filteredDates, setFilteredDates] = useState<string[]>([]); // Các ngày đã lọc
    const [filteredData, setFilteredData] = useState<PivotedStudent[]>([]); // Dữ liệu đã lọc
    const typesOptions = [
        { label: "Tất cả", value: "all" },
        { label: "Có mặt", value: "present" },
        { label: "Đi trễ", value: "late" },
        { label: "Vắng mặt", value: "absent" },
    ];
    const percentOptions = [
        { label: "100%", value: 100 },
        { label: "70%", value: 70 },
        { label: "50%", value: 50 },
        { label: "30%", value: 30 },
        { label: "0%", value: 0 },
    ];
    const filterData = () => {
        // Bắt đầu từ dữ liệu gốc (pivotData)
        let filtered = [...pivotData];
        let filteredDates = dates;  // Mảng chứa tất cả các ngày

        // Lọc các ngày theo ngày bắt đầu và kết thúc
        if (selectedStartDate) {
            filteredDates = filteredDates.filter(date => {
                const [day, month, year] = date.split("/").map(Number);
                const currentDate = new Date(year, month - 1, day); // Chuyển ngày thành kiểu Date
                return currentDate >= selectedStartDate; // Kiểm tra xem ngày có trong phạm vi bắt đầu không
            });
        }

        if (selectedEndDate) {
            filteredDates = filteredDates.filter(date => {
                const [day, month, year] = date.split("/").map(Number);
                const currentDate = new Date(year, month - 1, day); // Chuyển ngày thành kiểu Date
                return currentDate <= selectedEndDate; // Kiểm tra xem ngày có trong phạm vi kết thúc không
            });
        }

        // Cập nhật lại dữ liệu sau khi lọc ngày tháng
        const updatedData = filtered.map(student => {
            let updatedStudent = { ...student }; // Clone đối tượng học sinh để tránh thay đổi dữ liệu gốc
            let onTimeCount = 0;
            let lateCount = 0;
            let absentCount = 0;

            // Cập nhật lại chỉ số theo ngày lọc
            filteredDates.forEach(date => {
                const statusData = updatedStudent[date];  // Lấy dữ liệu của mỗi ngày
                if (statusData) {
                    const status = statusData.status;
                    if (status === "present") {
                        onTimeCount++; // Tính số lần có mặt
                    } else if (status === "late") {
                        lateCount++; // Tính số lần đi trễ
                    } else if (status === "absent") {
                        absentCount++; // Tính số lần vắng mặt
                    }
                }
            });

            // Sau khi tính toán lại, cập nhật các chỉ số cho học sinh
            updatedStudent.onTimeCount = onTimeCount;
            updatedStudent.lateCount = lateCount;
            updatedStudent.absentCount = absentCount;

            return updatedStudent;
        });

        // Cập nhật filteredData với dữ liệu đã được lọc theo ngày
        setFilteredDates(filteredDates);  // Cập nhật filteredDates để chỉ hiển thị các cột ngày đã lọc
        setFilteredData(updatedData);  // Cập nhật filteredData để sử dụng dữ liệu đã lọc theo ngày tháng

        // Tiếp tục lọc theo trạng thái và phần trăm
        if (selectedType && selectedType !== "all") {
            filtered = updatedData.filter(item => {
                const total = item.onTimeCount + item.lateCount + item.absentCount;
                if (total === 0) return false; // Tránh chia cho 0 nếu không có dữ liệu điểm danh

                // Tính phần trăm theo trạng thái selectedType
                let percent = 0;
                if (selectedType === "present") {
                    percent = (item.onTimeCount / total) * 100;  // Tính phần trăm "Có mặt"
                } else if (selectedType === "late") {
                    percent = (item.lateCount / total) * 100;  // Tính phần trăm "Đi trễ"
                } else if (selectedType === "absent") {
                    percent = (item.absentCount / total) * 100;  // Tính phần trăm "Vắng"
                }

                console.log(`Item: ${item.studentId}, Type: ${selectedType}, Percent: ${percent}`);

                // So sánh phần trăm tính được với selectedPercent
                return percent >= selectedPercent;
            });
        }

        // Log dữ liệu đã lọc theo ngày và theo trạng thái
        console.log("Filtered Data after applying selected dates and selectedType:");
        filtered.forEach(student => {
            console.log(`Student ID: ${student.studentId}, Name: ${student.fullName}`);
            filteredDates.forEach(date => {
                const statusData = student[date];
                if (statusData) {
                    console.log(`Date: ${date}, Status: ${statusData.status}, Late Hours: ${statusData.lateHours || 'N/A'}`);
                }
            });
        });

        // Cập nhật dữ liệu sau khi lọc hoàn chỉnh (cả ngày tháng và trạng thái)
        setFilteredData(filtered);
    };

    // Cập nhật useEffect để khi thay đổi ngày lọc thì gọi filterData
    useEffect(() => {
        filterData();
    }, [selectedStartDate, selectedEndDate, selectedType, selectedPercent, pivotData, dates]);

    // Cập nhật useEffect để khi thay đổi ngày lọc thì gọi filterData
    useEffect(() => {
        filterData();
    }, [selectedStartDate, selectedEndDate, selectedType, selectedPercent, pivotData, dates]);

    useEffect(() => {
        const fetchAttendanceDetails = async () => {
            try {
                let url = `${import.meta.env.VITE_API_BASE_URL}/attendance-detail?lecturer_id=${currentUser?.userId}`;
                if (selectedClass?.class_id !== "0") {
                    url += `&class_id=${selectedClass?.class_id}`;
                }
                if (selectedSemester?.semester_id !== "0") {
                    console.log('selectedSemester?.semester_id', selectedSemester?.semester_id)
                    url += `&semester_id=${selectedSemester?.semester_id}`;
                }
                console.log('url,url', url)
                const response = await fetch(url);
                const data: AttendanceItem[] | null = await response.json();
                const validData = data || [];
                console.log("Attendance data", data);
                const result: PivotResult = transformAttendanceToPivot(validData);
                setDates(result.dates);
                setPivotData(result.pivotData);

            } catch (error) {
                console.error("Error fetching attendance details:", error);
                const onStatusChange = (status: string) => {
                    setProduct({ ...product, attendanceStatus: status });
                };
            }
        };

        fetchAttendanceDetails();
    }, [selectedClass, currentUser, selectedSemester]);
    useEffect(() => {
        if (productDialog && product.id && pivotData.length > 0 && dates.length > 0) {
            const student = pivotData.find(p => p.id === product.id);
            if (student) {
                for (const rawDate of dates) {
                    const formattedKey = rawDate; // Vì dateKey trong pivotData đang là dạng dd/MM/yyyy
                    if (student[formattedKey]) {
                        const [day, month, year] = formattedKey.split("/");
                        const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
                        if (!isNaN(parsedDate.getTime())) {
                            console.log("✅ Set selectedDate to:", parsedDate);
                            setSelectedDate(parsedDate);
                            break;
                        } else {
                            console.warn("❌ Invalid parsed date:", formattedKey);
                        }
                    }
                }
            }
        }
    }, [productDialog, product.id, pivotData, dates]);

    useEffect(() => {
        if (selectedDate && product.id) {
            const dateKey = format(selectedDate, "dd/MM/yyyy");
            const studentData = pivotData.find(p => p.id === product.id);
            if (studentData && studentData[dateKey]) {
                setProduct(prev => ({
                    ...prev,
                    attendanceStatus: studentData[dateKey].status,
                    note: studentData[dateKey].note || ''

                }));
            } else {
                setProduct(prev => ({
                    ...prev,
                    attendanceStatus: '',
                    note: ''
                }));
            }
        }
    }, [selectedDate, product.id, pivotData]);




    const openNew = () => {
        setProduct(emtyStudent);
        setSubmitted(false);
        setProductDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setProductDialog(false);
    };

    const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false);
    };
    const openImportExportDialog = () => {
        setImportExportDialog(true);
    };

    // Hàm đóng Dialog
    const hideImportExportDialog = () => {
        setImportExportDialog(false);
    };


    const saveProduct = () => {
        setSubmitted(true);

        if (!product.studentId || !product.fullName || !product.className || !product.courseName || !selectedDate) {
            toast.current?.show({ severity: "error", summary: "Lỗi", detail: "Vui lòng điền đầy đủ thông tin", life: 3000 });
            return;
        }

        const _products = [...pivotData];
        const _product = { ...product };
        console.log('default_product', _product)
        // const dateKey = selectedDate.toISOString().split("T")[0];
        const dateKey = new Date(selectedDate).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
        console.log('datekey', dateKey)
        console.log('_product[dateKey] status')
        _product[dateKey] = {
            status: _product.attendanceStatus,
            note: _product.note,
            attendance_id: _product[dateKey].attendance_id, // thêm attendance_id cũ
            schedule_id: _product[dateKey].schedule_id      // thêm schedule_id cũ
        };
        console.log(' _product[dateKey]', _product[dateKey])
        if (!dates.includes(dateKey)) {
            setDates((prev) => [...prev, dateKey].sort((a, b) => new Date(a).getTime() - new Date(b).getTime()));
        }

        if (product.id) {
            const index = _products.findIndex(p => p.id === product.id);
            _products[index] = {
                ..._products[index],
                [dateKey]: {
                    status: _product.attendanceStatus,
                    note: _product.note,
                    attendance_id: _product.attendance_id, // thêm attendance_id cũ
                    schedule_id: _product.schedule_id,      // thêm schedule_id cũ
                    evidence_image_url: _product.evidence_image_url

                }
            };

            console.log('_products[index]', _products[index])
            toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Chỉnh sửa thành công', life: 3000 });
        } else {
            _product.id = Math.random().toString().slice(2, 9);
            _products.push(_product);
            toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Tạo thành công', life: 3000 });
        }
        console.log('_products', _products)
        setPivotData(_products);
        setProductDialog(false);
        setProduct(emtyStudent);
        setSelectedDate(null);
        const apiPayload = {
            schedule_id: _product[dateKey].schedule_id,
            student_id: _product.id,
            attendance_id: _product[dateKey].attendance_id,
            status: _product[dateKey].status,
            attendance_time: new Date().toISOString(),
            note: _product[dateKey].note || '',
            evidence_image_url: _product.evidence_image_url
        };
        console.log('apiPayload', apiPayload)
        // console.log("product item", _products[apiPayload])
        fetch(`${import.meta.env.VITE_API_BASE_URL}/update-attendance`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(apiPayload)
        })
            .then(response => response.json())
            .then(data => {
                console.log("Attendance updated:", data);
            })
            .catch(error => {
                console.error("Error updating attendance:", error);
            });
    };


    const editProduct = (product: PivotedStudent) => {
        setProduct({ ...product });
        setProductDialog(true);
    };

    const confirmDeleteProduct = (product: PivotedStudent) => {
        setProduct(product);
        setDeleteProductDialog(true);
    };

    const deleteProduct = () => {
        const _products = pivotData.filter((val) => val.id !== product.id);

        setPivotData(_products);
        setDeleteProductDialog(false);
        setProduct(emtyStudent);
        toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Xóa thành công', life: 3000 });
    };



    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, herd: string) => {
        const val = (e.target && e.target.value) || '';
        const _product = { ...product };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        _product[herd] = val;
        setProduct(_product);
    };

    const onInputTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>, herd: string) => {
        const val = (e.target && e.target.value) || '';
        const _product = { ...product };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        _product[herd] = val;
        setProduct(_product);
    };


    const actionBodyTemplate = (rowData: PivotedStudent) => {
        return (
            <React.Fragment>
                <div className="flex flex-wrap gap-2">
                    <FiEdit className="text-[#FCBD2D] cursor-pointer hover:text-amber-500" size={18} onClick={() => editProduct(rowData)} />
                    <FiTrash2 className="text-[#F14871] cursor-pointer hover:text-red-500" size={18} onClick={() => confirmDeleteProduct(rowData)} />
                </div>
            </React.Fragment>
        );
    };
    // Hàm xử lý xuất Excel
    const exportExcel = () => {
        const headerMapping: Record<string, string> = {
            studentId: "Mã sinh viên",
            fullName: "Họ tên",
            className: "Lớp",
            courseName: "Môn học",
            // start_time: "Thời gian bắt đầu",
        };
        // Tạo mảng exportData với cấu trúc cố định và điền giá trị cho các cột ngày
        const exportData = filteredData.map((row, index) => {

            const exportRow: any = {};
            exportRow["STT"] = index + 1;
            // Lặp qua các cột cố định theo mapping và gán giá trị tương ứng
            Object.keys(headerMapping).forEach(key => {
                exportRow[headerMapping[key]] = row[key];
            })
            // Giả sử dates là mảng các ngày (ví dụ: ["29/03/2025", "28/03/2025"])
            filteredDates.forEach(date => {
                const cell = row[date];
                // Nếu có dữ liệu, chuyển đổi theo kiểu mong muốn (nếu là object, chuyển thành chuỗi)
                if (cell) {
                    if (typeof cell === 'object') {
                        exportRow[date] =
                            cell.status === 'late'
                                ? `${mapStatus(cell.status)} (${cell.lateHours} phút)`
                                : mapStatus(cell.status);
                    } else {
                        exportRow[date] = cell;
                    }
                } else {
                    // Nếu không có dữ liệu, gán giá trị mặc định
                    exportRow[date] = 'Không có dữ liệu';
                }
            });
            return exportRow;
        });

        // Tạo worksheet và workbook từ exportData
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

        // Ghi file Excel về máy
        const fileName = `${selectedClass?.class_name}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        hideImportExportDialog()
        // Thông báo thành công
        toast.current?.show({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Xuất Excel thành công!',
            life: 3000,
        });
    };

    const importExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedClass || selectedClass.class_id === "0") {
            toast.current?.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Vui lòng chọn lớp trước khi nhập dữ liệu.',
                life: 3000,
            });
            hideImportExportDialog();

            return; // Dừng lại, không cho phép import
        }
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const arrayBuffer = evt?.target?.result;
            if (!arrayBuffer) return;

            try {
                // Đọc file dưới dạng ArrayBuffer
                const data = new Uint8Array(arrayBuffer as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Lấy dữ liệu dưới dạng mảng 2 chiều (header + rows)
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
                // console.log("Dữ liệu đọc được:", jsonData);
                if (jsonData.length < 2) return; // Không có dữ liệu

                const [headerRow, ...rows] = jsonData;

                // Tạo mapping từ header Excel sang các key trong PivotedStudent
                // Giả sử file Excel của bạn có header: STT, Mã sinh viên, Họ tên, Lớp, Môn học, <date1>, <date2>,...
                const headerMapping: Record<string, string> = {
                    "Mã sinh viên": "studentId",
                    "Họ tên": "fullName",
                    "Lớp": "className",
                    "Môn học": "courseName"
                    // Nếu file Excel có thêm các cột cố định khác (ví dụ: attendance_id, start_time) thì thêm ở đây nếu cần
                };
                // Các key cố định (không phải cột ngày) mà bạn muốn map
                const fixedKeys = ["studentId", "fullName", "className", "courseName", "schedule_id", "course_id", "attendance_id", "start_time"];

                // Chuyển rows thành mảng PivotedStudent
                const importedData: PivotedStudent[] = rows.map((row: any[]) => {
                    const obj: any = {};
                    headerRow.forEach((header: string, index: number) => {
                        // Bỏ qua cột STT
                        if (header === "STT") return;
                        // Nếu header có mapping thì dùng key được map, ngược lại giữ nguyên header
                        const mappedKey = headerMapping[header] ? headerMapping[header] : header;
                        obj[mappedKey] = row[index] ?? "";
                    });
                    return obj as PivotedStudent;
                });

                // Xác định các cột ngày: những key không thuộc fixedKeys
                let importedDates = new Set<string>();
                importedData.forEach(item => {
                    Object.keys(item).forEach(key => {
                        if (!fixedKeys.includes(key)) {
                            importedDates.add(key);
                        }
                    });
                });
                // Sắp xếp các cột ngày theo định dạng dd/MM/yyyy (chuyển sang yyyy-MM-dd để so sánh)
                const importedDatesArray = Array.from(importedDates).sort((a, b) => {
                    const dateA = new Date(a.split("/").reverse().join("-")).getTime();
                    const dateB = new Date(b.split("/").reverse().join("-")).getTime();
                    return dateA - dateB;
                });

                // Cập nhật state: pivotData và dates sẽ được sử dụng để hiển thị DataTable
                setPivotData(importedData);
                setDates(importedDatesArray);

                toast.current?.show({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: 'Nhập Excel thành công!',
                    life: 3000,
                });
                // console.log('product', product)

                hideImportExportDialog();
            } catch (error) {
                console.error("Lỗi đọc file:", error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Không thể đọc file Excel',
                    life: 3000,
                });
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const header = (
        <div className="flex flex-wrap lign-items-center justify-between">
            <div className="text-left flex flex-wrap gap-10 align-items-center justify-between">
                {/* <h1 className="m-0 text-2xl">Quản lý điểm danh</h1> */}
                <div className="flex items-center gap-2 text-xs rounded-[6px] bg-white border border-[#E0E2E7] px-2 w-[240px]">
                    <FiSearch className="text-[#278D45] w-5 h-5" />
                    <input
                        type="search"
                        onInput={(e) => {
                            const target = e.target as HTMLInputElement;
                            setGlobalFilter(target.value);
                        }}
                        placeholder="Tìm kiếm..."
                        className=" hidden sm:flex text-[#737791] text-sm font-normal w-[200px] p-2 bg-transparent outline-none"
                    />
                    <FiChevronDown className=" hidden sm:flex text-[#737791] w-5 h-5" />
                </div>
                <div className="field w-[170px]">
                    <Calendar
                        id="startDate"
                        showIcon
                        value={selectedStartDate}
                        onChange={(e) => setSelectedStartDate(e.value as Date)}
                        dateFormat="dd/mm/yy"
                        placeholder="Ngày bắt đầu"
                    />

                </div>
                <div className="field w-[170px]">
                    <Calendar
                        id="endDate"
                        showIcon
                        value={selectedEndDate}
                        onChange={(e) => setSelectedEndDate(e.value as Date)}
                        dateFormat="dd/mm/yy"
                        placeholder="Ngày kết thúc"
                    />

                </div>
                <div className="field w-[120px]">
                    <Dropdown
                        id="type"
                        value={selectedType}
                        options={typesOptions}
                        optionLabel="label"
                        onChange={(e) => setSelectedType(e.value)}
                        // onChange={(e) =>console.log}
                        placeholder="Lọc theo"
                    />
                </div>
                {
                    selectedType && selectedType !== "all" && (
                        <div className="field w-[120px]">
                            <Dropdown
                                id="percent"
                                value={selectedPercent}
                                options={percentOptions}
                                optionLabel="label"
                                onChange={(e) => setSelectedPercent(e.value)}
                                // onChange={(e) =>console.log}
                                placeholder="Lọc theo"
                            />
                        </div>
                    )
                }
                <div className="flex gap-5 ">
                    <div
                        className="flex gap-1 p-2 rounded-[6px] items-center justify-between  bg-[#ffdf20] cursor-pointer hover:bg-[#f0b100]"

                        onClick={() => {
                            setSelectedStartDate(null);
                            setSelectedEndDate(null);
                            setSelectedType("all");
                        }}
                    >
                        <p className="text-base font-normal">Xóa lọc</p>
                        <MdFilterAltOff size={18} />

                    </div>
                </div>
            </div>
            <div className="flex gap-5">
                {/* Nút Import/Export */}
                <div
                    onClick={exportExcel}
                    className="flex gap-1 p-2 rounded-[6px] items-center justify-between text-white bg-[#3D6649] cursor-pointer hover:bg-green-900"
                >
                    <p className="text-base font-normal">Xuất Excel </p>
                    <FaFileExport size={18} />

                </div>


            </div>
        </div>
    );

    const productDialogFooter = (
        <React.Fragment>
            <Button label="Thoát" outlined onClick={hideDialog} rounded />
            <Button label="Lưu Thay Đổi" onClick={saveProduct} rounded />
        </React.Fragment>
    );
    const deleteProductDialogFooter = (
        <React.Fragment>
            <Button label="Không" outlined onClick={hideDeleteProductDialog} rounded />
            <Button label="Có" severity="danger" onClick={deleteProduct} rounded />
        </React.Fragment>
    );
    const statusMap: Record<string, string> = {
        "Có mặt": "present",
        "Vắng": "absent",
        "Đi trễ": "late"
    };

    const onStatusChange = (label: string) => {
        const statusCode = statusMap[label] || "";
        setProduct((prev) => ({ ...prev, attendanceStatus: statusCode }));
    };
    const mappedData = filteredData.map((student) => {
        const clone = { ...student };
        dates.forEach((date) => {
            const value = student[date];
            if (value) {
                const statusPriority: Record<string, number> = { present: 0, late: 1, absent: 2 };
                clone[`${date}_sort`] = statusPriority[value.status] ?? 99;
            }
        });
        return clone;
    });

    return (
        <div>
            <Toast ref={toast} />

            <DataTable
                emptyMessage="Chưa có phiên điểm danh nào cho môn học này"
                className="p-2 bg-[#F3F7F5] rounded-[20px]"
                ref={dt}
                value={mappedData}
                selection={selectedProducts}
                onSelectionChange={(e) => {
                    if (Array.isArray(e.value)) {
                        setSelectedProducts(e.value);
                    }
                }}
                sortIcon={(options) =>
                    options.order === 1 ? <FiChevronUp /> : <FiChevronDown />
                }
                dataKey="id"
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                paginatorTemplate=" PrevPageLink PageLinks NextPageLink  RowsPerPageDropdown"
                globalFilter={globalFilter}
                header={header}
                selectionMode="multiple"
                scrollable
                scrollHeight="100vh"
                virtualScrollerOptions={{ itemSize: 46 }}
                tableStyle={{ minWidth: "50rem" }}
            >
                {/* Cột chọn */}
                <Column className="bg-[#F3F7F5]" selectionMode="multiple" exportable={false}></Column>
                {/* Cột STT */}
                <Column
                    className="bg-[#F3F7F5]"
                    header="STT"
                    body={(rowData, options) => options.rowIndex + 1}
                    style={{ minWidth: "1rem" }}
                ></Column>
                {/* Các cột cố định */}
                <Column
                    className="bg-[#F3F7F5]"
                    field="studentId"
                    header="MSSV"
                    sortable
                    style={{ minWidth: "1rem" }}
                ></Column>
                <Column
                    className="bg-[#F3F7F5]"
                    field="fullName"
                    header="Họ tên"
                    sortable
                    style={{ minWidth: "10rem" }}
                ></Column>
                <Column
                    className="bg-[#F3F7F5]"
                    field="className"
                    header="Lớp học"
                    sortable
                    style={{ minWidth: "7rem" }}
                ></Column>
                <Column
                    className="bg-[#F3F7F5]"
                    field="courseName"
                    header="Môn học"
                    sortable
                    style={{ minWidth: "12rem" }}
                ></Column>
                <Column
                    className="bg-[#F3F7F5]"
                    field="onTimeCount"
                    header="Đúng giờ"
                    sortable
                    style={{ minWidth: "7rem" }}
                ></Column>
                <Column
                    className="bg-[#F3F7F5]"
                    field="lateCount"
                    header="Đi trễ"
                    sortable
                    style={{ minWidth: "6rem" }}
                ></Column>
                <Column
                    className="bg-[#F3F7F5]"
                    field="absentCount"
                    header="Vắng"
                    sortable
                    style={{ minWidth: "5rem" }}
                ></Column>
                {filteredDates.map((date) => (
                    <Column
                        key={date}
                        className="bg-[#F3F7F5]"
                        field={`${date}_sort`} // nếu bạn đang dùng field phụ, hoặc có thể dùng field={date} nếu phù hợp
                        header={date}
                        sortable
                        style={{ minWidth: "4rem" }}
                        body={(rowData) => {
                            const cellData = rowData[date];
                            if (cellData && typeof cellData === "object") {
                                // Nếu là object (được tạo khi có dữ liệu từ API)
                                if (cellData.status === "late") {
                                    return (
                                        <span className='text-[#fcbd2d]'>
                                            {mapStatus(cellData.status)} ({cellData.lateHours?.toFixed()} phút)
                                        </span>
                                    );
                                } else if (cellData.status === "absent") {
                                    return <span className='text-[#f14871]'>{mapStatus(cellData.status)}</span>;
                                } else {
                                    return <span>{mapStatus(cellData.status)}</span>;
                                }
                            } else if (cellData && typeof cellData === "string") {
                                // Nếu là chuỗi (dữ liệu từ Excel)
                                if (cellData.toLowerCase().includes("vắng")) {
                                    return <span className="text-[#F14871]">{cellData}</span>; // Màu đỏ cho "Vắng"
                                } else if (cellData.toLowerCase().includes("có mặt")) {
                                    return <span className="text-[#278D45]">{cellData}</span>; // Màu xanh lá cho "Có mặt"
                                } else if (cellData.toLowerCase().includes("trễ")) {
                                    return <span className="text-[#fcbd2d]">{cellData}</span>; // Màu cam cho "Trễ"
                                }
                                // Trường hợp khác
                                return <span>{cellData}</span>;
                            }

                            return <span></span>;
                        }}
                    />
                ))}


            </DataTable>
            <Dialog visible={productDialog} style={{ width: '45rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Thêm mới/Chỉnh sửa" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
                <p className="mb-4 text-black">Quản lý điểm danh</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    <div className="field">
                        <label htmlFor="studentId" className="font-normal">
                            {/* Thông tin học sinh */}
                        </label>
                        <label htmlFor="fullName" className="font-normal">  MSSV </label>
                        <InputText id="studentId" value={product.studentId} onChange={(e) => onInputChange(e, 'studentId')} required
                            autoFocus className={classNames({ 'p-invalid': submitted && !product.studentId })}
                        />
                        {submitted && !product.studentId && <small className="p-error">studentId is required.</small>}
                    </div>

                    <div className="field ">
                        <label htmlFor="fullName" className="font-normal">  Họ và tên </label>
                        <InputText id="fullName" value={product.fullName} onChange={(e) => onInputChange(e, 'fullName')} required autoFocus className={classNames({ 'p-invalid': submitted && !product.fullName })}
                        />
                        {submitted && !product.fullName && <small className="p-error">fullName is required.</small>}
                    </div>
                    <div className="field ">
                        <label htmlFor="fullName" className="font-normal"> Lớp </label>
                        <InputText id="fullName" value={product.className} onChange={(e) => onInputChange(e, 'className')} required autoFocus className={classNames({ 'p-invalid': submitted && !product.fullName })}
                        />
                        {submitted && !product.fullName && <small className="p-error">fullName is required.</small>}
                    </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    <div className="field ">
                        <label htmlFor="fullName" className="font-normal"> Môn Học </label>
                        <InputText id="fullName" value={product.courseName} onChange={(e) => onInputChange(e, 'courseName')} required autoFocus className={classNames({ 'p-invalid': submitted && !product.fullName })}
                        />
                        {submitted && !product.fullName && <small className="p-error">fullName is required.</small>}
                    </div>
                    <div className="field">
                        <label htmlFor="attendanceDate" className="font-normal">Thời gian điểm danh</label>
                        <Calendar
                            id="attendanceDate"
                            showIcon
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            placeholder="Chọn ngày"
                            required
                        />

                    </div>


                </div>

                <div className="field">
                    <label className="font-normal">Trạng thái</label>
                    <div className="flex gap-3 mt-2">
                        {["present", "late", "absent"].map((value) => {
                            const label = mapStatus(value);
                            return (
                                <div className="flex items-center" key={value}>
                                    <RadioButton
                                        inputId={`status-${value}`}
                                        value={value}
                                        onChange={() => onStatusChange(label)}
                                        checked={product.attendanceStatus === value}
                                    />
                                    <label htmlFor={`status-${value}`} className="ml-2">{label}</label>
                                </div>
                            );
                        })}


                    </div>
                </div>
                <div className="field ">
                    <label htmlFor="attendanceStatus" className="font-normal">
                        Ghi chú
                    </label>
                    <InputTextarea id="attendanceStatus" value={product.note} onChange={(e) => onInputTextAreaChange(e, 'note')} rows={4} />
                </div>
            </Dialog>
            <Dialog
                visible={importExportDialog}
                style={{ width: '500px' }}
                header="Nhập/Xuất Excel"
                modal
                onHide={hideImportExportDialog}
            >



                <div className="flex flex-col gap-4 items-center">
                    <p>Vui lòng chọn tệp Excel để import hoặc xuất dữ liệu hiện tại ra Excel.</p>

                    <div className='justify-center'>
                        {/* Input file (ẩn) */}
                        <input
                            id="importExcel"
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={importExcel}
                            className="hidden"
                        />

                        {/* Nút Import */}
                        <label
                            htmlFor="importExcel"
                            className=" w-250 px-5 py-3 bg-[#278d45] text-white rounded  cursor-pointer hover:bg-green-800 transition-colors"
                        >
                            Nhập file Excel
                        </label>
                        <span className='p-5' />
                        {/* Nút Export */}
                        <button
                            onClick={exportExcel}
                            className=" px-6 py-3 bg-[#fbbd2f] text-white rounded  cursor-pointer hover:bg-[#fd9b04] transition-colors"
                        >
                            Xuất file Excel
                        </button>
                    </div>
                </div>
            </Dialog>
            <Dialog visible={deleteProductDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Thông báo" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                <div className="confirmation-content flex item-center ">
                    <FaExclamationTriangle className="text-[#FF0000] mr-3" style={{ fontSize: '2rem' }} />
                    {product && (
                        <span className="mt-3">
                            Bạn có chắc chắn muốn xóa <b>{product.fullName}</b>?
                        </span>
                    )}
                </div>

            </Dialog>

        </div>
    );
};

export default AttendanceReportPivotDataTable;
