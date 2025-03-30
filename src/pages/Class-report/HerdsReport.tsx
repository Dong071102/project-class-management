import { useState } from "react";
import BarChartComponent from "../../components/bar-chart/BarChartComponent";

import TimelineSelector from "../../components/timeline-selector/TimelineSelector";


const HerdsReport = () => {
  const [filterType, setFilterType] = useState<"year" | "month" | "week">("year");

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  return (
    <div className="bg-[#F3F7F5] rounded-[16px] p-5">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl">Tỉ lệ điểm danh</h1>
        <TimelineSelector
          filterType={filterType}
          setFilterType={setFilterType}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedWeek={selectedWeek}
          setSelectedWeek={setSelectedWeek}
        />
      </div>

      <div className="flex flex-col gap-y-5">
        <BarChartComponent
          title="Tỉ lệ điểm danh"
          filterType={filterType}
          hasIsolation={true}
        />
      </div>
    </div>

  );
};

export default HerdsReport;
