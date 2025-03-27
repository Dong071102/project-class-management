import { useState } from "react";

function QuantitySelector({ onChange }) {
  const [animal, setAnimal] = useState<"Gà" | "Vịt" | "Bò">("Gà");
  const [quantity, setQuantity] = useState(20001);
  const [from, setFrom] = useState("Tháng 1");
  const [to, setTo] = useState("Tháng 3");

  const animalQuantities: Record<"Gà" | "Vịt" | "Bò", number> = {
    Gà: 20001,
    Vịt: 15000,
    Bò: 5000,
  };

  const handleAnimalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedAnimal = e.target.value as "Gà" | "Vịt" | "Bò";
    setAnimal(selectedAnimal);
    setQuantity(animalQuantities[selectedAnimal]);
    handleUpdate(selectedAnimal, animalQuantities[selectedAnimal], from, to);
  };

  const handleUpdate = (
    updatedAnimal: "Gà" | "Vịt" | "Bò",
    updatedQuantity: number,
    updatedFrom: string,
    updatedTo: string
  ) => {
    onChange({
      animal: updatedAnimal || animal,
      quantity: updatedQuantity || quantity,
      from: updatedFrom || from,
      to: updatedTo || to,
    });
  };

  return (
    <div className="">

      {/* <div className="flex items-center space-x-2 mb-3">
              <select
                className="p-2 border rounded-full"
                value={animal}
                onChange={handleAnimalChange}
              >
                <option value="Gà">Gà</option>
                <option value="Vịt">Vịt</option>
                <option value="Bò">Bò</option>
              </select>
              <input
                type="number"
                className="p-2 w-20"
                value={quantity}
                onChange={(e) => {
                  setQuantity(Number(e.target.value));
                  handleUpdate(animal, Number(e.target.value), from, to);
                }}
              />
            </div> */}
      <div className="flex space-x-4 mt-16">
        <div className="flex flex-col flex-1">
          <label className="font-medium mb-1 text-left">From:</label>
          <select
            className="p-2 border rounded-full"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              handleUpdate(animal, quantity, e.target.value, to);
            } }
          >
            <option value="Tháng 1">Tháng 1</option>
            <option value="Tháng 2">Tháng 2</option>
            <option value="Tháng 3">Tháng 3</option>
          </select>
        </div>

        <div className="flex flex-col flex-1">
          <label className="font-medium mb-1 text-left">To:</label>
          <select
            className="p-2 border rounded-full"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              handleUpdate(animal, quantity, from, e.target.value);
            } }
          >
            <option value="Tháng 3">Tháng 3</option>
            <option value="Tháng 4">Tháng 4</option>
            <option value="Tháng 5">Tháng 5</option>
          </select>
        </div>
      </div>
      <p className="text-lg font-bold text-center mt-6">Số lượng</p>
      <p className="text-xl font-bold text-center mt-4">{quantity}</p>
    </div>
  );
}

export default QuantitySelector;
