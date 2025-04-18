import React, { useContext, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useClassContext } from "../../contexts/classContext";
import { AuthContext } from "../../hooks/user";

interface CourseDataa {
  course_id: string;
  course_name: string;
  present: number;
  late: number;
  absent?: number;
}

interface BarChartComponentProps {
  title: string;
  hasIsolation: boolean;
  selectedStartDate: Date | null;
  selectedEndDate: Date | null;
  selectedType?: string;
}

const BarChartComponent: React.FC<BarChartComponentProps> = ({
  title,
  hasIsolation,
  selectedStartDate,
  selectedEndDate,
  selectedType
}) => {
  const [data, setData] = useState<CourseDataa[]>([]);
  const { currentUser } = useContext(AuthContext);

  // Hàm tính tuần trong tháng dựa trên ngày hiện tại


  useEffect(() => {
    const fetchAttendanceData = async () => {

      try {
        // Giả sử API endpoint là /attendance-report
        let url = `${import.meta.env.VITE_API_BASE_URL}/get-courses-report?main_lecturer_id=${currentUser?.userId}`
        if (selectedStartDate) {
          console.log("start date", selectedStartDate);
          const localDate = selectedStartDate.toLocaleDateString('vi-VN').split("/").reverse().join("-"); // YYYY-MM-DD
          url += `&begin_day=${localDate}`;
        }
        if (selectedEndDate) {
          console.log("start date", selectedStartDate);
          const localDate = selectedEndDate.toLocaleDateString('vi-VN').split("/").reverse().join("-"); // YYYY-MM-DD
          url += `&end_day=${localDate}`;
        }
        if (selectedType == 'class') {
          url += `&type=${selectedType}`;
        }
        console.log(url)
        const response = await fetch(url);
        const result: any[] = await response.json();
        console.log("results report", result);

        const mappedResult: CourseDataa[] = result.map(item => ({
          course_id: item.course_id,
          course_name: selectedType === 'class' ? `${item.class_name}-${item.course_name}` : item.course_name,
          present: item.present,
          late: item.late,
          absent: item.absent, // `absent` có thể là undefined, nếu không có, nó sẽ không bị đưa vào
        }));
        console.log("results report", result);
        setData(mappedResult ?? []);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        setData([]);
      }
    };

    fetchAttendanceData();
  }, [
    hasIsolation,
    currentUser,
    selectedStartDate,
    selectedEndDate,
    selectedType,
  ]);

  return (
    <div className="p-4 bg-white rounded-[16px] shadow-md">
      <h1 className="text-lg mb-4 text-left font-semibold">{title}</h1>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="course_name" tick={{ fill: "#555" }} />
          <YAxis tick={{ fill: "#555" }} />
          <Tooltip />
          <Bar
            dataKey="present"
            fill="#278D45"
            name="Đúng giờ"
            radius={[4, 4, 4, 4]}
          />
          <Bar
            dataKey="late"
            fill="#FCBD2D"
            name="Trễ"
            radius={[4, 4, 4, 4]}
          />
          {hasIsolation && (
            <Bar
              dataKey="absent"
              fill="#ED3636"
              name="Nghỉ"
              radius={[4, 4, 4, 4]}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center items-center gap-4 bg-[#1C1717] text-white rounded-lg p-3 w-fit mx-auto mt-4">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-sm">Đúng giờ</p>
          </div>
          <p className="text-lg">
            {data.reduce((acc, cur) => acc + (cur.present || 0), 0).toLocaleString()}
          </p>
        </div>
        <div className="w-[1px] h-10 bg-gray-500"></div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <p className="text-sm">Trễ</p>
          </div>
          <p className="text-lg">
            {data.reduce((acc, cur) => acc + (cur.late || 0), 0).toLocaleString()}
          </p>
        </div>
        {hasIsolation && (
          <>
            <div className="w-[1px] h-10 bg-gray-500"></div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#ED3636] rounded-full"></div>
                <p className="text-sm">Nghỉ</p>
              </div>
              <p className="text-lg">
                {data.reduce((acc, cur) => acc + (cur.absent || 0), 0).toLocaleString()}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BarChartComponent;
