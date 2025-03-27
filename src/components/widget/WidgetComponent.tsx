import { ReactNode } from "react";

interface WidgetProps {
  icon: ReactNode;
  title: string;
  quantity: number;
  description: string;
  bgColor: string;
}

const WidgetComponent = ({ icon, title, quantity, description, bgColor }: WidgetProps) => {
    return (
      <div style={{ backgroundColor: bgColor }}className={`p-4 rounded-2xl shadow-md text-white text-left`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="w-12 h-12 flex items-center justify-center  bg-[rgba(245,245,245,0.6)] rounded-full">
            <div className="text-2xl">{icon}</div>
          </div>
        </div>
        <p className="text-2xl font-bold mt-2">{quantity}</p>
        <p className="text-sm text-[#d6d6d6]">{description}</p>
      </div>
    );
  };

export default WidgetComponent;
