import { FaUsers } from "react-icons/fa";
import { useClassContext } from "../../contexts/classContext"
import { useEffect } from "react";
interface StatCardProps {
  title: string;
  value: number;
  bgColor: string;
  iconBg: string;
}
const currentMonth = new Date().getMonth(); // Lấy tháng hiện tại (0: Tháng 1, 11: Tháng 12)
const currentYear = new Date().getFullYear(); // Lấy tháng hiện tại (0: Tháng 1, 11: Tháng 12)
const isFirstSemester = currentMonth >= 10 || currentMonth <= 4; // Tháng 11 (10) đến tháng 5 (4)
const stats: StatCardProps[] = [
  { title: "Tổng số sinh viên", value: 120, bgColor: "bg-blue-300", iconBg: "bg-blue-500" },
  { title: "Số sinh viên hiện tại", value: 50, bgColor: "bg-green-300", iconBg: "bg-green-500" },
  { title: "Sinh viên vắng mặt", value: 69, bgColor: "bg-red-300", iconBg: "bg-red-500" },
  { title: "Sinh viên đi trễ", value: 1, bgColor: "bg-yellow-300", iconBg: "bg-yellow-500" },
];


const StudentStatistics: React.FC = () => {
  const { selectedClass } = useClassContext();

  useEffect(() => {
    if (selectedClass) {
      // Xử lý khi id của lớp đã đổi
      console.log("Selected class id changed to:", selectedClass.class_id);
      // Bạn có thể thực hiện gọi API hoặc xử lý logic khác tại đây
    }
  }, [selectedClass]); // Effect này sẽ chạy mỗi khi selectedClass thay đổi

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Thống kê tổng quan {isFirstSemester ? `học kỳ II năm học ${currentYear - 1}-${currentYear}` : "`học kỳ I năm học ${currentYear - 1}-${currentYear}`"} </h2>
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className={`p-4 ${stat.bgColor} rounded-lg flex justify-between items-center`}>
            <div>
              <p className="text-sm">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
            <div className={`p-3 ${stat.iconBg} rounded-lg text-white`}>
              <FaUsers size={24} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentStatistics;
