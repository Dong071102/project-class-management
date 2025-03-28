import React, { useEffect, useState, useContext, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FiChevronUp, FiChevronDown, FiSearch, FiPlus } from "react-icons/fi";
import { useClassContext } from "../../contexts/classContext";
import { AuthContext } from "../../hooks/user";

// Định nghĩa kiểu AttendanceItem ban đầu
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
    // Các cột động: key là ngày, giá trị có thể là đối tượng LateInfo hoặc đơn giản là một string (nếu status khác "late")
    [key: string]: any;
}

export interface PivotResult {
    dates: string[];
    pivotData: PivotedStudent[];
}

export function transformAttendanceToPivot(attendanceData: AttendanceItem[]): PivotResult {
    const uniqueDates = new Set<string>();
    const studentMap = new Map<string, PivotedStudent>();

    attendanceData.forEach((item) => {
        const dateKey = new Date(item.start_time).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
        uniqueDates.add(dateKey);

        if (!studentMap.has(item.student_id)) {
            studentMap.set(item.student_id, {
                id: item.student_id,
                studentId: item.student_code,
                fullName: `${item.last_name} ${item.first_name}`,
                className: item.class_name,
                courseName: item.course_name
            });
        }
        const pivotStudent = studentMap.get(item.student_id);
        if (pivotStudent) {
            if (item.status === "late") {
                // Tính số giờ trễ: hiệu số giữa attendance_time và start_time
                const diffMs = new Date(item.attendance_time).getTime() - new Date(item.start_time).getTime();
                const diffHours = diffMs / (1000 * 60);
                pivotStudent[dateKey] = { status: item.status, lateHours: diffHours };
            } else {
                pivotStudent[dateKey] = { status: item.status };
            }
        }
    });

    const datesArray = Array.from(uniqueDates).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
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
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const dt = useRef<any>(null);
    const { selectedClass } = useClassContext();
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        const fetchAttendanceDetails = async () => {
            try {
                let url = `${import.meta.env.VITE_API_BASE_URL}/attendance-detail?lecturer_id=${currentUser?.userId}`;
                if (selectedClass?.class_id !== "0") {
                    url += `&class_id=${selectedClass?.class_id}`;
                }
                const response = await fetch(url);
                const data: AttendanceItem[] = await response.json();
                console.log("Attendance data", data);
                const result: PivotResult = transformAttendanceToPivot(data);
                setDates(result.dates);
                setPivotData(result.pivotData);
            } catch (error) {
                console.error("Error fetching attendance details:", error);
            }
        };

        fetchAttendanceDetails();
    }, [selectedClass, currentUser]);

    // Header của DataTable với ô tìm kiếm
    const header = (
        <div className="flex flex-wrap lign-items-center justify-between">
            <div className="text-left flex flex-wrap gap-10 align-items-center justify-between">
                <h1 className="m-0 text-2xl">Quản lý điểm danh</h1>
                <div className="flex items-center gap-2 text-xs rounded-[16px] bg-white border border-[#E0E2E7] px-2 max-w-[340px]">
                    <FiSearch className="text-[#278D45] w-5 h-5" />
                    <input type="search" onInput={(e) => { const target = e.target as HTMLInputElement; setGlobalFilter(target.value); }} placeholder="Tìm kiếm..." className=" hidden sm:flex text-[#737791] text-sm font-normal w-[200px] p-2 bg-transparent outline-none" />
                    <FiChevronDown className=" hidden sm:flex text-[#737791] w-5 h-5" />
                </div>
            </div>
            <div className="flex gap-5">
                <div onClick={() => console.log("Import/Export clicked")} className="flex gap-1 p-2 rounded-[16px] items-center justify-between text-white bg-[#3D6649] cursor-pointer hover:bg-green-900">
                    <FiPlus size={18} />
                    <p className="text-base font-normal">Nhập/Xuất Excel</p>
                </div>
                <div onClick={() => console.log("Import/Export clicked")} className="flex gap-1 p-2 rounded-[16px] items-center justify-between text-white bg-[#76BC6A] cursor-pointer hover:bg-green-600">
                    <FiPlus size={18} />
                    <p className="text-base font-normal">Thêm mới</p>
                </div>
            </div>

        </div >
    );

    return (
        <DataTable
            emptyMessage="Chưa có phiên điểm danh nào cho môn học này"
            className="p-2 bg-[#F3F7F5] rounded-[20px]"
            ref={dt}
            value={pivotData}
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
            {/* Các cột động theo ngày (start_date) */}
            {dates.map((date) => (
                <Column
                    key={date}
                    className="bg-[#F3F7F5]"
                    field={date}
                    header={date}
                    sortable
                    style={{ minWidth: "4rem" }}
                    body={(rowData) => {
                        const cellData = rowData[date];
                        if (cellData && typeof cellData === "object") {
                            if (cellData.status === "late") {
                                return (
                                    <span className='text-[#fcbd2d]'>
                                        {mapStatus(cellData.status)} ({cellData.lateHours?.toFixed()} phút)
                                    </span>
                                );
                            }
                            else if (cellData.status === "absent") {
                                return <span className='text-[#f14871]'>{mapStatus(cellData.status)}</span>;

                            }
                            else {
                                return <span >{mapStatus(cellData.status)}</span>;

                            }
                        }
                        return <span></span>;
                    }}
                ></Column>
            ))}

            {/* Cột Thao tác */}
            <Column
                className="bg-[#F3F7F5]"
                header="Thao tác"
                body={actionBodyTemplate}
                exportable={false}
                style={{ minWidth: "5rem" }}
            ></Column>
        </DataTable>
    );
};

export default AttendancePivotDataTable;
