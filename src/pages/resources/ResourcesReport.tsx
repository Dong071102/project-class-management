
import { useState } from "react";
import TimelineSelector from "../../components/timeline-selector/TimelineSelector";
import LineChartComponent from "../../components/line-chart/LineChartComponent";

const ResourcesReport = () => {
  const [filterType, setFilterType] = useState<"year" | "month" | "week">("year");
  const [selectedAnimal, setSelectedAnimal] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  return (
    <div className="bg-[#F3F7F5] rounded-[16px] p-5">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl">Quản lý tài nguyên</h1>
        <TimelineSelector
          filterType={filterType}
          setFilterType={setFilterType}
          selectedAnimal={selectedAnimal}
          setSelectedAnimal={setSelectedAnimal}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedWeek={selectedWeek}
          setSelectedWeek={setSelectedWeek}
        />
      </div>
      
      <div className="flex flex-col gap-y-5">
        <LineChartComponent title="Lượng nước tiêu thụ" chartType="water" filterType={filterType} alert="water" />
        <LineChartComponent title="Lượng thức ăn tiêu thụ" chartType="food" filterType={filterType} alert="food"  />
        <LineChartComponent title="Chi phí y tế" chartType="medical" filterType={filterType}  alert="medical" /> 
      </div>
    </div>
    
  );
};

  export default ResourcesReport;
      