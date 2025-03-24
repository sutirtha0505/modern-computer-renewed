import {
    Badge,
    BadgeCheck,
    ChevronDown,
    X,
    Check,
    MinusCircle,
  } from "lucide-react";
import Image from "next/image";
  import { useState, useEffect } from "react";
  
  type DropdownOption = {
    id: string;
    name: string;
    price: string;
    image: string;
  };
  
  type DropdownProps = {
    options: DropdownOption[];
    onSelect: (selected: DropdownOption[]) => void;
    multiple?: boolean;
    defaultValue?: DropdownOption[];
    disabled?: boolean;
  };
  
  const DropdownForCPCEdit: React.FC<DropdownProps> = ({
    options,
    onSelect,
    multiple = true,
    defaultValue = [],
    disabled = false,
  }) => {
    const [selectedOptions, setSelectedOptions] = useState<DropdownOption[]>(
      () => {
        const storedOptions = localStorage.getItem("selectedOptions");
        return storedOptions ? JSON.parse(storedOptions) : defaultValue;
      }
    );
    const [isOpen, setIsOpen] = useState(false);
  
    useEffect(() => {
      localStorage.setItem("selectedOptions", JSON.stringify(selectedOptions));
    }, [selectedOptions]);
  
    useEffect(() => {
      setSelectedOptions(defaultValue);
    }, [defaultValue]);
  
    const toggleDropdown = () => !disabled && setIsOpen(!isOpen);
  
    const handleOptionClick = (option: DropdownOption) => {
      if (disabled) return;
  
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
  
    const truncateName = (name: string) => {
      const words = name.split(" ");
      if (words.length > 5) {
        return words.slice(0, 5).join(" ") + "...";
      }
      return name;
    };
  
    const handleDeselectOption = (option: DropdownOption) => {
      if (disabled) return;
  
      const updatedOptions = selectedOptions.filter(
        (selected) => selected.name !== option.name
      );
      setSelectedOptions(updatedOptions);
      onSelect(updatedOptions);
    };
  
    const handleSelectAll = () => {
      if (disabled) return;
  
      setSelectedOptions(options);
      onSelect(options);
    };
  
    const handleDeselectAll = () => {
      if (disabled) return;
  
      setSelectedOptions([]);
      onSelect([]);
    };
  
    const filteredOptions = options.filter(
      (option) => !selectedOptions.find((selected) => selected.id === option.id)
    );
  
    return (
      <div
        className={`w-[60%] bg-transparent border-2 flex justify-center rounded-md flex-col ${
          disabled ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <div
          className="p-2 cursor-pointer"
          onClick={toggleDropdown}
          style={{ cursor: disabled ? "not-allowed" : "pointer" }}
        >
          {selectedOptions.length > 0 ? (
            <div>
              {selectedOptions.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center">
                    <Image
                      src={option.image}
                      alt={option.name}
                      className="w-8 h-8 mr-2"
                      width={200}
                      height={200}
                    />{" "}
                    <p>{truncateName(option.name)}</p>
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
            <div className="flex justify-between">
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
                  className={`border-t-1 cursor-pointer hover:bg-white/50 hover:text-indigo-400 p-2 flex text-center z-[2] justify-center items-center hover:font-bold bg-white/30 text-indigo-400 font-bold ${
                    disabled ? "opacity-50 pointer-events-none" : ""
                  }`}
                  onClick={handleSelectAll}
                >
                  <Check className="text-green-500 mr-2" />
                  <p>Select All</p>
                </div>
                <div
                  className={`border-t-1 cursor-pointer hover:bg-white/50 hover:text-indigo-400 p-2 flex text-center z-[2] justify-center items-center hover:font-bold bg-white/30 text-indigo-400 font-bold ${
                    disabled ? "opacity-50 pointer-events-none" : ""
                  }`}
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
                  selectedOptions.find((selected) => selected.id === option.id)
                    ? "bg-white/30 text-indigo-400 font-bold"
                    : ""
                } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
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
                    <Image src={option.image} alt={option.name} />{" "}
                  </div>
                  <div className="flex flex-col w-[60%]">
                    <p className="text-sm">{option.name}</p>
                    <p className="text-sm">{option.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  export default DropdownForCPCEdit;
  