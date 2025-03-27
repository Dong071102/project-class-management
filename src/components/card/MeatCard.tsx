import React from 'react';

interface NaturalCardProps {
  title: string;
  description: string;
  img: string ;
}

const MeatCard: React.FC<NaturalCardProps> = ({ title, description, img }) => {
  return (
    <div className="rounded-2xl p-4 w-[70%] h-auto flex flex-col">
      <div className="flex items-center gap-3">
          <div className="bg-[#A31717] rounded-full w-16 h-16 flex items-center justify-center shrink-0">
              <img src={img} alt="icon" className="w-10 h-10 " />
          </div>
          <div className="flex flex-col text-left">
              <h2 className="text-[#404A3D] text-xl font-bold ">{title}</h2>
              <p className="text-[#666666] text-opacity-80">{description}</p>
          </div>
      </div>
    </div>

  );
};

export default MeatCard;
