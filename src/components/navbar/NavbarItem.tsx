import React from "react";

interface NavbarItemProps {
  name: string;
  Icon: React.ElementType; }

const NavbarItem: React.FC<NavbarItemProps> = ({ name, Icon }) => {
  return (
    <div
      className=" flex items-center gap-3 text-[14px] font-semibold cursor-pointer hover:underline underline-offset-8 hover:text-[#EDDD5E] mb-2"
    >
      <Icon className='text-[#EDDD5E]  w-[9px] h-[9px]' />
      <h2 className="text-white">{name}</h2>
    </div>
  );
};

export default NavbarItem;
