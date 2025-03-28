import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useClassContext } from "../../contexts/classContext";
import { MdHomeWork } from "react-icons/md";

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
          <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center shrink-0">
            <MdHomeWork className="text-[#76bc6a] w-5 h-5" />

          </div>
          <span className="truncate max-w-[240px]">

            {selectedClass ? (
              `${selectedClass.class_name} - ${selectedClass.course_name}`
            ) : (
              "Tất cả"
            )}
          </span>

        </div>
        <FiChevronDown className="w-5 h-5" />
      </button>
      {
        isOpen && (
          <ul
            id="dropdown"
            className="absolute w-full mt-1 bg-[#76bc6a] border rounded-[20px] p-1.5 text-white text-left"
          >
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
