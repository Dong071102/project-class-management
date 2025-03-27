import { GrNext, GrPrevious } from "react-icons/gr";

interface ButtonProps {
  text?: string;
  borderColor?: string; 
  iconColor?: string; 
  iconType?: "back" | "next" | "both";
  onClick?: () => void;
}

const ButtonNext: React.FC<ButtonProps> = ({
  text,
  borderColor = "white",
  iconColor = "white",
  iconType = "next",
  onClick,
}) => {
  return (
    <div className="flex items-center gap-2">
    {(iconType === "back" || iconType === "both") && (
      <button
        onClick={onClick}
        className="cursor-pointer flex items-center justify-center rounded-[5px] px-4 py-2 bg-transparent"
        style={{ border: `1px solid ${borderColor}` }}
      >
        <GrPrevious className="w-5 h-5" style={{ color: iconColor }} />
      </button>
    )}
    {text && <span style={{ color: iconColor }}>{text}</span>}
    {(iconType === "next" || iconType === "both") && (
      <button
        onClick={onClick}  
        className="cursor-pointer flex items-center justify-center rounded-[5px] px-4 py-2 bg-transparent"
        style={{ border: `1px solid ${borderColor}` }}
      >
        <GrNext className="w-5 h-5" style={{ color: iconColor }} />
      </button>
    )}
  </div>
  );
};

export default ButtonNext;
