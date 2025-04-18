import React, { useState, useEffect, useRef, useContext } from 'react';
import { classNames } from 'primereact/utils';
import { DataTable, DataTableRowClickEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { StudentService } from '../../services/studentServices';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { FiEdit, FiTrash2, FiChevronDown, FiChevronUp, FiSearch, FiPlus, FiArrowLeft, FiImage } from "react-icons/fi";
import { FaExclamationTriangle } from "react-icons/fa";
import { useClassContext } from '../../contexts/classContext';
import { AuthContext } from '../../hooks/user';
import PieChartComponent from '../../components/pie-chart/PieChart';

// data.ts
export interface Student {
    id: string | null;  // id của sinh viên
    studentCode: string;  // mã sinh viên
    fullName: string;  // tên đầy đủ
    attendanceDays: number;  // tổng số ngày tham gia
    presentDays: number;  // số ngày có mặt
    lateDatys: number;  // số ngày đi muộn
    absentDatys: number;  // số ngày vắng mặt
}

export interface AttendanceRecord {
    attendance_id: string;
    student_code: string;
    first_name: string;
    last_name: string;
    class_name: string;
    course_name: string;
    start_time: string;
    attendance_time: string;
    status: string;
    note: string;
    evidence_image_url: string;
}

export default function StudentManager() {
    const emptyStudent: Student = {
        id: null,  // id của sinh viên
        studentCode: '', // mã sinh viên
        fullName: '',// tên đầy đủ
        attendanceDays: 0,  // tổng số ngày tham gia
        presentDays: 0,  // số ngày có mặt
        lateDatys: 0,  // số ngày đi muộn
        absentDatys: 0,  // số ngày vắng mặt
    };

    const [students, setStudents] = useState<Student[]>([]);
    const [studentDialog, setStudentDialog] = useState<boolean>(false);
    const [deleteStudentDialog, setDeleteStudentDialog] = useState<boolean>(false);
    const [student, setStudent] = useState<Student>(emptyStudent);
    const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<Student[]>>(null);
    const { selectedClass } = useClassContext();
    // New states for student detail view
    const [showDetailView, setShowDetailView] = useState<boolean>(false);
    const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student>(emptyStudent);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const { currentUser } = useContext(AuthContext);
    function formatDateTime(dateString: string): string {
        const date = new Date(dateString);
        // Lấy giờ và phút, padding số nếu cần
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        // Lấy ngày, tháng, năm
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${hours}:${minutes} - ${day}/${month}/${year}`;
    }

    useEffect(() => {
        // Gọi API khi selectedClass thay đổi
        StudentService.getStudents(selectedClass?.class_id || '', selectedClass?.course_id || '', currentUser?.userId || '').then((data) => {
            const mappedData = data.map((student) => ({
                ...student,
                attendanceDays: student.attendanceDays || 0,
                presentDays: student.presentDays || 0,
                lateDatys: student.lateDatys || 0,
                absentDatys: student.absentDatys || 0,
            }));
            setStudents(mappedData);  // Cập nhật dữ liệu cho bảng
        });
    }, [selectedClass, currentUser?.userId]);  // Đảm bảo rằng khi selectedClass hoặc currentUser thay đổi, useEffect được gọi lại


    // Function to handle row double click - FIXED
    const onRowDoubleClick = (e: DataTableRowClickEvent) => {
        const studentData = e.data as Student;
        setSelectedStudentDetail(studentData);
        fetchAttendanceRecords(studentData.id ?? null, currentUser?.userId ?? null);
        setShowDetailView(true);
    };

    // Mock function to fetch attendance records

    const fetchAttendanceRecords = (studentId: string | null, lecturer_id: string | null) => {
        if (!studentId || !lecturer_id) {
            setAttendanceRecords([]);
            return;
        }

        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/get-student-attendances/${studentId}/${lecturer_id}`;
        fetch(apiUrl)
            .then((res) => res.json())
            .then((data) => {
                if (!data) {
                    setAttendanceRecords([]);
                } else {
                    // Chuyển đổi dữ liệu: format start_time và attendance_time
                    const transformed = (data as any[]).map(item => ({
                        ...item,
                        start_time: formatDateTime(item.start_time),
                        attendance_time: formatDateTime(item.attendance_time),
                        evidence_image_url: (item.evidence_image_url && item.evidence_image_url !== '') ? `${import.meta.env.VITE_API_BASE_URL}/facial_recognition/${item.evidence_image_url}` : '',

                    }));
                    setAttendanceRecords(transformed as AttendanceRecord[]);
                }
            })
            .catch((error) => {
                console.error("Error fetching attendance records:", error);
                setAttendanceRecords([]);
            });
    };

    const backToStudentList = () => {
        setShowDetailView(false);
    };

    const openNew = () => {
        setStudent(emptyStudent);
        setSubmitted(false);
        setStudentDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setStudentDialog(false);
    };

    const hideDeleteStudentDialog = () => {
        setDeleteStudentDialog(false);
    };

    const saveStudent = () => {
        setSubmitted(true);

        if (student.fullName.trim()) {
            const _students = [...students];
            const _student = { ...student };

            if (student.id) {
                const index = findIndexById(student.id);

                _students[index] = _student;
                toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Chỉnh sửa thành công', life: 3000 });
            } else {
                _student.id = createId();
                _students.push(_student);
                toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Tạo thành công', life: 3000 });
            }

            setStudents(_students);
            setStudentDialog(false);
            setStudent(emptyStudent);
        }
    };

    const editStudent = (student: Student) => {
        setStudent({ ...student });
        setStudentDialog(true);
    };

    const confirmDeleteStudent = (student: Student) => {
        setStudent(student);
        setDeleteStudentDialog(true);
    };

    const deleteStudent = () => {
        const _students = students.filter((val) => val.id !== student.id);

        setStudents(_students);
        setDeleteStudentDialog(false);
        setStudent(emptyStudent);
        toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Xóa thành công', life: 3000 });
    };

    const findIndexById = (id: string) => {
        let index = -1;
        for (let i = 0; i < students.length; i++) {
            if (students[i].id === id) {
                index = i;
                break;
            }
        }
        return index;
    };

    const createId = (): string => {
        let id = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        const _student = { ...student };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        _student[name] = val;
        setStudent(_student);
    };

    const onInputTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        const _student = { ...student };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        _student[name] = val;
        setStudent(_student);
    };

    const onInputNumberChange = (e: InputNumberValueChangeEvent, name: string) => {
        const val = e.value ?? 0;
        const _student = { ...student };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        _student[name] = val;
        setStudent(_student);
    };

    const actionBodyTemplate = (rowData: Student) => {
        return (
            <React.Fragment>
                <div className="flex flex-wrap gap-2">
                    start_time            <FiEdit className="text-[#FCBD2D] cursor-pointer hover:text-amber-500" size={18} onClick={() => editStudent(rowData)} />
                    <FiTrash2 className="text-[#F14871] cursor-pointer hover:text-red-500" size={18} onClick={() => confirmDeleteStudent(rowData)} />
                </div>
            </React.Fragment>
        );
    };
    const [imageDialogVisible, setImageDialogVisible] = useState<boolean>(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string>(''); // State to store selected image URL

    // Function to open the modal and set the selected image URL
    const showImageDialog = (imageUrl: string) => {
        if (!imageUrl) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Cảnh báo',
                detail: 'Không có ảnh nào để hiển thị',
                life: 3000,
            });
            return;
        }
        console.log(imageUrl);
        setSelectedImageUrl(imageUrl);
        setImageDialogVisible(true);
    };


    const attendanceActionBodyTemplate = (rowData: AttendanceRecord) => {
        return (
            <React.Fragment>
                <div className="flex flex-wrap gap-2">
                    <FiImage
                        className="text-[#3d6649] cursor-pointer hover:text-[#76bc6a]"
                        size={18}
                        onClick={() => showImageDialog(rowData.evidence_image_url)} // Open dialog when image is clicked
                    />
                </div>
            </React.Fragment>
        );
    };
    // Modal to display the image
    const imageDialogFooter = (
        <React.Fragment>
            <Button label="Đóng" icon="pi pi-times" onClick={() => setImageDialogVisible(false)} autoFocus />
        </React.Fragment>
    );

    const header = (
        <div className="flex flex-wrap lign-items-center justify-between">
            <div className="text-left flex flex-wrap gap-10 align-items-center justify-between">
                <h1 className="m-0 text-2xl">Danh sách học sinh</h1>
                <div className="flex items-center gap-2 text-xs rounded-full bg-white border border-[#E0E2E7] px-2 max-w-[340px]">
                    <FiSearch className="text-[#278D45] w-5 h-5" />
                    <input type="search" onInput={(e) => { const target = e.target as HTMLInputElement; setGlobalFilter(target.value); }} placeholder="Tìm kiếm..." className=" hidden sm:flex text-[#737791] text-sm font-normal w-[200px] p-2 bg-transparent outline-none" />
                    <FiChevronDown className=" hidden sm:flex text-[#737791] w-5 h-5" />
                </div>
            </div>


        </div>
    );

    const detailViewHeader = (
        <div className="flex flex-wrap items-center justify-between">
            <div className="text-left flex flex-wrap gap-4 items-center">
                <Button
                    icon={<FiArrowLeft />}
                    // outlined
                    className="p-0 w-10 h-10 border-none"
                    onClick={backToStudentList}
                />
                <h1 className="m-0 text-2xl">Thông tin chi tiết học sinh</h1>
            </div>

            <div onClick={() => editStudent(selectedStudentDetail)} className="flex gap-1 p-2 rounded-full items-center justify-between text-white bg-[#76BC6A] cursor-pointer hover:bg-green-600" >
                <FiEdit size={18} />
                <p className="text-base font-normal">Chỉnh sửa</p>
            </div>
        </div>
    );

    const attendanceHeader = (
        <div className="flex flex-wrap items-center justify-between mt-8 mb-4">
            <h2 className="m-0 text-xl">Lịch sử điểm danh</h2>

            <div className="flex items-center gap-2 text-xs rounded-full bg-white border border-[#E0E2E7] px-2 max-w-[340px]">
                <FiSearch className="text-[#278D45] w-5 h-5" />
                <input type="search" placeholder="Tìm kiếm..." className="hidden sm:flex text-[#737791] text-sm font-normal w-[200px] p-2 bg-transparent outline-none" />
                <FiChevronDown className="hidden sm:flex text-[#737791] w-5 h-5" />
            </div>
        </div>
    );

    const studentDialogFooter = (
        <React.Fragment>
            <Button label="Thoát" outlined onClick={hideDialog} rounded />
            <Button label="Lưu Thay Đổi" onClick={saveStudent} rounded />
        </React.Fragment>
    );
    const deleteStudentDialogFooter = (
        <React.Fragment>
            <Button label="Không" outlined onClick={hideDeleteStudentDialog} rounded />
            <Button label="Có" severity="danger" onClick={deleteStudent} rounded />
        </React.Fragment>
    );

    return (
        <div>
            <Toast ref={toast} />

            {!showDetailView ? (
                // Main students list view
                <div>
                    <DataTable
                        className="p-2 bg-[#F3F7F5] rounded-[20px]"
                        ref={dt}
                        value={students}
                        selection={selectedStudents}
                        onSelectionChange={(e) => {
                            if (Array.isArray(e.value)) {
                                setSelectedStudents(e.value);
                            }
                        }}
                        onRowDoubleClick={onRowDoubleClick}
                        sortIcon={(options) => options.order === 1 ? <FiChevronUp /> : <FiChevronDown />}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate=" PrevPageLink PageLinks NextPageLink  RowsPerPageDropdown"
                        globalFilter={globalFilter}
                        header={header}
                        selectionMode="multiple"
                        scrollable
                        scrollHeight='100vh'
                        virtualScrollerOptions={{ itemSize: 46 }}
                        tableStyle={{ minWidth: '50rem' }}
                    >
                        <Column selectionMode="multiple" exportable={false}></Column>

                        {/* Cột STT - Số thứ tự tăng dần */}
                        <Column
                            header="STT"
                            body={(rowData: Student, { rowIndex }) => rowIndex + 1}  // Hiển thị STT từ 1
                            sortable
                            style={{ minWidth: '4rem' }}
                        ></Column>

                        <Column field="studentCode" header="MSSV" sortable style={{ minWidth: '4rem' }}></Column>
                        <Column field="fullName" header="Họ và tên" sortable style={{ minWidth: '10rem' }}></Column>
                        <Column field="attendanceDays" header="SL điểm danh" sortable style={{ minWidth: '8rem' }}></Column>
                        <Column field="presentDays" header="Đúng giờ" sortable style={{ minWidth: '8rem' }}></Column>
                        <Column field="lateDatys" header="Đi trễ" sortable style={{ minWidth: '6rem' }}></Column>
                        <Column field="absentDatys" header="Vắng" sortable style={{ minWidth: '6rem' }}></Column>
                    </DataTable>

                </div>
            )




                : (
                    // Student detail view
                    <div>
                        {/* Header */}
                        {detailViewHeader}

                        {/* Student information card */}
                        <div className='grid grid-cols-2 gap-2'>
                            <div className="p-4 mt-4 bg-[#F3F7F5] rounded-[20px]">
                                <h3 className="mb-4 text-lg">Thông tin học sinh</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="field">
                                        <label className="block text-sm font-medium mb-1">MSSV</label>
                                        <div className="p-2 bg-white rounded">{selectedStudentDetail.studentCode}</div>
                                    </div>
                                    <div className="field col-span-2">
                                        <label className="block text-sm font-medium mb-1">Họ và tên</label>
                                        <div className="p-2 bg-white rounded">{selectedStudentDetail.fullName}</div>
                                    </div>
                                    <div className="field">
                                        <label className="block text-sm font-medium mb-1">Đúng giờ/Buổi</label>
                                        <div className="p-2 bg-white rounded">{`${selectedStudentDetail?.presentDays} / ${selectedStudentDetail?.attendanceDays}` || "Chưa cập nhật"}</div>
                                    </div>
                                    <div className="field">
                                        <label className="block text-sm font-medium mb-1">Trễ giờ/Buổi</label>
                                        <div className="p-2 bg-white rounded">{`${selectedStudentDetail?.lateDatys} / ${selectedStudentDetail?.attendanceDays}` || 'Chưa cập nhật'}</div>
                                    </div>
                                    <div className="field">
                                        <label className="block text-sm font-medium mb-1">Nghỉ học/Buổi</label>
                                        <div className="p-2 bg-white rounded">{`${selectedStudentDetail?.absentDatys} / ${selectedStudentDetail?.attendanceDays}` || 'Chưa cập nhật'}</div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="p-4 mt-4 bg-[#F3F7F5] rounded-[20px]">
                                    <h3 className="mb-4 text-lg">Biểu đồ tỉ lệ đi học</h3>
                                    <PieChartComponent
                                        presentDays={selectedStudentDetail.presentDays ?? 0}
                                        lateDays={selectedStudentDetail.lateDatys ?? 0}
                                        absentDays={selectedStudentDetail.absentDatys ?? 0}
                                    />
                                </div>


                            </div>
                        </div>

                        {/* Attendance records table */}
                        {attendanceHeader}
                        <DataTable
                            className="p-2 bg-[#F3F7F5] rounded-[20px]"
                            value={attendanceRecords}
                            sortIcon={(options) => options.order === 1 ? <FiChevronUp /> : <FiChevronDown />}
                            dataKey="id"
                            paginator
                            rows={5}
                            rowsPerPageOptions={[5, 10, 25]}
                            paginatorTemplate=" PrevPageLink PageLinks NextPageLink  RowsPerPageDropdown"
                            scrollable
                            scrollHeight='50vh'
                            tableStyle={{ minWidth: '50rem' }}
                        >
                        //======================================================================================
                            <Column
                                header="STT"
                                body={(rowData: any, { rowIndex }: { rowIndex: number }) => rowIndex + 1}
                                sortable
                                style={{ minWidth: '4rem' }}
                            ></Column>
                            <Column field="course_name" header="Môn học" sortable style={{ minWidth: '10rem' }}></Column>
                            {/* <Column field="start_time" header="Buổi học" sortable style={{ minWidth: '8rem' }}></Column> */}
                            <Column field="start_time" header="Ngày học" sortable style={{ minWidth: '11rem' }}></Column>
                            <Column field="attendance_time" header="Thời gian điểm danh" sortable style={{ minWidth: '12rem' }}></Column>
                            <Column
                                header="Trạng thái"
                                body={(rowData: AttendanceRecord) => {
                                    let text = "";
                                    let className = "";
                                    if (rowData.status === "present") {
                                        text = "Đúng giờ";
                                        // giữ nguyên mặc định
                                    } else if (rowData.status === "late") {
                                        text = `Trễ`;
                                        className = "text-yellow-500";
                                    } else if (rowData.status === "absent") {
                                        text = "vắng";
                                        className = "text-red-500";
                                    } else {
                                        text = rowData.status;
                                    }
                                    return <span className={className}>{text}</span>;
                                }}
                                sortable
                                style={{ minWidth: '8rem' }}
                            ></Column>

                            <Column field="note" header="Ghi chú" sortable style={{ minWidth: '10rem' }}></Column>
                            <Column header="Ảnh điểm danh" body={attendanceActionBodyTemplate} exportable={false} style={{ minWidth: '5rem' }}></Column>
                        </DataTable>
                    </div>
                )
            }

            <Dialog
                visible={imageDialogVisible}
                style={{ width: '50vw' }}
                header="Ảnh điểm danh"
                modal
                footer={imageDialogFooter}
                onHide={() => setImageDialogVisible(false)}
            >
                <img src={selectedImageUrl} alt="Attendance" className="w-full" />
            </Dialog>
        </div >

    );
}