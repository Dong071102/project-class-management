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
import { FaExclamationTriangle } from "react-icons/fa";
import { InputTextarea } from "primereact/inputtextarea";
import { format } from "date-fns";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
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
    // schedule_id: string;
    course_id: string;
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
    course_id: ''

    // Các cột động: key là ngày, giá trị có thể là đối tượng LateInfo hoặc đơn giản là một string (nếu status khác "late")
}

interface statusOption {
    status: string;
    label: string;
}
interface percentption {
    percent: string;
    label: string;
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
                course_id: item.course_id,     // nếu cần dùng
                start_time: item.start_time    // nếu cần gửi hoặc hiển thị
            });
        }
        const pivotStudent = studentMap.get(item.student_id);
        // console.log('pivotStudent,', pivotStudent)câp
        if (pivotStudent) {
            pivotStudent
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
            } else {
                pivotStudent[dateKey] = {
                    status: item.status,
                    schedule_id: item.schedule_id,
                    attendance_id: item.attendance_id,
                    evidence_image_url: item.evidence_image_url

                };
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

const AttendancePivotDataTable: React.FC = () => {
    const [dates, setDates] = useState<string[]>([]);
    const [pivotData, setPivotData] = useState<PivotedStudent[]>([]);
    const [product, setProduct] = useState<PivotedStudent>(emtyStudent);
    const [deleteProductDialog, setDeleteProductDialog] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const dt = useRef<any>(null);
    const { selectedClass, selectedSemester } = useClassContext();
    const { currentUser } = useContext(AuthContext);
    const toast = useRef<Toast>(null);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [productDialog, setProductDialog] = useState<boolean>(false);
    const [importExportDialog, setImportExportDialog] = useState(false);
    const [status, setStatus] = useState<statusOption>();
    const [percent, setPercent] = useState<percentption>();

    useEffect(() => {
        const fetchAttendanceDetails = async () => {
            try {
                let url = `${import.meta.env.VITE_API_BASE_URL}/attendance-detail?lecturer_id=${currentUser?.userId}`;
                if (selectedClass?.class_id !== "0") {
                    url += `&class_id=${selectedClass?.class_id}`;
                }
                if (selectedSemester?.semester_id !== "0") {
                    url += `&semester_id=${selectedSemester?.semester_id}`;
                }
                const response = await fetch(url);
                const data: AttendanceItem[] | null = await response.json();
                const validData = data || [];
                const result: PivotResult = transformAttendanceToPivot(validData);
                setDates(result.dates);
                setPivotData(result.pivotData);
            } catch (error) {
                console.error("Error fetching attendance details:", error);
            }
        };

        fetchAttendanceDetails();
    }, [selectedClass, currentUser, selectedSemester]);

    return (
        <div>
            <Toast ref={toast} />
            <DataTable
                emptyMessage="Chưa có phiên điểm danh nào cho môn học này"
                className="p-2 bg-[#F3F7F5] rounded-[20px]"
                ref={dt}
                value={pivotData} // Dữ liệu đã được xử lý và pivoted
                selection={selectedProducts}
                onSelectionChange={(e) => {
                    if (Array.isArray(e.value)) {
                        setSelectedProducts(e.value);
                    }
                }}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                paginatorTemplate=" PrevPageLink PageLinks NextPageLink  RowsPerPageDropdown"
                globalFilter={globalFilter}
                selectionMode="multiple"
                scrollable
                scrollHeight="100vh"
                virtualScrollerOptions={{ itemSize: 46 }}
                tableStyle={{ minWidth: "50rem" }}
            >
                {/* Cột lựa chọn */}
                <Column selectionMode="multiple" exportable={false}></Column>

                {/* Các cột cố định */}
                <Column field="studentId" header="MSSV" sortable style={{ minWidth: "1rem" }}></Column>
                <Column field="fullName" header="Họ tên" sortable style={{ minWidth: "10rem" }}></Column>
                <Column field="className" header="Lớp học" sortable style={{ minWidth: "7rem" }}></Column>
                <Column field="courseName" header="Môn học" sortable style={{ minWidth: "12rem" }}></Column>

                {/* Cột Số Lượng Điểm Danh */}
                <Column field="presentCount" header="Số lần có mặt" sortable style={{ minWidth: "10rem" }}></Column>
                <Column field="lateCount" header="Số lần đi trễ" sortable style={{ minWidth: "10rem" }}></Column>
                <Column field="absentCount" header="Số lần vắng" sortable style={{ minWidth: "10rem" }}></Column>

                {/* Cột các ngày */}
                {dates.map((date) => (
                    <Column
                        key={date}
                        field={`${date}_sort`}
                        header={date}
                        sortable
                        style={{ minWidth: "4rem" }}
                        body={(rowData) => {
                            const cellData = rowData[date];
                            if (cellData && typeof cellData === "object") {
                                if (cellData.status === "late") {
                                    return (
                                        <span className="text-[#fcbd2d]">
                                            {mapStatus(cellData.status)} ({cellData.lateHours?.toFixed()} phút)
                                        </span>
                                    );
                                } else if (cellData.status === "absent") {
                                    return <span className="text-[#f14871]">{mapStatus(cellData.status)}</span>;
                                } else {
                                    return <span>{mapStatus(cellData.status)}</span>;
                                }
                            } else {
                                return <span>{cellData}</span>;
                            }
                        }}
                    />
                ))}
            </DataTable>
        </div>
    );
};

export default AttendancePivotDataTable;