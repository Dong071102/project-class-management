import { useState } from "react";
import TimelineSelector from "../../components/timeline-selector/TimelineSelector";
import LineChartComponent from "../../components/line-chart/LineChartComponent";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import InputField from "../../components/input-field/InputField";

interface DiseaseCase {
  id: string;
  name: string;
  importedQuantity: number;
  destroyedQuantity: number;
  note: string;
}

const initialData: DiseaseCase[] = [
  { id: "1", name: "Bệnh a", importedQuantity: 123, destroyedQuantity: 3, note: "Cảm ơn 123" },
  { id: "2", name: "Bệnh b", importedQuantity: 123, destroyedQuantity: 3, note: "" },
  { id: "3", name: "Bệnh c", importedQuantity: 123, destroyedQuantity: 3, note: "" },
];

const EpidemicReport = () => {
  const [filterType, setFilterType] = useState<"year" | "month" | "week">("year");
  const [selectedAnimal, setSelectedAnimal] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [cases, setCases] = useState<DiseaseCase[]>(initialData);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const handleChange = (id: string, field: keyof DiseaseCase, value: string | number) => {
    setCases((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === "note"
                ? value
                : typeof value === "string" && value.trim() === ""
                ? 0
                : Number(value),
            }
          : item
      )
    );
  };
  

  const handleSave = (id: string) => {
    console.log("Dữ liệu đã lưu:", cases.find((c) => c.id === id));
    setEditingNoteId(null);
  };

  return (
    <div className="bg-[#F3F7F5] rounded-[16px] p-5">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl">Thống kê dịch bệnh</h1>
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
        <LineChartComponent title="Biểu đồ số lượng bệnh" chartType="disease" filterType={filterType} />
      </div>

      <div className="bg-[#FFFFF1] mt-4 p-4 rounded-[20px]">
        <h2 className="text-lg text-left font-semibold mb-4">Số ca chữa khỏi, tái phát</h2>
        <div className="space-y-4">
          {cases.map((disease) => (
            <div key={disease.id} className="px-4 p-4 rounded-lg border border-[#A1A3AB]">
              <div className="flex items-center mb-3">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <h3 className="font-semibold">{disease.name}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-3 md:col-span-1 text-left">
                  <InputField
                    label="Số lượng nhập đàn"
                    value={disease.importedQuantity}
                    onChange={(val) => handleChange(disease.id, "importedQuantity", val)}
                    type="number" 
                  />
                  <InputField
                    label="Số lượng tiêu hủy"
                    value={disease.destroyedQuantity}
                    onChange={(val) => handleChange(disease.id, "destroyedQuantity", val)}
                    type="number" 
                  />
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label className="text-[#242731] text-sm font-medium mb-1 text-left">Nhận xét</label>
                  <div className="relative">
                    {editingNoteId === disease.id ? (
                      <textarea
                        value={disease.note}
                        onChange={(e) => handleChange(disease.id, "note", e.target.value)}
                        className="w-full border border-gray-200 rounded-[6px] p-2 text-[#242731] resize-none focus:outline-none focus:border-[#F8C32C]  h-[110px]"
                        rows={4}

                  />
                    ) : (
                      <div
                        className="w-full border border-gray-300 rounded-[6px] p-2 text-[#242731] bg-[hsl(37, 29.90%, 84.90%)] cursor-pointer h-[110px] flex items-center"
                        onClick={() => setEditingNoteId(disease.id)}
                      >
                        {disease.note || "Bấm vào để chỉnh sửa"}
                      </div>
                    )}

                    <div className="absolute top-2 right-2 flex gap-2">
                      <FiEdit
                        className="text-[#FCBD2D] cursor-pointer hover:text-amber-500"
                        size={18}
                        onClick={() => setEditingNoteId(disease.id)}
                      />
                      <FiTrash2 className="text-[#F14871] cursor-pointer hover:text-red-500" size={18} />
                    </div>
                  </div>
                  {editingNoteId === disease.id && (
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => handleSave(disease.id)}
                        className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition"
                      >
                        Lưu Thay Đổi
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EpidemicReport;
