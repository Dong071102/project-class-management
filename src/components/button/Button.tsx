import { HiOutlineSearch } from "react-icons/hi";
import Icon from "../../assets/IconHomePage/Icon.png";
import "./style.css";

interface ButtonProps {
  text?: string;
  backgroundColor?: string;
  iconType?: "search" | "arrow";
  login?: boolean;
}

const Button: React.FC<ButtonProps> = ({ text, backgroundColor = "#EDDD5E", iconType,login }) => {
  const width =
    text && iconType === "arrow" ? "183.34px" : "48px"; 
  const height = "48px"; 
  const borderRadius = !text ? "50%" : "30px"; 
  return (
    <>{
      !login?(<button
        className="cursor-pointer  shrink-0 flex items-center justify-center gap-2 font-medium transition-all duration-300"
        style={{
          backgroundColor,
          color: "#404A3D",
          width,
          height,
          borderRadius,
        }}
      >
        {text && <span className="mr-2">{text}</span>}
        {iconType === "search" && <HiOutlineSearch className="w-5 h-5" />}
        {iconType === "arrow" && <img src={Icon} className="w-4 h-4" />}
      </button>)
      :(
        <>
          <div className="tagLogin">
            <button
            className="cursor-pointer bg-[#EDDD5E]  w-[150px] h-[54px] rounded-[30px] shrink-0 flex items-center justify-center gap-1.5 font-medium transition-all duration-300"
            >
              <span className="mr-1 text-semibold font-normal">Đăng Nhập</span><img src={Icon} className="w-4 h-4" />
            </button>
          </div>
          <div className=" curve_oneLogin"></div>
          <div className=" curve_twoLogin"></div>
        </>
        
      )
    }
    </>
  );
};

export default Button;
