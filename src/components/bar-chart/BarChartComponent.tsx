

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
const generateData = (type: "year" | "month" | "week", hasIsolation: boolean) => {
  return {
    year: Array.from({ length: 12 }, (_, i) => ({
      name: `Tháng ${i + 1}`,
      khoe: Math.floor(Math.random() * 20000) + 5000,
      benh: Math.floor(Math.random() * 8000) + 2000,
      cachly: hasIsolation ? Math.floor(Math.random() * 3000) + 1000 : undefined,
    })),
    month: Array.from({ length: 4 }, (_, i) => ({
      name: `Tuần ${i + 1}`,
      khoe: Math.floor(Math.random() * 5000) + 1000,
      benh: Math.floor(Math.random() * 2000) + 500,
      cachly: hasIsolation ? Math.floor(Math.random() * 1000) + 200 : undefined,
    })),
    week: Array.from({ length: 7 }, (_, i) => ({
      name: `Ngày ${i + 1}`,
      khoe: Math.floor(Math.random() * 1000) + 300,
      benh: Math.floor(Math.random() * 500) + 100,
      cachly: hasIsolation ? Math.floor(Math.random() * 300) + 50 : undefined,
    })),
  }[type] || [];
};

const labelMap = {
  "Số lượng vật nuôi": { healthy: "Khỏe", sick: "Bệnh" },
  "Tỉ lệ nhập kho": { healthy: "Nhập", sick: "Xuất" },
} as const;

const BarChartComponent = ({ 
  title, 
  filterType, 
  hasIsolation,
  selectedAnimal, 
}: {
  title: string;
  filterType: "year" | "month" | "week"; 
  hasIsolation: boolean;
  selectedAnimal: string;
}) => {
  const data = generateData(filterType, hasIsolation);
  const labels = labelMap[title as keyof typeof labelMap] || { healthy: "Khỏe", sick: "Bệnh" };

  return (
    <div className="p-4 bg-white rounded-[16px] shadow-md">
      <h1 className="text-lg mb-4 text-left font-semibold">{title}</h1>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fill: "#555" }} />
          <YAxis tick={{ fill: "#555" }} />
          <Tooltip />
          <Bar dataKey="khoe" fill="#278D45" name={`${selectedAnimal} khỏe`} radius={[4, 4, 4, 4]} />
          <Bar dataKey="benh" fill="#FCBD2D" name={`${selectedAnimal} bệnh`} radius={[4, 4, 4, 4]} />
          {hasIsolation && (
            <Bar dataKey="cachly" fill="#ED3636" name={`${selectedAnimal} cách ly`} radius={[4, 4, 4, 4]} />
          )}
        </BarChart>
      </ResponsiveContainer>

      <div className="flex justify-center items-center gap-4 bg-[#1C1717] text-white rounded-lg p-3 w-fit mx-auto mt-4">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-sm">{selectedAnimal} {labels.healthy}</p>
          </div>
          <p className="text-lg">{data.reduce((acc, cur) => acc + (cur.khoe || 0), 0).toLocaleString()}</p>
        </div>
        <div className="w-[1px] h-10 bg-gray-500"></div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <p className="text-sm">{selectedAnimal} {labels.sick}</p>
          </div>
          <p className="text-lg">{data.reduce((acc, cur) => acc + (cur.benh || 0), 0).toLocaleString()}</p>
        </div>
        {hasIsolation &&
          <>
            <div className="w-[1px] h-10 bg-gray-500"></div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#ED3636] rounded-full"></div>
                <p className="text-sm">{selectedAnimal} Đang cách ly</p>
              </div>
              <p className="text-lg">{data.reduce((acc, cur) => acc + (cur.cachly || 0), 0).toLocaleString()}</p>
            </div>
          </>
        }
      </div>
    </div>
  );
};

export default BarChartComponent;
