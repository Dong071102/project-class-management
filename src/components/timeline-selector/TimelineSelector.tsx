import React from "react";

interface TimelineSelectorProps {
  filterType: "week" | "month" | "year";
  setFilterType: (type: "week" | "month" | "year") => void;
  selectedAnimal: string;
  setSelectedAnimal: (animal: string) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedMonth: number | null;
  setSelectedMonth: (month: number | null) => void;
  selectedWeek: number | null;
  setSelectedWeek: (week: number | null) => void;
}

const TimelineSelector: React.FC<TimelineSelectorProps> = ({
  filterType,
  setFilterType,
  selectedAnimal,
  setSelectedAnimal,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  selectedWeek,
  setSelectedWeek,
}) => {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <div className="flex bg-white border border-gray-300 rounded-full p-1 w-fit">
        <button
          className={`px-4 py-2 rounded-full transition-colors ${
            filterType === "week" ? "bg-green-100 text-green-700 font-semibold" : "text-gray-500"
          }`}
          onClick={() => setFilterType("week")}
        >
          Theo tuần
        </button>

        <button
          className={`px-4 py-2 rounded-full transition-colors ${
            filterType === "month" ? "bg-green-100 text-green-700 font-semibold" : "text-gray-500"
          }`}
          onClick={() => setFilterType("month")}
        >
          Theo tháng
        </button>

        <button
          className={`px-4 py-2 rounded-full transition-colors ${
            filterType === "year" ? "bg-green-100 text-green-700 font-semibold" : "text-gray-500"
          }`}
          onClick={() => setFilterType("year")}
        >
          Theo năm
        </button>
      </div>
      
      <select className="px-3 py-2 border border-gray-300 rounded-[4px] text-gray-500 bg-white" value={selectedAnimal} onChange={(e) => setSelectedAnimal(e.target.value)}>
        <option value="Cừu">Cừu</option>
        <option value="Dê">Dê</option>
        <option value="Lợn">Lợn</option>
      </select>

      <select className="px-3 py-2 border border-gray-300 rounded-[4px] text-gray-500 bg-white" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
        {Array.from({ length: 5 }, (_, i) => 2024 - i).map((year) => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>

      {filterType !== "year" && (
        <select className="px-3 py-2 border border-gray-300 rounded-[4px] text-gray-500 bg-white" value={selectedMonth ?? ""} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
          <option value="">Chọn tháng</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
            <option key={month} value={month}>Tháng {month}</option>
          ))}
        </select>
      )}

      {filterType === "week" && (
        <select className="px-3 py-2 border border-gray-300 rounded-[4px] text-gray-500 bg-white" value={selectedWeek ?? ""} onChange={(e) => setSelectedWeek(Number(e.target.value))}>
          <option value="">Chọn tuần</option>
          {Array.from({ length: 4 }, (_, i) => i + 1).map((week) => (
            <option key={week} value={week}>Tuần {week}</option>
          ))}
        </select>
      )}
    </div>
  );
};

export default TimelineSelector;
