// components/Dropdown.tsx
"use client";
import { Badge, BadgeCheck, ChevronDown, X, Check, MinusCircle } from "lucide-react"; // Import Check and MinusCircle from lucide-react for the select all and deselect all buttons
import Image from "next/image";
import { useState, useEffect } from "react";

type DropdownOption = {
  id: string;
  name: string;
  price: string;
  image: string; // Add the image property
  discount: number;
};

type DropdownProps = {
  options: DropdownOption[];
  onSelect: (options: DropdownOption[]) => void;
  multiple?: boolean; // Add multiple prop
  reset?: boolean; // Add reset prop
};

const Dropdown = ({ options, onSelect, multiple = true, reset }: DropdownProps) => {
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
        (selected) => selected.name === option.name
      );
      if (isSelected) {
        newSelectedOptions = selectedOptions.filter(
          (selected) => selected.name !== option.name
        );
      } else {
        newSelectedOptions = [...selectedOptions, option];
      }
    } else {
      newSelectedOptions = [option];
      setIsOpen(false); // Close dropdown after selecting an option in single mode
    }
    setSelectedOptions(newSelectedOptions);
    onSelect(newSelectedOptions);
  };

  // Function to truncate the name to the first 5 words
  const truncateName = (name: string) => {
    const words = name.split(' ');
    if (words.length > 10) {
      return words.slice(0, 10).join(' ') + '...';
    }
    return name;
  };

  // Function to handle deselecting an option
  const handleDeselectOption = (option: DropdownOption) => {
    const updatedOptions = selectedOptions.filter(
      (selected) => selected.name !== option.name
    );
    setSelectedOptions(updatedOptions);
    onSelect(updatedOptions);
  };

  // Function to handle selecting all options
  const handleSelectAll = () => {
    setSelectedOptions(options);
    onSelect(options);
  };

  // Function to handle deselecting all options
  const handleDeselectAll = () => {
    setSelectedOptions([]);
    onSelect([]);
  };

  const filteredOptions = options.filter(
    (option) => !selectedOptions.find((selected) => selected.id === option.id)
  );

  return (
    <div className="w-full bg-transparent border-2 flex justify-center rounded-md flex-col">
      <div className="p-2" onClick={toggleDropdown}>
        {selectedOptions.length > 0 ? (
          <div>
            {selectedOptions.map((option) => (
              <div key={option.id} className="flex items-center justify-between cursor-pointer">
                <div className="flex justify-center items-center">
                  <Image
                    src={option.image}
                    alt={option.name}
                    className="w-8 h-8 mr-2"
                    width={200}
                    height={200}
                  />{" "}
                  {/* Display selected image */}
                  <p>{truncateName(option.name)}</p> {/* Truncate name here */}
                </div>
                {multiple && (
                  <X
                    className="cursor-pointer text-gray-500 hover:text-red-500"
                    onClick={() => handleDeselectOption(option)}
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
        <div className="bg-white/50 custom-backdrop-filter">
          {multiple && (
            <div className="flex items-center justify-between">
              <div
                className="border-t-1 cursor-pointer hover:bg-white/50 hover:text-indigo-400 p-2 flex text-center z-[2] justify-center items-center hover:font-bold bg-white/30 text-indigo-400 font-bold"
                onClick={handleSelectAll}
              >
                <Check className="text-green-500 mr-2" />
                <p>Select All</p>
              </div>
              <div
                className="border-t-1 cursor-pointer hover:bg-white/50 hover:text-indigo-400 p-2 flex text-center z-[2] justify-center items-center hover:font-bold bg-white/30 text-indigo-400 font-bold"
                onClick={handleDeselectAll}
              >
                <MinusCircle className="text-red-500 mr-2" />
                <p>Deselect All</p>
              </div>
            </div>
          )}
          {filteredOptions.map((option) => (
            <div
              key={option.id}
              className={`border-t-1 cursor-pointer hover:bg-white/30 hover:text-indigo-400 p-2 flex text-center z-[2] justify-center items-center hover:font-bold ${
                selectedOptions.find(
                  (selected) => selected.id === option.id
                )
                  ? "bg-white/30 text-indigo-400 font-bold"
                  : ""
              }`}
              onClick={() => handleOptionClick(option)}
            >
              <div className="flex items-center">
                <div className="w-[10%]">
                  {selectedOptions.find(
                    (selected) => selected.id === option.id
                  ) ? (
                    <BadgeCheck className="text-green-500" />
                  ) : (
                    <Badge className=" text-gray-400" />
                  )}
                </div>
                <div className="w-[30%] flex justify-center items-center">
                  <Image
                    src={option.image}
                    alt={option.name}
                    width={200}
                    height={200}
                  />{" "}
                </div>
                {/* Display option image */}
                <div className="flex flex-col w-[60%]">
                  <p className="text-sm">{option.name}</p> {/* Truncate name here */}
                  <p className="text-sm">₹{option.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
