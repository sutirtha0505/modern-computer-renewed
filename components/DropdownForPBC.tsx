// components/Dropdown.tsx
"use client";
import { ChevronDown, X, Check, MinusCircle } from "lucide-react";
import { useState, useEffect } from "react";

type DropdownOption = {
  product_category: string;
};

type DropdownProps = {
  options: DropdownOption[];
  onSelect: (options: DropdownOption[]) => void;
  multiple?: boolean;
  reset?: boolean;
};

const DropdownForPBC = ({ options, onSelect, multiple = true, reset }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<DropdownOption[]>([]);

  useEffect(() => {
    if (reset) {
      setSelectedOptions([]);
    }
  }, [reset]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (option: DropdownOption) => {
    let newSelectedOptions;
    if (multiple) {
      const isSelected = selectedOptions.find(
        (selected) => selected.product_category === option.product_category
      );
      if (isSelected) {
        newSelectedOptions = selectedOptions.filter(
          (selected) => selected.product_category !== option.product_category
        );
      } else {
        newSelectedOptions = [...selectedOptions, option];
      }
    } else {
      newSelectedOptions = [option];
      setIsOpen(false);
    }
    setSelectedOptions(newSelectedOptions);
    onSelect(newSelectedOptions);
  };

  return (
    <div className="w-full bg-transparent border-2 flex justify-center rounded-md flex-col relative">
      <div className="p-2" onClick={toggleDropdown}>
        {selectedOptions.length > 0 ? (
          <div>
            {selectedOptions.map((option, index) => (
              <div key={index} className="flex items-center justify-between cursor-pointer">
                <p>{option.product_category}</p>
                {multiple && (
                  <X
                    className="cursor-pointer text-gray-500 hover:text-red-500"
                    onClick={() => handleOptionClick(option)}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-center">Select an option</p>
            <ChevronDown className="bg-indigo-400 rounded-md border border-indigo-400 hover:bg-transparent hover:text-indigo-400 cursor-pointer" />
          </div>
        )}
      </div>
      {isOpen && (
        <div className="absolute mt-60 w-full bg-white/50 custom-backdrop-filter z-[2] h-48 overflow-y-scroll">
          {multiple && (
            <div className="flex items-center justify-between">
              <div
                className="border-t-1 cursor-pointer hover:bg-white/50 hover:text-indigo-400 p-2 flex text-center z-[2] justify-center items-center hover:font-bold bg-white/30 text-indigo-400 font-bold"
                onClick={() => setSelectedOptions(options)}
              >
                <Check className="text-green-500 mr-2" />
                <p>Select All</p>
              </div>
              <div
                className="border-t-1 cursor-pointer hover:bg-white/50 hover:text-indigo-400 p-2 flex text-center z-[2] justify-center items-center hover:font-bold bg-white/30 text-indigo-400 font-bold"
                onClick={() => setSelectedOptions([])}
              >
                <MinusCircle className="text-red-500 mr-2" />
                <p>Deselect All</p>
              </div>
            </div>
          )}
          {options.map((option, index) => (
            <div
              key={index}
              className={`border-t-1 cursor-pointer hover:bg-white/30 hover:text-indigo-400 p-2 flex text-center z-[2] justify-center items-center hover:font-bold ${
                selectedOptions.find(
                  (selected) => selected.product_category === option.product_category
                )
                  ? "bg-white/30 text-indigo-400 font-bold"
                  : ""
              }`}
              onClick={() => handleOptionClick(option)}
            >
              <div className="w-full text-center">{option.product_category}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownForPBC;
