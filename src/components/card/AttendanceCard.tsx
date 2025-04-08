import React from "react";
import fallbackImage from "../../assets/no-attendance-image.png"; // ảnh fallback mặc định

export interface AttendanceCard {
  attendanceID: string,
  scheduleID: string,
  studentID: string,
  studentCode: string,
  studentName: string,
  attendanceTime: string | null,
  attendanceStatus: string,
  note: string,
  imageURL: string,
}

const AttendanceCard: React.FC<AttendanceCard> = ({
  attendanceID, scheduleID, studentID, studentCode, studentName,
  attendanceTime, attendanceStatus, note, imageURL
}) => {
  if (note !== null && note !== '') {
    note = 'Lý do: ' + note;
  }
  const imageSrc = imageURL && imageURL.trim() !== "" ? imageURL : fallbackImage;

  const getBackgroundColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "late":
        return "bg-yellow-100";
      case "absent":
        return "bg-red-100";
      case "present":
        return "bg-green-100";
      default:
        return "bg-gray-100";
    }
  };

  const translateStatus = (status: string): string => {
    switch (status.toLowerCase()) {
      case "late":
        return "Đi trễ";
      case "absent":
        return "Vắng mặt";
      case "present":
        return "Có mặt";
      default:
        return "Không xác định";
    }
  };

  return (
    <div className={`flex border text-[#3d6649] rounded-xl p-3 items-center shadow-md w-full ${getBackgroundColor(attendanceStatus)}`}>
      <img src={imageSrc} alt="Alert" className="w-24 h-32 rounded-lg object-cover" />
      <div className="ml-3 flex flex-col text-left">
        <h3 className="text-[#3d6649] font-bold text-sm">Họ tên: {studentName}</h3>
        <h3 className="text-[#3d6649] font-bold text-sm">MSSV: {studentCode}</h3>
        <p className="text-black text-xs">Trạng thái: {translateStatus(attendanceStatus)}</p>
        <p className="text-black text-xs">{attendanceTime}</p>
        <p className="text-black text-xs">{note}</p>
      </div>
    </div>
  );
};

export default AttendanceCard;
