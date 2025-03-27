import React, { useEffect, useState } from "react";
import AbnormalDetectionCard from "../card/AbnormalDetectionCard";
import BarnSelector, { Barn } from "../classSelector/ClassSelector";
import { MdOutlinePets } from "react-icons/md";
type CameraStatusProps = {
  totalAnimals: number;
  noChangeMessage: string;
  detections: number;
  abnormalDetections: any[];
  personDetected: boolean;
};

const CameraStatus: React.FC<CameraStatusProps> = ({
  totalAnimals,
  noChangeMessage,
  detections,
  abnormalDetections,
  personDetected,
}) => {
  const handleSelectBarn = (id: string) => {
    console.log("Selected Barn ID:", id);
  };
  const [barns, setBarns] = useState<Barn[]>([]);
  useEffect(() => {
    const fetchBarns = async () => {
      try {
        const response = await fetch("https://agriculture-traceability.vercel.app/api/v1/rooms");
        const data = await response.json();
        setBarns(data.rooms);
      } catch (error) {
        console.error("Error fetching:", error);
      }
    };
    fetchBarns();
  }, []);
  return (
    <div className="grid grid-cols-1 gap-2 md:col-span-1 text-left">
      <BarnSelector
        barns={barns}
        onSelect={handleSelectBarn}
        icon={<MdOutlinePets className="w-5 h-5" />}
        rounded={true}
        widthFull={false}
        placeholder="Chọn chuồng"
        iconColor="text-white"
        iconBgColor="bg-yellow-500"
      />
      <span className="text-black font-semibold">Tổng số lượng: {totalAnimals}</span>
      <span className="text-black">{noChangeMessage}</span>
      <span className="text-black">Đã phát hiện {detections} lần ra vào</span>

      {personDetected && (
        <>
          <div className="text-red-500 font-semibold">🚨 Người đã được phát hiện!</div>
        </>
      )}
      {abnormalDetections.length > 0 && (
        <div className=" max-h-[400px] overflow-y-auto space-y-2">
          {abnormalDetections.map((alert, index) => (
            <AbnormalDetectionCard key={index} {...alert} />
          ))}
        </div>
      )}


    </div>
  );
};

export default CameraStatus;
