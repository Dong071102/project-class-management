import { FaUsers } from "react-icons/fa";
import { useClassContext } from "../../contexts/classContext"
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../hooks/user";
import PieChartComponent from "../pie-chart/PieChart";
interface StatCardProps {
  title: string;
  value: number;
  bgColor: string;
  iconBg: string;
}
interface AttendanceSummary {
  total_students: number;
  count_absent: number;
  count_present: number;
  count_late: number;
}


const currentMonth = new Date().getMonth(); // Lấy tháng hiện tại (0: Tháng 1, 11: Tháng 12)
const currentYear = new Date().getFullYear(); // Lấy tháng hiện tại (0: Tháng 1, 11: Tháng 12)


const StudentStatistics: React.FC = () => {
  const { selectedClass, selectedSemester } = useClassContext();
  const [title, setTitle] = useState<string>('');
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (selectedClass) {
      // Xử lý khi id của lớp đã đổi
      console.log("Selected class id changed to:", selectedClass.class_id);
      // Bạn có thể thực hiện gọi API hoặc xử lý logic khác tại đây
      let titletpm: string = '';
      if (selectedSemester?.semester_id === '0') {
        titletpm = `toàn bộ học kì và năm học`
        setTitle(
          title
        );
      }
      else if (selectedSemester && selectedSemester?.semester_id !== '0') {
        titletpm = `học kỳ ${selectedSemester.semester} - năm học ${selectedSemester.academic_year}`;
        setTitle(title)
      }
      if (selectedClass && selectedClass.class_id != '0') {

        setTitle(`${titletpm} - lớp ${selectedClass.class_name} ${selectedClass.course_name}`);
      }
    }


  }, [selectedClass, selectedSemester]); // Effect này sẽ chạy mỗi khi selectedClass thay đổi
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const stats: StatCardProps[] = [
    { title: "Tổng số sinh viên", value: summary?.total_students || 0, bgColor: "bg-orange-300", iconBg: "bg-orange-500" },
    // { title: "Số lượt điểm danh", value: summary ? (summary.count_absent + summary.count_present + summary.count_late) : 0, bgColor: "bg-blue-300", iconBg: "bg-blue-500" },
    { title: "Số lượt đúng giờ", value: summary?.count_present || 0, bgColor: "bg-green-300", iconBg: "bg-green-500" },
    { title: "Số lượt đi trễ", value: summary?.count_late || 0, bgColor: "bg-yellow-300", iconBg: "bg-yellow-500" },
    { title: "Số lượt vắng", value: summary?.count_absent || 0, bgColor: "bg-red-300", iconBg: "bg-red-500" },
  ];
  // useEffect fetch dữ liệu khi userId hoặc classId thay đổi
  useEffect(() => {
    const fetchAttendanceSummary = async () => {
      try {

        let url = `http://localhost:8000/attendance-summary?lecturer_id=${currentUser?.userId}`;

        if (selectedClass?.class_id !== '0') {

          url += `&class_id=${selectedClass?.class_id}`;
        }
        if (selectedSemester?.semester_id !== '0') {
          url += `&semester_id=${selectedSemester?.semester_id}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);

        setSummary(data);
      } catch (error) {
        console.error("Error fetching attendance summary:", error);
      }
    };

    fetchAttendanceSummary();
  }, [selectedClass, currentUser, selectedSemester]);
  return (
    <div className=" p-6 rounded-xl shadow-md bg-[#f3f7f5]">
      <h2 className="text-xl font-semibold mb-4">Thống kê tổng quan {title} </h2>

      <div className="grid grid-cols-2 gap-2">

        <div className="border-2 border-gray-200 p-4 rounded-lg flex flex-col"> {/* Sử dụng flex-col cho phần tử cha */}          <PieChartComponent
          presentDays={summary?.count_present || 0}
          lateDays={summary?.count_late || 0}
          absentDays={summary?.count_absent || 0}
        />
          <h3 className="text-xl font-semibold mb-4 mt-auto ">Biểu đồ tỉ lệ đi học </h3>

        </div>
        <div className="border-2 border-gray-200 p-4 rounded-lg flex flex-col"> {/* Sử dụng flex-col cho phần tử cha */}
          <div className="grid grid-cols-2 gap-2 "> {/* Sử dụng flex-col cho phần tử cha */}
            {stats.map((stat, index) => (
              <div key={index}
                className={`p-6 ${stat.bgColor} rounded-lg flex flex-row justify-between items-center h-40`}
              >
                <div>
                  <h2 className="text-2xl">{stat.title}</h2>

                </div>
                <div className={`p-3 ${stat.iconBg} rounded-lg text-white`}>
                  <h2 className="text-5xl font-bold">{stat.value}</h2>

                </div>
              </div>
            ))}
          </div>
          <h3 className="text-xl font-semibold mb-4 mt-auto text-center w-full">
            Số lượng sinh viên đi học {title} </h3>
        </div>
      </div>
    </div >
  );
};

export default StudentStatistics;
