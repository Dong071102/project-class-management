import AbnormalDetectionCard from "../../components/card/AttendanceCard";
import phvt from "../../assets/phvn.png";
import phbt1 from "../../assets/phbt1.png";
import BarnSelector, { Barn } from "../../components/classSelector/ClassSelector";

import CameraStream from "../../components/camera-stream/CameraStream";
import { FaPaw, FaCheck, FaTag } from "react-icons/fa";
import { MdHome, MdLinkedCamera } from "react-icons/md";
import WidgetComponent from "../../components/widget/WidgetComponent";
import QuantitySelector from "../../components/quantity-selector/QuantitySelector";
import NotificationCard from "../../components/card/NotificationCard";
import { useEffect, useState } from "react";
import ButtonAction from "../../components/button/ButtonAction";
const notifications = [
  {
    title: "Phát hiện người",
    description: "Phát hiện người tại khu vực HeoA101_01",
    date: "06.11.2024",
  },
  {
    title: "Phát hiện người",
    description: "Phát hiện người tại khu vực HeoA101_01",
    date: "06.11.2024",
  },
  {
    title: "Phát hiện người",
    description: "Phát hiện người tại khu vực HeoA101_01",
    date: "06.11.2024",
  },
];

const cameraIds = ["cam_1", "cam_2"]; // Add more camera IDs as needed

function AbnormalDetection() {
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
  const handleQuantityChange = (animal: string, quantity: number, from: string, to: string) => {
    console.log("Loại vật nuôi:", animal);
    console.log("Số lượng:", quantity);
    console.log("Từ tháng:", from, "đến tháng:", to);
  };
  return (
    <>
      {/* <div className="space-y-4 p-5">
        {notifications.map((noti, index) => (
          <NotificationCard key={index} {...noti} />
        ))}
      </div> */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 rounded-[20px] mb-5">
        <div className="bg-[#F3F7F5] rounded-[20px] p-5 mb-5 lg:col-span-2">
          <BarnSelector
            barns={barns}
            onSelect={handleSelectBarn}
            icon={<MdHome className="w-6 h-6" />}
            rounded={false}
            widthFull={false}
            placeholder="Chọn đàn"
            iconColor="text-white"
            iconBgColor="bg-yellow-500"
          />
          <div className="my-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <WidgetComponent icon={<FaPaw />} title="Tổng số vật nuôi" quantity={80040} description="Số lượng tổng vật nuôi tại chi nhánh" bgColor="#2196F3" />
            <WidgetComponent icon={<FaCheck />} title="Nhập vào" quantity={80040} description="Tổng số lượng vật nuôi được nhập tại chi nhánh" bgColor="#619959" />
            <WidgetComponent icon={<FaTag />} title="Bán ra" quantity={80040} description="Tổng số lượng vật nuôi được bán ra tại chi nhánh" bgColor="#FCBD2D" />
          </div>
        </div>
        <div className="lg:col-span-1 rounded-[20px] p-5 mb-5 bg-[#F3F7F5]">
          <QuantitySelector onChange={handleQuantityChange} />
        </div>
      </div>
      <div className="bg-[#F3F7F5] rounded-[20px] p-5">
        <div className="flex flex-wrap items-center gap-4 mb-5">
          <BarnSelector
            barns={barns}
            onSelect={handleSelectBarn}
            icon={<MdHome className="w-6 h-6" />}
            rounded={false}
            widthFull={false}
            placeholder="Đàn hep HA01"
            iconColor="text-white"
            iconBgColor="bg-yellow-500"
          />
          <ButtonAction icon={<MdLinkedCamera className="w-7 h-7" />}
            text="Xem lại sự kiện"
            bgColor="#76bc6a"
            textColor="#fff"
          />
        </div>
        <div className="">
          {cameraIds.map((camId) => (
            <div key={camId} className="relative mb-8 bg-white p-3 rounded-[8px] ">
              <CameraStream camId={camId} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default AbnormalDetection;
