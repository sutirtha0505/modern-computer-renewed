"use client";
import { PlusCircle, X } from "lucide-react";
import React, { useState } from "react";
import CategorySection from "./CategorySection";
import CategoryListed from "./CategoryListed";
const ProductByCategoryAdmin = () => {
  const [boxes, setBoxes] = useState<number[]>([]);

  const addBox = () => {
    setBoxes([...boxes, boxes.length + 1]);
  };

  const removeBox = (index: number) => {
    setBoxes(boxes.filter((_, i) => i !== index));
  };
  return (
    <div className="flex flex-col gap-6 w-full justify-center h-full items-center">
      <div className="p-2 justify-center items-center w-56 h-56 rounded-md border border-gray-300 flex flex-col">
        <PlusCircle
          className="w-12 h-12 text-center text-indigo-500 cursor-pointer"
          onClick={addBox}
        />
        <h1 className="text-xs font-extrabold text-wrap bg-gradient-to-br from-pink-500 to-orange-400 text-center text-transparent bg-clip-text">
          Click Here for enlisting new Category
        </h1>
      </div>
      <div className="flex justify-center gap-4 items-center flex-wrap bg-red-300">
        {boxes.map((box, index) => (
          <div
            key={box}
            className="relative bg-blue-400 custom-backdrop-filter rounded-md m-2 p-4 border border-gray-300 flex flex-col"
          >
            <X
              className="w-4 h-4 text-red-600 bg-transparent hover:text-white hover:bg-red-600 absolute top-2 right-2 cursor-pointer"
              onClick={() => removeBox(index)}
            />
            <CategorySection />
          </div>
        ))}
      </div>
      <CategoryListed />
    </div>
  );
};

export default ProductByCategoryAdmin;
