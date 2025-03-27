import { TiHome } from "react-icons/ti";

type BreadcrumbProps = {
  items: { name: string; url: string }[];
  onNavigate: (url: string) => void;
};

const Breadcrumb_Comp: React.FC<BreadcrumbProps> = ({ items, onNavigate }) => {
  return (
    <nav className="flex text-[#B8B7B7] text-sm mt-[26px] mb-[8px]">
      <button onClick={() => onNavigate("/")} className="flex items-center gap-1">
        <TiHome className="text-lg text-[#B8B7B7] w-6 h-6" />
      </button>
      {items.map((item) => (
        <div key={item.url} className="flex text-black mt-[8px] text-semibold">
          <span className="mx-2 ">/</span>
          <button
            onClick={() => onNavigate(item.url)}
            className=""
          >
            {item.name}
          </button>
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb_Comp;
