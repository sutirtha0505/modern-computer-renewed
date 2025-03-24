"use client";
import { Badge, BadgeCheck, ChevronDown, X, Check, MinusCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; // Import the existing Supabase client
import Image from "next/image";

type DropdownOption = {
  product_main_category: string;
  category_product_image: string;
};

type DropdownProps = {
  onSelect: (options: DropdownOption[]) => void;
  multiple?: boolean;
  reset?: boolean;
};

const DropdownCategory: React.FC<DropdownProps> = ({ onSelect, multiple = true, reset }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedOptions, setSelectedOptions] = useState<DropdownOption[]>([]);
  const [options, setOptions] = useState<DropdownOption[]>([]); // State to store options from Supabase

  useEffect(() => {
    if (reset) {
      setSelectedOptions([]);
    }
  }, [reset]);

  // Fetch data from Supabase products table
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('product_main_category, category_product_image');

      if (error) {
        console.error('Error fetching data:', error);
      } else {
        console.log('Fetched Data:', data); // Log the fetched data
        // Filter out duplicate product_main_category
        const uniqueOptions = Array.from(
          new Map(
            (data || []).map(item => [item.product_main_category, item])
          ).values()
        );
        setOptions(uniqueOptions); // Set options with unique data
      }
    };

    fetchData();
  }, []); // Empty dependency array to fetch once when component mounts

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (option: DropdownOption) => {
    let newSelectedOptions;
    if (multiple) {
      const isSelected = selectedOptions.some(
        (selected) => selected.product_main_category === option.product_main_category
      );
      if (isSelected) {
        newSelectedOptions = selectedOptions.filter(
          (selected) => selected.product_main_category !== option.product_main_category
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

  const truncateName = (name: string) => {
    const words = name.split(' ');
    return words.length > 5 ? words.slice(0, 5).join(' ') + '...' : name;
  };

  const handleDeselectOption = (option: DropdownOption) => {
    const updatedOptions = selectedOptions.filter(
      (selected) => selected.product_main_category !== option.product_main_category
    );
    setSelectedOptions(updatedOptions);
    onSelect(updatedOptions);
  };

  const handleSelectAll = () => {
    setSelectedOptions(options);
    onSelect(options);
  };

  const handleDeselectAll = () => {
    setSelectedOptions([]);
    onSelect([]);
  };

  const filteredOptions = options.filter(
    (option) => !selectedOptions.some((selected) => selected.product_main_category === option.product_main_category)
  );

  return (
    <div className=" w-[70%] bg-transparent border-2 flex justify-center rounded-md flex-col">
      <div className="p-2" onClick={toggleDropdown}>
        {selectedOptions.length > 0 ? (
          <div>
            {selectedOptions.map((option) => (
              <div key={option.product_main_category} className="flex items-center justify-between cursor-pointer">
                <div className="flex flex-wrap justify-center items-center">
                  <Image
                    src={option.category_product_image}
                    alt={option.product_main_category}
                    className="w-8 h-8 mr-2"
                    width={200}
                    height={200}
                  />{" "}
                  <p>{truncateName(option.product_main_category)}</p>
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
            <p className="text-center text-xs">Select categories</p>
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
                <p className="text-xs">Select All</p>
              </div>
              <div
                className="border-t-1 cursor-pointer hover:bg-white/50 hover:text-indigo-400 p-2 flex text-center z-[2] justify-center items-center hover:font-bold bg-white/30 text-indigo-400 font-bold"
                onClick={handleDeselectAll}
              >
                <MinusCircle className="text-red-500 mr-2" />
                <p className="text-xs">Deselect All</p>
              </div>
            </div>
          )}
          {filteredOptions.map((option) => (
            <div
              key={option.product_main_category}
              className={`border-t-1 cursor-pointer hover:bg-white/30 hover:text-indigo-400 p-2 flex text-center z-[2] justify-center items-center hover:font-bold ${
                selectedOptions.some(
                  (selected) => selected.product_main_category === option.product_main_category
                )
                  ? "bg-white/30 text-indigo-400 font-bold"
                  : ""
              }`}
              onClick={() => handleOptionClick(option)}
            >
              <div className="flex items-center">
                <div className="w-[10%]">
                  {selectedOptions.some(
                    (selected) => selected.product_main_category === option.product_main_category
                  ) ? (
                    <BadgeCheck className="text-green-500" />
                  ) : (
                    <Badge className="text-gray-400" />
                  )}
                </div>
                <div className="w-[30%] flex justify-center items-center">
                  <Image
                    src={option.category_product_image}
                    alt={option.product_main_category}
                    className="w-8 h-8 mr-2"
                    width={200}
                    height={200}
                  />{" "}
                </div>
                <div className="flex flex-col w-[60%]">
                  <p className="text-sm">{option.product_main_category}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownCategory;
