"use client";
import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dropdown from "@/components/Dropdown";
import { useRouter } from "next/navigation";
type DropdownOption = {
  id: string;
  name: string;
  price: string;
  image: string;
  discount: number;
};
type ProductImage = {
  url: string;
};

const CustomPCCombo = () => {
  const router = useRouter();
  const [buildType, setBuildType] = useState<string | null>(null);
  const [selectedProcessorOptions, setSelectedProcessorOptions] = useState<
    DropdownOption[]
  >([]);
  const [processorOptions, setProcessorOptions] = useState<DropdownOption[]>(
    []
  );
  const [selectedMotherboardOptions, setSelectedMotherboardOptions] = useState<
    DropdownOption[]
  >([]);
  const [motherboardOptions, setMotherboardOptions] = useState<
    DropdownOption[]
  >([]);
  const [selectedRAMOptions, setSelectedRAMOptions] = useState<
    DropdownOption[]
  >([]);
  const [ramOptions, setRamOptions] = useState<DropdownOption[]>([]);
  const [selectedSSDOptions, setSelectedSSDOptions] = useState<
    DropdownOption[]
  >([]);
  const [ssdOptions, setSsdOptions] = useState<DropdownOption[]>([]);
  const [selectedGraphicsCardOptions, setSelectedGraphicsCardOptions] =
    useState<DropdownOption[]>([]);
  const [graphicsCardOptions, setGraphicsCardOptions] = useState<
    DropdownOption[]
  >([]);
  const [selectedCabinetOptions, setSelectedCabinetOptions] = useState<
    DropdownOption[]
  >([]);
  const [cabinetOptions, setCabinetOptions] = useState<DropdownOption[]>([]);
  const [selectedPSUOptions, setSelectedPSUOptions] = useState<
    DropdownOption[]
  >([]);
  const [psuOptions, setPsuOptions] = useState<DropdownOption[]>([]);
  const [selectedHDDOptions, setSelectedHDDOptions] = useState<
    DropdownOption[]
  >([]);
  const [hddOptions, setHddOptions] = useState<DropdownOption[]>([]);
  const [selectedCoolerOptions, setSelectedCoolerOptions] = useState<
    DropdownOption[]
  >([]);
  const [coolerOptions, setCoolerOptions] = useState<DropdownOption[]>([]);
  const [resetDropdown, setResetDropdown] = useState(false);

  const fetchProductsByCategory = useCallback(
    async (
      category: string,
      setOptions: React.Dispatch<React.SetStateAction<DropdownOption[]>>
    ) => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select(
            "product_id, product_name, product_SP, product_category, product_image, product_discount"
          )
          .eq("product_category", category);

        if (error) {
          throw error;
        }

        const formattedOptions = data.map(
          (product: {
            product_id: string;
            product_name: string;
            product_SP: number;
            product_image: ProductImage[];
            product_discount: number;
          }) => ({
            id: product.product_id,
            name: product.product_name,
            price: `₹${product.product_SP.toLocaleString()}`,
            image:
              product.product_image?.find((img: ProductImage) =>
                img.url.includes("_first")
              )?.url || "",
            discount: product.product_discount,
          })
        );

        setOptions(formattedOptions);
      } catch (error) {
        console.error(
          `Error fetching ${category} products:`,
          (error as Error).message
        );
      }
    },
    [] // No external dependencies
  );

  const fetchProcessorProducts = useCallback(() => {
    if (buildType === "AMD") {
      fetchProductsByCategory("AMD_CPU", setProcessorOptions);
    } else if (buildType === "Intel") {
      fetchProductsByCategory("INTEL_CPU", setProcessorOptions);
    }
  }, [buildType, fetchProductsByCategory]);

  const fetchMotherboardProducts = useCallback(
    () => fetchProductsByCategory("Motherboard", setMotherboardOptions),
    [fetchProductsByCategory]
  );

  const fetchRamProducts = useCallback(
    () => fetchProductsByCategory("RAM", setRamOptions),
    [fetchProductsByCategory]
  );

  const fetchSsdProducts = useCallback(
    () => fetchProductsByCategory("SSD", setSsdOptions),
    [fetchProductsByCategory]
  );

  const fetchGraphicsCardProducts = useCallback(
    () => fetchProductsByCategory("GPU", setGraphicsCardOptions),
    [fetchProductsByCategory]
  );

  const fetchCabinetProducts = useCallback(
    () => fetchProductsByCategory("Cabinet", setCabinetOptions),
    [fetchProductsByCategory]
  );

  const fetchPsuProducts = useCallback(
    () => fetchProductsByCategory("PSU", setPsuOptions),
    [fetchProductsByCategory]
  );

  const fetchHddProducts = useCallback(
    () => fetchProductsByCategory("HDD", setHddOptions),
    [fetchProductsByCategory]
  );

  const fetchCoolerProducts = useCallback(
    () => fetchProductsByCategory("Cooler", setCoolerOptions),
    [fetchProductsByCategory]
  );
  useEffect(() => {
    if (buildType) {
      fetchProcessorProducts();
      fetchMotherboardProducts();
      fetchRamProducts();
      fetchSsdProducts();
      fetchGraphicsCardProducts();
      fetchCabinetProducts();
      fetchPsuProducts();
      fetchHddProducts();
      fetchCoolerProducts();
    }
  }, [
    buildType,
    fetchProcessorProducts,
    fetchMotherboardProducts,
    fetchRamProducts,
    fetchSsdProducts,
    fetchGraphicsCardProducts,
    fetchCabinetProducts,
    fetchPsuProducts,
    fetchHddProducts,
    fetchCoolerProducts,
  ]);

  const handleSelect = (
    options: DropdownOption[],
    setSelectedOptions: React.Dispatch<React.SetStateAction<DropdownOption[]>>
  ) => {
    setSelectedOptions(options);
  };

  const handleBuildTypeSelect = (option: DropdownOption) => {
    setBuildType(option.name);
  };

  const saveBuild = async () => {
    const payload = {
      processor: selectedProcessorOptions[0]?.id,
      build_type: buildType,
      motherboards: selectedMotherboardOptions.map((option) => option.id),
      ram: selectedRAMOptions.map((option) => option.id),
      ssd: selectedSSDOptions.map((option) => option.id),
      graphics_cards: selectedGraphicsCardOptions.map((option) => option.id),
      cabinets: selectedCabinetOptions.map((option) => option.id),
      psu: selectedPSUOptions.map((option) => option.id),
      hdd: selectedHDDOptions.map((option) => option.id),
      cooling_systems: selectedCoolerOptions.map((option) => option.id),
    };

    try {
      // Check if the build with the selected processor ID already exists
      const { data: existingBuilds, error } = await supabase
        .from("custom_build")
        .select("*")
        .eq("processor", payload.processor);

      if (error) {
        throw error;
      }

      if (existingBuilds.length > 0) {
        // If a build with the same processor ID exists, show toast message
        toast.error(
          <div className="text-center">
            <p>
              This build already exists. For adding Motherboards, RAMs etc.{" "}
              <button
                className="p-2 bg-indigo-400 hover:border-indigo-400 hover:text-indigo-400 hover:bg-transparent rounded-md"
                onClick={() => router.push("/admin/custom_build_table")}
              >
                Click here
              </button>
            </p>
          </div>
        );
      } else {
        // Otherwise, insert the new build
        const { data, error } = await supabase
          .from("custom_build")
          .insert([payload]);

        if (error) {
          throw error;
        }

        // Trigger toast notification on successful save
        toast.success("Your build combination is ready");

        console.log("Build saved:", data);
      }

      // Clear selected options after saving
      setSelectedProcessorOptions([]);
      setSelectedMotherboardOptions([]);
      setSelectedRAMOptions([]);
      setSelectedSSDOptions([]);
      setSelectedGraphicsCardOptions([]);
      setSelectedCabinetOptions([]);
      setSelectedPSUOptions([]);
      setSelectedHDDOptions([]);
      setSelectedCoolerOptions([]);
      setBuildType(null); // Reset build type selection
      setResetDropdown(true); // Trigger reset for dropdown
      setTimeout(() => setResetDropdown(false), 0); // Reset the reset state
    } catch (error) {
      console.error("Error saving build:", (error as Error).message);
    }
  };

  return (
    <div
      className={`pt-20 pb-20 w-full ${
        buildType ? "h-full" : "h-screen"
      } gap-3 flex flex-col items-center justify-center`}
    >
      <ToastContainer />
      <div className="w-[40%] flex items-center flex-col">
        <div className="w-full flex flex-col items-center justify-between">
          <h2 className="text-indigo-600 text-2xl font-bold pb-9">
            Choose your build type
          </h2>
          <Dropdown
            options={[
              {
                id: "AMD",
                name: "AMD",
                price: "",
                image:
                  "https://supabase.moderncomputer.in/storage/v1/object/public/product-image/item_icon/amd.png",
                discount: 0,
              },
              {
                id: "Intel",
                name: "Intel",
                price: "",
                image:
                  "https://supabase.moderncomputer.in/storage/v1/object/public/product-image/item_icon/intel.png",
                discount: 0,
              },
            ]}
            onSelect={(options) => handleBuildTypeSelect(options[0])}
            multiple={false}
            reset={resetDropdown}
          />
        </div>
      </div>

      {buildType && (
        <div className="w-[80%] flex bg-gray-800 rounded-md justify-center flex-col items-center gap-2 p-4 custom-backdrop-filter">
          <div className="w-full flex flex-col justify-center items-center">
            <h2>Select Processors</h2>
            <Dropdown
              options={processorOptions}
              onSelect={(options) =>
                handleSelect(options, setSelectedProcessorOptions)
              }
              multiple={false}
              reset={resetDropdown}
            />
          </div>
          <div className="w-full flex flex-col justify-center items-center">
            <h2>Select Motherboards</h2>
            <Dropdown
              options={motherboardOptions}
              onSelect={(options) =>
                handleSelect(options, setSelectedMotherboardOptions)
              }
              reset={resetDropdown}
            />
          </div>
          <div className="w-full flex flex-col justify-center items-center">
            <h2>Select RAM</h2>
            <Dropdown
              options={ramOptions}
              onSelect={(options) =>
                handleSelect(options, setSelectedRAMOptions)
              }
              reset={resetDropdown}
            />
          </div>
          <div className="w-full flex flex-col justify-center items-center">
            <h2>Select SSD</h2>
            <Dropdown
              options={ssdOptions}
              onSelect={(options) =>
                handleSelect(options, setSelectedSSDOptions)
              }
              reset={resetDropdown}
            />
          </div>
          <div className="w-full flex flex-col justify-center items-center">
            <h2>Select Graphics Card</h2>
            <Dropdown
              options={graphicsCardOptions}
              onSelect={(options) =>
                handleSelect(options, setSelectedGraphicsCardOptions)
              }
              reset={resetDropdown}
            />
          </div>
          <div className="w-full flex flex-col justify-center items-center">
            <h2>Select Cabinet</h2>
            <Dropdown
              options={cabinetOptions}
              onSelect={(options) =>
                handleSelect(options, setSelectedCabinetOptions)
              }
              reset={resetDropdown}
            />
          </div>
          <div className="w-full flex flex-col items-center">
            <h2>Select PSU</h2>
            <Dropdown
              options={psuOptions}
              onSelect={(options) =>
                handleSelect(options, setSelectedPSUOptions)
              }
              reset={resetDropdown}
            />
          </div>
          <div className="w-full flex flex-col justify-center items-center">
            <h2>Select HDD</h2>
            <Dropdown
              options={hddOptions}
              onSelect={(options) =>
                handleSelect(options, setSelectedHDDOptions)
              }
              reset={resetDropdown}
            />
          </div>
          <div className="w-full flex flex-col justify-center items-center">
            <h2>Select Cooling System</h2>
            <Dropdown
              options={coolerOptions}
              onSelect={(options) =>
                handleSelect(options, setSelectedCoolerOptions)
              }
              reset={resetDropdown}
            />
          </div>
          <button
            onClick={saveBuild}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Save Build
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomPCCombo;
