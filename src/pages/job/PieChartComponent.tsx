import React from "react";
import { FaCircle } from "react-icons/fa";
type CircularProgressProps = {
  percentage: number;
};
const statusMap = {
    "-1": { label: "Quá hạn", color: "text-red-600" },
    "0": { label: "Đang thực hiện", color: "text-blue-600" },
    "1": { label: "Hoàn thành", color: "text-green-600" },
  };

const PieChartComponent: React.FC<CircularProgressProps> = ({ percentage }) => {
  const strokeDashoffset = 100 - percentage;
  const status = percentage >= 100 
  ? statusMap["1"] 
  : percentage >= 20 
    ? statusMap["0"] 
    : statusMap["-1"];

  return (
    <div className="flex flex-col items-center">

        <div className="relative w-34 h-34">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
                <circle
                cx="33"
                cy="33"
                r="31"
                fill="none"
                className="stroke-current text-[#D9D9D9] dark:text-neutral-700"
                strokeWidth="4"
                />

                <circle
                cx="33"
                cy="33"
                r="31"
                fill="none"
                className={`stroke-current ${status.color}`}
                strokeWidth="4"
                strokeDasharray="100"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2">
                <span className={`text-center text-xl text-black`}>{percentage}%</span>
            </div>
        </div>

      <div className="flex items-center mt-2 space-x-2">
        <FaCircle className={`${status.color}  w-2 h-2 `}/>
        <span className={`text-medium font-medium ${status.color}`}>{status.label}</span>
      </div>
    </div>
  );
};

export default PieChartComponent;
