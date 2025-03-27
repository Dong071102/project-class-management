import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useClassContext } from "../../contexts/classContext";

const ClassSelector: React.FC = () => {
  const { classes, selectedClass, setSelectedClass } = useClassContext();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleSelect = (id: string) => {
    const foundClass = classes.find((oclass) => oclass.class_id === id) || null;
    setSelectedClass(foundClass);
    setIsOpen(false);
  };

  return (
    <div className="relative w-[300px]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 p-2 border bg-[#76bc6a] text-white text-left flex items-center justify-between rounded-[12px] w-full"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center shrink-0 bg-yellow-500 text-white rounded-full">
            {/* Bạn có thể thêm icon nếu cần */}
          </div>
          {selectedClass ? (
            `${selectedClass.class_name} - ${selectedClass.course_name}`
          ) : (
            "Tất cả"
          )}
        </div>
        <FiChevronDown className="w-5 h-5" />
      </button>
      {
        isOpen && (
          <ul className="absolute w-full mt-1 bg-[#262626] border rounded-[16px] p-1.5 text-white top-12 left-0 z-50">
            {classes.map((oclass) => (
              <li
                key={oclass.class_id}
                className="p-2 hover:border-b hover:border-white cursor-pointer"
                onClick={() => handleSelect(oclass.class_id)}
              >
                {oclass.class_name} - {oclass.course_name}
              </li>
            ))}
          </ul>
        )
      }
    </div >
  );
};

export default ClassSelector;
