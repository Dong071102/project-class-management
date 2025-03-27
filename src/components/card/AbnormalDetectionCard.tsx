import React from "react";

interface AbnormalDetectionCardProps {
  imageUrl: string;
  title: string;
  timestamp: string;
  description: string;
  link: string;
}

const AbnormalDetectionCard: React.FC<AbnormalDetectionCardProps> = ({ imageUrl, title, timestamp, description, link }) => {
  return (
    <div className="flex border-1 border text-[#F44336] rounded-xl p-3 items-center bg-[#FFEBEE] shadow-md w-full">
      <img src={imageUrl} alt="Alert" className="w-24 h-24 rounded-lg object-cover" />
      <div className="ml-3 flex flex-col text-left">
        <h3 className="text-[#F44336] font-bold text-sm">{title}</h3>
        <p className="text-[#F44336] text-xs">{timestamp}</p>
        <p className="text-[#F44336] text-sm line-clamp-2">{description}</p>
        <a href={link} className="text-[#F44336] text-sm font-medium mt-1 underline">
          Xem thêm
        </a>
      </div>
    </div>
  );
};

export default AbnormalDetectionCard;
