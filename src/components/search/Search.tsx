import { FiChevronDown, FiSearch } from "react-icons/fi";

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
}

const Search: React.FC<SearchProps> = ({ value, onChange }) => (
  <div className="hidden md:flex items-center gap-2 text-xs rounded-full bg-white border border-[#E0E2E7] px-2 max-w-[340px]">
    <FiSearch className="text-[#278D45] w-5 h-5" />
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Tìm kiếm..."
      className="text-[#737791] font-normal text-sm w-[200px] p-2 bg-transparent outline-none"
    />
    <FiChevronDown className="text-[#737791] w-5 h-5" />
  </div>
);

export default Search;
