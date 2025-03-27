import React from 'react';
import Icon from '../../assets/IconHomePage/Icon.png';

interface AgricultureCardProps {
topic:string;
  title: string;
  description: string;
  img: string ;
  Icon?: React.ElementType; 
}

const AgricultureCard: React.FC<AgricultureCardProps> = ({ topic, title, description, img }) => {
  return (
    <div className="relative bg-white rounded-[30px] shadow-md w-[330px] p-4  min-h-[110px]  h-114 flex flex-col border border-[#404A3D1A]">
        <div className="flex justify-center mb-4">
            <img src={img} alt="icon" className="bg-[#EDDD5E] rounded-[30px] w-[100%] h-[100%] object-fit" />
        </div>
        <div className="flex items-center justify-start mb-2">
        <div className="w-[9px] h-[9px] bg-[#EDDD5E] rounded-full mr-2"></div>
            <p className="text-[#999999] uppercase text-[70%]">{topic}</p>
        </div>
        <h2 className="text-[#404A3D] text-xl  text-left">{title}</h2>
        <hr className="w-full border-t border-[#404A3D1A] my-2" />
        <p className="text-[#666666] text-opacity-80 text-left">
        {description}
        </p>

        <div className=" self-end tagAgri p-1.5 mr-3">
          <button
            className=" cursor-pointer bg-[#EDDD5E] rounded-full p-6 shrink-0 flex items-center justify-center"
          >
            <img src={Icon} className="w-4 h-4 " />
          </button>
        </div>
        <div className="curve_oneAgri"></div>
        <div className="curve_twoAgri"></div>
    </div>
  
  );
};

export default AgricultureCard;
