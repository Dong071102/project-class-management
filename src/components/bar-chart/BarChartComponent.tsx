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

interface AttendanceData {
  period: string;
  present: number;
  late: number;
  absent?: number;
}

interface BarChartComponentProps {
  title: string;
  filterType: "year" | "month" | "week";
  hasIsolation: boolean;
  selectedYear: number;
  selectedMonth: number | null;
  selectedWeek: number | null;
}

const BarChartComponent: React.FC<BarChartComponentProps> = ({
  title,
  filterType,
  hasIsolation,
  selectedYear,
  selectedMonth,
  selectedWeek,
}) => {
  const [data, setData] = useState<AttendanceData[]>([]);
  const { selectedClass } = useClassContext();
  const { currentUser } = useContext(AuthContext);

  // Hàm tính tuần trong tháng dựa trên ngày hiện tại
  const getWeekOfMonth = (date: Date): number => {
    const day = date.getDate();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return Math.ceil((day + firstDay) / 7);
  };

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        let defaultMonth: number | null = selectedMonth;
        let defaultWeek: number | null = selectedWeek;

        if (filterType === "week") {
          // Nếu không có tháng được chọn, mặc định dùng tháng hiện tại
          if (defaultMonth === null) {
            defaultMonth = new Date().getMonth() + 1;
          }
          // Nếu không có tuần được chọn, mặc định lấy tuần hiện tại của tháng hiện tại
          if (defaultWeek === null) {
            defaultWeek = getWeekOfMonth(new Date());
          }
        } else if (filterType === "month") {
          // Nếu filter là month và chưa chọn tháng, mặc định dùng tháng hiện tại
          if (defaultMonth === null) {
            defaultMonth = new Date().getMonth() + 1;
          }
        }

        // Xây dựng query string với các tham số cần thiết
        const params = new URLSearchParams({
          filter: filterType,
          year: String(selectedYear),
        });
        if (defaultMonth !== null) {
          params.append("month", String(defaultMonth));
        }
        if (filterType === "week" && defaultWeek !== null) {
          params.append("week", String(defaultWeek));
        }
        console.log('params_result', params.toString());
        if (selectedClass && selectedClass.class_id !== '0') {
          params.append("class_id", String(selectedClass.class_id));

        }
        // Giả sử API endpoint là /attendance-report
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/attendance-report/${currentUser?.userId}?${params.toString()}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result: AttendanceData[] = await response.json();
        console.log("results", result);
        setData(result ?? []);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        setData([]);
      }
    };

    fetchAttendanceData();
  }, [
    filterType,
    hasIsolation,
    selectedYear,
    selectedMonth,
    selectedWeek,
    currentUser,
    selectedClass,
  ]);

  return (
    <div className="p-4 bg-white rounded-[16px] shadow-md">
      <h1 className="text-lg mb-4 text-left font-semibold">{title}</h1>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" tick={{ fill: "#555" }} />
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
