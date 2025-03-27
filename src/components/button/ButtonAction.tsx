import React from "react";

type ButtonProps = {
  icon?: React.ReactNode;
  text: string;
  bgColor?: string;
  textColor?: string;
};

const Button: React.FC<ButtonProps> = ({ icon, text, bgColor = "#76bc6a", textColor = "#ffffff" }) => {
  return (
    <button 
      className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {icon}
      {text}
    </button>
  );
};

export default Button;
