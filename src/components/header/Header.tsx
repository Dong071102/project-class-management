import { useContext, useState, useEffect } from "react"
import AvataAdmin from "../../assets/avataAdmin.png"
import IconNo from "../../assets/IconNotification.png"
import { AuthContext } from "../../hooks/user"
import ClassSelector from "../classSelector/ClassSelector"

import { MdHomeWork } from "react-icons/md";
import { oneClass } from "../../contexts/classContext"
const Header = () => {
  const handleClassSelect = (id: string) => {
    console.log("Selected Farm ID:", id);
  };
  const [classes, setClasses] = useState<oneClass[]>([]);
  useEffect(() => {
    const fetchClass = async () => {
      try {
        const response = await fetch(`http://localhost:8000/classes/${currentUser?.userId}`);
        const data: oneClass[] = await response.json();
        console.log('data', data)
        setClasses(data);
      } catch (error) {
        console.error("Error fetching:", error);
      }
    };
    fetchClass();
  }, []);
  const { currentUser } = useContext(AuthContext);
  return (
    <div className="flex items-center justify-between">
      <ClassSelector />
      <div className="flex items-center gap-4 w-auto p-2 bg-[#76bc6a] rounded-full" >
        <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer relative">
          <img src={IconNo} alt="" width={18} height={18} />
          <div className="absolute -top-[0px] -right-[0px] w-2 h-2 bg-[#EB5757] rounded-full"></div>
        </div>
        <div className="flex items-center cursor-pointer gap-2 ">
          <img src={currentUser?.imageUrl === "" ? AvataAdmin : currentUser?.imageUrl} alt="" width={31} height={32} className="rounded-full" />
          <div className="flex flex-col text-left">
            <span className="text-[14px] leading-3  text-white">{currentUser?.firstName} {currentUser?.lastName}</span>
            <span className="text-[14px] text-[#CBCBCB]">{currentUser?.role}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Header