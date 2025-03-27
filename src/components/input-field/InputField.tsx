
interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  textColor?: string;
  borderColor?: string;
  labelColor?: string;
  type?: "text" | "number";
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  textColor = "#242731",
  borderColor = "#DFDFDF",
  labelColor = "#242731",
  type = "text",
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === "number" ? Number(e.target.value) : e.target.value;
    onChange(newValue);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium" style={{ color: labelColor }}>
        {label}
      </label>
      <input
        type={type}
        value={type === "number" ? value.toString() : value}
        onChange={handleChange}                 className="w-full border rounded-[6px]  p-2 focus:outline-none focus:ring-[1px] focus:ring-[#F8C32C]"
        style={{ color: textColor, borderColor }}
      />
    </div>
  );
};

export default InputField;
