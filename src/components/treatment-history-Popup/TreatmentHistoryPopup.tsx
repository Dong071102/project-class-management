import { useState } from "react";
import InputField from "../input-field/InputField";
import { Button } from "primereact/button";
import { FaCircle } from "react-icons/fa";

interface TreatmentHistoryProps {
  id: string;
  diseaseType: string;
  history: { date: string; content: string }[];
  onClose: () => void;
}
interface TreatmentHistory {
  task: string;
  medicine: string;
  note: string;
}
const TreatmentHistoryPopup: React.FC<TreatmentHistoryProps> = ({ id, diseaseType, history, onClose }) => {
  const [task, setTask] = useState("");
  const [medicine, setMedicine] = useState("");
  const [note, setNote] = useState("");
  const [historyData, setHistoryData] = useState(history);

  const handleSave = () => {
    if (!note.trim()) return; 

    const newRecord = { date: new Date().toISOString(), content: note };
    setHistoryData([...historyData, newRecord]); 
    setTask("");
    setMedicine("");
    setNote("");
  };
  const handleChange = (field: keyof TreatmentHistory, value: string | number) => {
    if (field === "task") setTask(value as string);
    if (field === "medicine") setMedicine(value as string);
    if (field === "note") setNote(value as string);
  };
  
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#b8b8b88a]">
      <div className="bg-[#F3F0EB] z-10 p-6 rounded-lg shadow-lg w-2/3 relative max-h-[90vh] max-w-[116vh] overflow-y-auto">
        <button className="absolute top-4 right-4 text-xl font-bold text-black" onClick={onClose}>
          ✖
        </button>
        <h2 className="text-xl font-bold mb-4">Lịch sử điều trị</h2>
        <p>ID: <span className="font-semibold">{id}</span> | Loại bệnh: <span className="font-semibold">{diseaseType}</span></p>

        <div className="grid grid-cols-2 gap-4 mt-4 text-left">
          <InputField  label="Công việc"  type="text"    value={task} onChange={(val) => handleChange("task", val)} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Loại bệnh</label>
            <input type="text" value={diseaseType} disabled className="w-full p-2 border border-[#D4D4D4] rounded-[6px] " />
          </div>
          <InputField   label="Thuốc sử dụng"  type="text" value={medicine}  onChange={(val) => handleChange("medicine", val)} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Người phụ trách</label>
            <input type="text" value="Chuyên gia A" disabled className="w-full p-2 border border-[#D4D4D4] rounded-[6px] " />
          </div>
          <div className="col-span-2 gap-1">
            <label className="text-sm font-medium">Ghi chú</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full border border-[#D4D4D4] rounded-[6px] p-2 text-[#242731] resize-none focus:outline-none focus:border-[#F8C32C] h-[110px]"/>
          </div>
        </div>

        <div className="flex justify-end gap-4 my-6">
          <Button label="Thoát" outlined onClick={onClose} rounded />
          <Button label="Lưu Thay Đổi"  onClick={handleSave} rounded />
        </div>
        <div className="mt-2 space-y-4 text-left">
          {historyData.length > 0 ? (
            historyData.map((item, index) => (

            <div key={index} className="p-3 border border-[#A1A3AB] rounded-[14px] bg-transparent">
              <div className="flex items-center gap-2">
                <FaCircle className="text-green-500 flex-shrink-0" size={12} />
                <p className="font-semibold">Tạo vào: {new Date(item.date).toLocaleDateString()}</p>
              </div>
              <div className="ml-5">
                <p className="text-[#747474] mb-2">{item.content}</p>
                <p className="font-thin"><span >Loại bệnh:</span> ABC</p>
                <p className="font-thin"><span >Thuốc sử dụng:</span> DEF</p>
                <p className="font-thin"><span >Người phụ trách:</span> <span className="text-blue-600">Chuyên gia AA</span></p>
              </div>
            </div>

            ))
          ) : (
            <p className="text-gray-500">Chưa có lịch sử điều trị</p>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default TreatmentHistoryPopup;
