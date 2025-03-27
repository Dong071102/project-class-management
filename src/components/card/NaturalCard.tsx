import React from 'react';
import Icon from "../../assets/IconHomePage/Icon.png";
import "./style.css";

interface NaturalCardProps {
  title: string;
  description: string;
  img: string ;
}

const NaturalCard: React.FC<NaturalCardProps> = ({ title, description, img }) => {
  return (
    <div className="relative bg-white rounded-2xl p-4 w-[330px] min-h-[230px]   flex flex-col  border border-[#404A3D1A]"> 
      <div  className="flex  items-center mt-2 ">
        <div className="bg-[#EDDD5E] rounded-full w-16 h-16 flex items-center justify-center mr-2">
         <img src={img} alt="icon" className="w-10 h-10" />
        </div>
        <h2 className="text-[#404A3D] text-xl font-bold text-center">{title}</h2>
      </div>
      
      <hr className="w-full border-t border-[#404A3D1A] my-2" />
      <p className="text-[#404A3D] text-opacity-80  text-left mr-5">
        {description}
      </p>
      <div className=" self-end tag p-2">
        <button
          className=" cursor-pointer rounded-full p-6  bg-white  shrink-0 flex items-center justify-center"
        >
          <img src={Icon} className="w-4 h-4 " />
        </button>
        
      </div>
      <div className=" curve_one"></div>
      <div className=" curve_two"></div>
    </div>
  );
};

export default NaturalCard;
