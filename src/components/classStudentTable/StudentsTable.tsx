import React, { useEffect, useState, useContext, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import * as XLSX from "xlsx";
import { useClassContext } from "../../contexts/classContext";
import { AuthContext } from "../../hooks/user";
import { FiSearch, FiChevronDown, FiChevronUp, FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { RadioButton } from "primereact/radiobutton";

// Định nghĩa các interface
interface StudentBasicInfo {
    class_id: string;
    class_name: string;
    student_id: string;
    student_code: string;
    first_name: string;
    last_name: string;
    status: string;
}

interface DisplayStudent {
    id: string;
    studentCode: string;
    fullName: string;
    className: string;
    status: string;
}

const headerMapping: Record<string, string> = {
    studentCode: "Mã sinh viên",
    fullName: "Họ tên",
    className: "Lớp học",
    status: "Trạng thái"
};

const reverseHeaderMapping = Object.fromEntries(Object.entries(headerMapping).map(([k, v]) => [v, k]));

const StudentsBasicTable: React.FC = () => {
    const [students, setStudents] = useState<DisplayStudent[]>([]);
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const [productDialog, setProductDialog] = useState<boolean>(false);
    const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
    const [importExportDialog, setImportExportDialog] = useState<boolean>(false);
    const [selectedStudent, setSelectedStudent] = useState<DisplayStudent | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const { selectedClass } = useClassContext();
    const { currentUser } = useContext(AuthContext);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        fetchStudents();
    }, [selectedClass, currentUser]);
    const statusMapping: Record<string, string> = {
        "active": "Còn học",
        "inactive": "Đã nghỉ học",
        "banned": "Cấm thi"
    };
    const fetchStudents = async () => {
        try {
            let url = `${import.meta.env.VITE_API_BASE_URL}/students-in-class/${currentUser?.userId}`;
            if (selectedClass?.class_id !== "0") {
                url += `?class_id=${selectedClass?.class_id}`;
            }
            const response = await fetch(url);
            const data: StudentBasicInfo[] = await response.json();
            console.log(data);

            // Kiểm tra nếu dữ liệu trả về là null hoặc mảng rỗng
            if (!data || data.length === 0) {
                setStudents([]);  // Set students là mảng rỗng nếu không có dữ liệu
                toast.current?.show({
                    severity: "info",
                    summary: "Thông báo",
                    detail: "Không có dữ liệu sinh viên",
                    life: 3000
                });
                return;
            }

            const formattedData = data.map((student) => ({
                id: `${student.student_id}__${student.class_id}`,
                studentId: student.student_id,
                studentCode: student.student_code,
                fullName: `${student.last_name} ${student.first_name}`,
                className: student.class_name,
                status: student.status,
            }));
            console.log('formattedData', formattedData);
            setStudents(formattedData);
        } catch (error) {
            console.error("Error fetching student list:", error);
            toast.current?.show({
                severity: "error",
                summary: "Lỗi",
                detail: "Không thể lấy dữ liệu sinh viên",
                life: 3000
            });
        }
    };


    const openNew = (rowData: DisplayStudent) => {
        setSelectedStudent({
            id: rowData.id || "",  // Khởi tạo id nếu không có
            studentCode: rowData.studentCode || "", // Khởi tạo studentCode nếu không có
            fullName: rowData.fullName || "", // Khởi tạo fullName nếu không có
            className: rowData.className || "", // Khởi tạo className nếu không có
            status: rowData.status || "active", // Ánh xạ chính xác trạng thái của sinh viên
        });
        setSubmitted(false);
        setProductDialog(true);
    };


    const hideDialog = () => setProductDialog(false);
    const hideImportExportDialog = () => setImportExportDialog(false);
    const updateStudentAPI = async (student: DisplayStudent) => {
        try {
            const nameParts = student.fullName.trim().split(" ");
            const lastName = nameParts.pop() || "";
            const firstName = nameParts.join(" ");
            const classId = student.id.trim().split('__').pop() || '';
            const studentId = student.id.trim().split('__')[0]
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/update/student/${studentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    classId,
                    studentCode: student.studentCode,
                    lastName,
                    firstName,
                    status: student.status,
                }),
            });

            if (!res.ok) {
                throw new Error("Cập nhật thất bại");
            }

            return await res.json();
        } catch (err) {
            console.error("Update failed:", err);
            throw err;
        }
    };

    const saveStudent = async () => {
        setSubmitted(true);
        if (!selectedStudent?.studentCode || !selectedStudent.fullName) return;

        const updatedStudent: DisplayStudent = {
            id: selectedStudent.id,
            studentCode: selectedStudent.studentCode || "",
            fullName: selectedStudent.fullName || "",
            className: selectedStudent.className || "",
            status: selectedStudent.status || "active",
        };
        console.log('updatedStudent.id', updatedStudent)
        try {
            // Gọi API cập nhật
            if (updatedStudent.id !== '') {
                await updateStudentAPI(updatedStudent);

            }
            else {
                try {
                    if (selectedClass?.class_id === '0') {
                        toast.current?.show({ severity: "error", summary: "Lỗi", detail: "Vui lòng chọn lớp học để thêm", life: 3000 });

                        return;

                    }
                    const classId = selectedClass?.class_id;

                    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/add-student-to-class`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(
                            [{
                            studentCode: updatedStudent.studentCode,
                            classId,
                            status: updatedStudent.status,
                        }]),
                    });

                    const result = await res.json();  // Đọc thông báo lỗi từ server
                    console.log(result);


                    if (res.ok) {
                        toast.current?.show({ severity: "success", summary: "Thành công", detail: `Đã thêm sinh viên  ${updatedStudent.className}`, life: 3000 });
                    } else {
                        toast.current?.show({ severity: "error", summary: "Lỗi", detail: "Sinh viên sai thông tin", life: 3000 });
                    }
                } catch (error) {
                    toast.current?.show({
                        severity: "error",
                        summary: "Lỗi",
                        detail: "Không thể kết nối tới server để thêm sinh viên",
                        life: 3000,
                    });
                }

            }
            console.log('updatedStudent', 'updatedStudent', updatedStudent)
            // Cập nhật vào UI
            const updatedList = [...students];
            const index = updatedList.findIndex((s) => s.id === updatedStudent.id);

            if (index !== -1) {
                updatedList[index] = updatedStudent;
            } else {
                updatedList.push(updatedStudent);
            }

            setStudents(updatedList);
            setProductDialog(false);
            toast.current?.show({
                severity: "success",
                summary: "Thành công",
                detail: "Cập nhật sinh viên thành công",
                life: 3000,
            });
        } catch (err) {
            toast.current?.show({
                severity: "error",
                summary: "Lỗi",
                detail: "Không thể cập nhật sinh viên",
                life: 3000,
            });
        }
    };


    const confirmDeleteStudent = (student: DisplayStudent) => {
        setSelectedStudent(student);
        setDeleteDialog(true);
    };
    const deleteStudent = async () => {
        try {
            const classId = selectedStudent?.id.trim().split('__').pop() || '';
            const studentId = selectedStudent?.id.trim().split('__')[0]
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/del-student-from-class/${studentId}/${classId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                setStudents(students.filter((s) => s.id !== selectedStudent?.id));
                setDeleteDialog(false);
                toast.current?.show({ severity: "success", summary: "Đã xoá", detail: "Sinh viên đã được xoá", life: 3000 });
            } else {
                toast.current?.show({ severity: "error", summary: "Lỗi", detail: "Không thể xoá sinh viên", life: 3000 });
            }
        } catch (error) {
            toast.current?.show({ severity: "error", summary: "Lỗi", detail: "Không thể kết nối tới server", life: 3000 });
        }
    };

    // const deleteStudent = () => {
    //     setStudents(students.filter((s) => s.id !== selectedStudent?.id));
    //     setDeleteDialog(false);
    //     toast.current?.show({ severity: "success", summary: "Đã xoá", detail: "Sinh viên đã được xoá", life: 3000 });
    // };

    const exportExcel = () => {
        const exportData = students.map((row) => {
            const mapped: any = {};
            Object.keys(headerMapping).forEach((key) => {
                mapped[headerMapping[key]] = row[key as keyof DisplayStudent];
            });
            return mapped;
        });
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
        XLSX.writeFile(workbook, "students.xlsx");
        hideImportExportDialog();
    };

    const importExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (selectedClass?.class_id === "0") {
            toast.current?.show({
                severity: "error",
                summary: "Lỗi",
                detail: "Vui lòng chọn lớp học trước khi nhập dữ liệu.",
                life: 3000
            });
            return; // Dừng việc nhập dữ liệu nếu lớp học chưa được chọn
        }

        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const data = new Uint8Array(evt?.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            // Kiểm tra dữ liệu nhập từ Excel
            console.log(jsonData);

            const importedData = jsonData.map((item: any) => {
                const mapped: any = {};
                Object.keys(item).forEach((col) => {
                    // Ánh xạ các cột từ Excel vào các trường của sinh viên
                    if (col === "Lớp") {
                        mapped["className"] = item[col];
                    } else if (col === "Môn học") {
                        mapped["scheduleName"] = item[col];
                    } else if (col === "Mã sinh viên") {
                        mapped["studentCode"] = item[col];
                    } else if (col === "Họ tên") {
                        mapped["fullName"] = item[col];
                    } else if (col === "Trạng thái") {
                        mapped["status"] = item[col]; // Trạng thái ngày 29/03/2025
                    }
                });

                // Kiểm tra nếu không có trạng thái thì gán "active" mặc định
                const status = mapped.status || "active"; // Nếu không có status thì gán "active"

                // Chia tên thành firstName và lastName
                const nameParts = mapped.fullName ? mapped.fullName.split(" ") : [];
                const lastName = nameParts.pop();
                const firstName = nameParts.join(" ");

                return {
                    id: `${mapped.studentCode}_${mapped.className}`, // Tạo id duy nhất cho mỗi sinh viên
                    studentCode: mapped.studentCode,
                    fullName: mapped.fullName,
                    firstName,
                    lastName,
                    className: mapped.className,
                    status: status, // Đảm bảo luôn có trạng thái
                };
            });

            // Lưu dữ liệu vào state
            setStudents(importedData);

            // Lấy classId từ selectedClass (context)
            const classId = selectedClass?.class_id;

            // Gửi dữ liệu lên API để thêm sinh viên vào lớp
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/add-student-to-class`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(importedData.map(student => ({
                        studentCode: student.studentCode,
                        classId,
                        status: student.status, // Trạng thái đã được xử lý và có giá trị
                    }))),
                });

                if (res.ok) {
                    toast.current?.show({ severity: "success", summary: "Thành công", detail: "Đã nhập dữ liệu từ Excel và thêm sinh viên vào lớp", life: 3000 });
                } else {
                    toast.current?.show({ severity: "error", summary: "Lỗi", detail: "Không thể thêm sinh viên vào lớp", life: 3000 });
                }
            } catch (error) {
                toast.current?.show({
                    severity: "error",
                    summary: "Lỗi",
                    detail: "Không thể kết nối tới server để thêm sinh viên",
                    life: 3000,
                });
            }

            hideImportExportDialog();
        };
        reader.readAsArrayBuffer(file);
    };


    const header = (
        <div className="flex flex-wrap items-center justify-between">
            <div className="text-left flex flex-wrap gap-10 items-center">
                <h1 className="m-0 text-[22px] font-bold text-[#1A1A1A]">Quản lý thông tin sinh viên</h1>
                <div className="flex items-center gap-2 text-xs rounded-[16px] bg-white border border-[#E0E2E7] px-2 max-w-[340px]">
                    <FiSearch className="text-[#278D45] w-5 h-5" />
                    <input
                        type="search"
                        onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)}
                        placeholder="Tìm kiếm..."
                        className="hidden sm:flex text-[#737791] text-sm font-normal w-[200px] p-2 bg-transparent outline-none"
                    />
                    <FiChevronDown className="hidden sm:flex text-[#737791] w-5 h-5" />
                </div>
            </div>
            <div className="flex gap-3">
                <button
                    onClick={() => setImportExportDialog(true)}
                    className="flex items-center gap-1 px-4 py-2 rounded-[16px] text-white bg-[#3D6649] hover:bg-green-900"
                >
                    <FiPlus size={16} /> Nhập/Xuất Excel
                </button>
                <button
                    onClick={() => openNew({ id: "", studentCode: "", fullName: "", className: "", status: "" })}
                    className="flex items-center gap-1 px-4 py-2 rounded-[16px] text-white bg-[#76BC6A] hover:bg-green-600"
                >
                    <FiPlus size={16} /> Thêm mới
                </button>
            </div>
        </div>
    );

    const sortIcon = (options: any) => options.order === 1 ? <FiChevronUp /> : <FiChevronDown />;

    return (
        <div>
            <Toast ref={toast} />
            <DataTable
                value={students}
                paginator
                rows={10}
                globalFilter={globalFilter}
                header={header}
                dataKey="id"
                emptyMessage="Không có sinh viên nào được tìm thấy"
                className="p-2 bg-[#F3F7F5] rounded-[20px]"
                sortIcon={sortIcon}
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                <Column header="STT" body={(_, { rowIndex }) => rowIndex + 1} style={{ minWidth: "4rem" }} />
                <Column field="studentCode" header="MSSV" sortable style={{ minWidth: "8rem" }} />
                <Column field="fullName" header="Họ và tên" sortable style={{ minWidth: "10rem" }} />
                <Column field="className" header="Lớp học" sortable style={{ minWidth: "8rem" }} />

                <Column
                    field="status"
                    header="Trạng thái"
                    sortable
                    style={{ minWidth: "10rem" }}
                    body={(rowData) => {
                        let statusClass = "";
                        const statusText = statusMapping[rowData.status] || rowData.status;

                        if (rowData.status === "inactive") {
                            statusClass = "text-[#F14871]";
                        } else if (rowData.status === "banned") {
                            statusClass = "text-[#fcbd2d]";
                        } else {
                            statusClass = "text-[#278D45]";
                        }

                        return <span className={`p-2 rounded-md ${statusClass}`}>{statusText}</span>;
                    }}

                />

                <Column header="Thao tác" body={(rowData) => (
                    <div className="flex gap-2">
                        <FiEdit className="text-[#FCBD2D] cursor-pointer hover:text-amber-500" onClick={() => { setSelectedStudent(rowData); setProductDialog(true); }} />
                        <FiTrash2 className="text-[#F14871] cursor-pointer hover:text-red-500" onClick={() => confirmDeleteStudent(rowData)} />
                    </div>
                )} style={{ minWidth: "6rem" }} />
            </DataTable>

            {/* Dialogs */}
            {/* import {RadioButton} from "primereact/radiobutton"; */}
            <Dialog visible={productDialog} style={{ width: '500px' }} header="Thêm/Sửa sinh viên" modal onHide={hideDialog} footer={
                <div className="flex justify-end gap-2">
                    <Button label="Huỷ" onClick={hideDialog} outlined />
                    <Button label="Lưu" onClick={saveStudent} autoFocus />
                </div>
            }>
                <div className="p-fluid">
                    <div className="field">
                        <label>Mã sinh viên</label>
                        <InputText value={selectedStudent?.studentCode} onChange={(e) => setSelectedStudent({ ...selectedStudent!, studentCode: e.target.value })} />
                    </div>

                    <div className="field">
                        <label>Họ và tên</label>
                        <InputText value={selectedStudent?.fullName} onChange={(e) => setSelectedStudent({ ...selectedStudent!, fullName: e.target.value })} />
                    </div>

                    <div className="field">
                        <label>Lớp học</label>
                        <InputText value={selectedStudent?.className} onChange={(e) => setSelectedStudent({ ...selectedStudent!, className: e.target.value })} />
                    </div>

                    <div className="field">
                        <label>Trạng thái</label>
                        <div className="flex flex-column gap-2">
                            <div className="flex align-items-center">
                                <RadioButton
                                    inputId="active"
                                    name="status"
                                    value="active"
                                    checked={selectedStudent?.status === "active"}
                                    onChange={(e) => setSelectedStudent({ ...selectedStudent!, status: e.value })}
                                />


                            </div>

                            <div className="flex align-items-center">
                                <RadioButton
                                    inputId="banned"
                                    name="status"
                                    value="banned"
                                    checked={selectedStudent?.status === "banned"}  // Kiểm tra trạng thái đã chọn
                                    onChange={(e) => setSelectedStudent((prevState) => {
                                        if (prevState) {
                                            return {
                                                ...prevState,
                                                status: e.value,  // Cập nhật trạng thái
                                            };
                                        }
                                        return prevState;  // Trả về prevState nếu không có giá trị
                                    })}  // Cập nhật trạng thái vào selectedStudent
                                />
                                <label htmlFor="banned" className="ml-2">Bị cấm</label>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
            <Dialog visible={productDialog} style={{ width: '500px' }} header="Thêm/Sửa sinh viên" modal onHide={hideDialog} footer={
                <div className="flex justify-end gap-2">
                    <Button label="Huỷ" onClick={hideDialog} outlined />
                    <Button label="Lưu" onClick={saveStudent} autoFocus />
                </div>
            }>
                <div className="p-fluid">
                    <div className="field">
                        <label>Mã sinh viên</label>
                        <InputText value={selectedStudent?.studentCode} onChange={(e) => setSelectedStudent({ ...selectedStudent!, studentCode: e.target.value })} />
                    </div>

                    <div className="field">
                        <label>Họ và tên</label>
                        <InputText value={selectedStudent?.fullName} onChange={(e) => setSelectedStudent({ ...selectedStudent!, fullName: e.target.value })} />
                    </div>

                    <div className="field">
                        <label>Lớp học</label>
                        <InputText value={selectedStudent?.className} onChange={(e) => setSelectedStudent({ ...selectedStudent!, className: e.target.value })} />
                    </div>

                    <div className="field">
                        <label>Trạng thái</label>
                        <div className="flex flex-column gap-2">
                            <div className="flex align-items-center">
                                <RadioButton
                                    inputId="active"
                                    name="status"
                                    value="active"
                                    checked={selectedStudent?.status === "active"}
                                    onChange={(e) => setSelectedStudent({ ...selectedStudent!, status: e.value })}
                                />
                                <label htmlFor="active" className="ml-2">Còn học</label>
                            </div>
                            <div className="flex align-items-center">
                                <RadioButton
                                    inputId="inactive"
                                    name="status"
                                    value="inactive"
                                    checked={selectedStudent?.status === "inactive"}
                                    onChange={(e) => setSelectedStudent({ ...selectedStudent!, status: e.value })}
                                />
                                <label htmlFor="inactive" className="ml-2">Đã nghỉ học</label>
                            </div>
                            <div className="flex align-items-center">
                                <RadioButton
                                    inputId="banned"
                                    name="status"
                                    value="banned"
                                    checked={selectedStudent?.status === "banned"}
                                    onChange={(e) => setSelectedStudent({ ...selectedStudent!, status: e.value })}
                                />
                                <label htmlFor="banned" className="ml-2">Cấm thi</label>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>


            {/* Nhập/Xuất Excel */}
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
            {/* Xoá sinh viên */}
            <Dialog visible={deleteDialog} style={{ width: '400px' }} header="Xoá sinh viên" modal onHide={() => setDeleteDialog(false)} footer={
                <div className="flex justify-end gap-2">
                    <Button label="Không" onClick={() => setDeleteDialog(false)} outlined />
                    <Button label="Có" onClick={deleteStudent} severity="danger" />
                </div>
            }>
                <p>Bạn có chắc chắn muốn xoá sinh viên <b>{selectedStudent?.fullName}</b>?</p>
            </Dialog>
        </div>
    );
};

export default StudentsBasicTable;
