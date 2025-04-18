import React, { useState, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useClassContext } from "../../contexts/classContext";
import { MdHomeWork } from "react-icons/md";
import { FaCalendarAlt } from "react-icons/fa";

const ClassSelector: React.FC = () => {
  const { classes, selectedClass, setSelectedClass, semesters, selectedSemester, setSelectedSemester } = useClassContext();
  const [isClassOpen, setIsClassOpen] = useState<boolean>(false);
  const [isSemesterOpen, setIsSemesterOpen] = useState<boolean>(false);

  // Lọc lớp học theo học kỳ đã chọn
  const [filteredClasses, setFilteredClasses] = useState<any[]>([]);

  // Hàm xử lý chọn lớp
  const handleCourseSelect = (id: string) => {
    const foundClass = classes.find((oclass) => oclass.class_id === id) || null;
    setSelectedClass(foundClass);
    setIsClassOpen(false);
  };

  // Hàm xử lý chọn học kỳ
  const handleSemesterSelect = (semesterId: string) => {
    const foundSemester = semesters.find((semester) => semester.semester_id === semesterId) || null;
    setSelectedSemester(foundSemester);
    setIsSemesterOpen(false);  // Đóng dropdown học kỳ sau khi chọn
  };

  // Sử dụng useEffect để lọc lớp học mỗi khi selectedSemester thay đổi
  useEffect(() => {
    if (selectedSemester && Array.isArray(classes)) {
      if (selectedSemester.semester_id === '0') {
        return setFilteredClasses(classes); // Nếu chọn tất cả học kỳ, không lọc lớp học
      }
      // Lọc lớp học theo semester_id
      let filtered = classes.filter(
        (oclass) => oclass.semester_id === selectedSemester.semester_id
      );
      const firstClass = classes[0];

      if (firstClass && !filtered.some(cls => cls.class_id === firstClass.class_id)) {
        filtered = [firstClass, ...filtered];
      }
      console.log("Filtered Classes:", filtered); // Log filtered classes để kiểm tra
      setFilteredClasses(filtered); // Cập nhật lớp học đã lọc
    } else {
      console.error("Dữ liệu 'classes' không phải là mảng!"); // Nếu không phải mảng, thông báo lỗi
      setFilteredClasses([]); // Nếu không có học kỳ nào được chọn, xóa danh sách lớp
    }
  }, [selectedSemester, classes]); // Theo dõi sự thay đổi của selectedSemester và classes

  return (
    <div className="relative w-[500px] flex flex-row gap-4">
      {/* Dropdown chọn học kỳ */}
      <div className="mb-4 w-[700px]">
        <button
          onClick={() => setIsSemesterOpen(!isSemesterOpen)}
          className="h-12 p-2 border bg-[#76bc6a] w-[280px]  text-white text-left flex items-center justify-between rounded-[12px] "
        >
          <div className="flex items-center gap-2  w-[300px] ">
            <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center shrink-0">
              <FaCalendarAlt className="text-[#76bc6a] w-5 h-5" />
            </div>
            <span className="truncate w-[300px]">
              {selectedSemester && selectedSemester.semester_id != '0' ? (
                `Học kỳ ${selectedSemester.semester} năm học ${selectedSemester.academic_year}`
              ) : (
                "Tất cả"
              )}

            </span>

          </div>
          <FiChevronDown className="w-5 h-5" />

        </button>
        {isSemesterOpen && (
          <ul className="absolute z-50 w-[280px] mt-1 bg-[#76bc6a] border rounded-[20px] p-1.5 text-white text-left">
            {semesters.map((semester) => (
              <li
                key={semester.semester_id}
                className="p-2 hover:border-b hover:border-white cursor-pointer"
                onClick={() => handleSemesterSelect(semester.semester_id)} // Cập nhật selectedSemester
              >
                {semester.semester_id != '0' ? (
                  `Học kỳ ${semester.semester} năm học ${semester.academic_year}`
                ) : (
                  "Tất cả học kì và năm học"
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Dropdown chọn lớp học */}
      {selectedSemester && (
        <button
          onClick={() => setIsClassOpen(!isClassOpen)}
          className="h-12 p-2 border bg-[#76bc6a] w-[300px] text-white text-left flex items-center justify-between rounded-[12px]"
        >
          <div className="flex items-center gap-2">
            <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center shrink-0">
              <MdHomeWork className="text-[#76bc6a] w-5 h-5" />
            </div>
            <span className="truncate max-w-[300px]">
              {selectedClass ? (
                `${selectedClass.class_name} - ${selectedClass.course_name}`
              ) : (
                "Chọn lớp học"
              )}
            </span>
          </div>
          <FiChevronDown className="w-5 h-5" />

        </button>
      )}

      {/* Dropdown cho lớp học */}
      {selectedSemester && isClassOpen && (
        <ul className="absolute z-9999 w-[300px] mt-1  bg-[#76bc6a] border rounded-[20px] p-1.5 text-white text-left  top-[50px] left-[300px]">
          {filteredClasses.map((oclass) => (
            <li
              key={oclass.class_id}
              className="p-2 hover:border-b hover:border-white cursor-pointer"
              onClick={() => handleCourseSelect(oclass.class_id)}
            >
              {oclass.class_name} - {oclass.course_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ClassSelector;
