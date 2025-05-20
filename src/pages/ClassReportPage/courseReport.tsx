import { useState } from "react";
import BarChartComponent from "../../components/bar-chart/BarChartComponent";
import TimelineSelector from "../../components/timeline-selector/TimelineSelector";
import BarChartCourseReport from "../../components/bar-chart/BarChartCourseReport";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { MdFilterAltOff } from "react-icons/md";

interface typesOption {
    label: string;
    value: string;
}


const CourseChartReport = () => {
    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
    const [selectedType, setSelectedType] = useState<string>("course");
    const typesOptions = [
        { label: "Môn học", value: "course" },
        { label: "Lớp học", value: "class" },
    ];


    return (
        <div className="bg-[#F3F7F5] rounded-[16px] p-5">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl">Tỉ lệ điểm danh</h1>
                <div className="flex items-center gap-5">
                    <div className="field w-[170px]">
                        <Calendar
                            id="startDate"
                            showIcon
                            value={selectedStartDate}
                            onChange={(e) => setSelectedStartDate(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            placeholder="Ngày bắt đầu"
                        />

                    </div>
                    <div className="field w-[170px]">
                        <Calendar
                            id="endDate"
                            showIcon
                            value={selectedEndDate}
                            onChange={(e) => setSelectedEndDate(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            placeholder="Ngày kết thúc"
                        />

                    </div>
                    <div className="field w-[120px]">

                        <Dropdown
                            id="type"
                            value={selectedType}
                            options={typesOptions}
                            optionLabel="label"
                            onChange={(e) => setSelectedType(e.value)}
                            // onChange={(e) =>console.log}
                            placeholder="Lọc theo"
                        />
                    </div>

                    <div className="flex gap-5 pl-5">
                        <div
                            className="flex gap-1 p-2 rounded-[6px] items-center justify-between  bg-[#ffdf20] cursor-pointer hover:bg-[#f0b100]"

                            onClick={() => {
                                console.log('selectedType', selectedType)
                                setSelectedStartDate(null);
                                setSelectedEndDate(null);
                                setSelectedType("course");
                            }}
                        >
                            <p className="text-base font-normal">Xóa lọc</p>
                            <MdFilterAltOff size={18} />

                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-y-5">
                <BarChartCourseReport
                    title="Tỉ lệ đi học giữa các khóa học"
                    hasIsolation={true}
                    selectedStartDate={selectedStartDate}
                    selectedEndDate={selectedEndDate}
                    selectedType={selectedType}
                />
            </div>

        </div>
    );
};

export default CourseChartReport;
