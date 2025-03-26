"use client";
import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dropdown from "./Dropdown";
import { useRouter } from "next/navigation";
import Image from "next/image";

type DropdownOption = {
  id: string;
  name: string;
  price: string;
  image: string;
  discount: number;
};

const CPCAMDDisplay = () => {
  const router = useRouter();
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
  const [resetDropdown] = useState(false);
  const [customBuildId, setCustomBuildId] = useState<string | null>(null);

  const [processorSP, setProcessorSP] = useState("");
  const [processorDiscount, setProcessorDiscount] = useState(0);
  const [motherboardSP, setMotherboardSP] = useState("");
  const [motherboardDiscount, setMotherboardDiscount] = useState(0);
  const [ramSP, setRamSP] = useState("");
  const [ramDiscount, setRamDiscount] = useState(0);
  const [ramQuantity, setRamQuantity] = useState(1); // State for RAM quantity selection
  const [ssdSP, setSsdSP] = useState("");
  const [ssdDiscount, setSsdDiscount] = useState(0);
  const [graphicsCardSP, setGraphicsCardSP] = useState("");
  const [graphicsCardDiscount, setGraphicsCardDiscount] = useState(0);
  const [cabinetSP, setCabinetSP] = useState("");
  const [cabinetDiscount, setCabinetDiscount] = useState(0);
  const [psuSP, setPsuSP] = useState("");
  const [psuDiscount, setPsuDiscount] = useState(0);
  const [hddSP, setHddSP] = useState("");
  const [hddDiscount, setHddDiscount] = useState(0);
  const [coolerSP, setCoolerSP] = useState("");
  const [coolerDiscount, setCoolerDiscount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const excludeProductId = (options: DropdownOption[]) => {
    return options.map(({ name, price, image, discount }) => ({
      name,
      price,
      image,
      discount,
    }));
  };

  const handleBuyNow = () => {
    // Prepare the data to be stored in localStorage, excluding `product_id`
    const checkoutData = {
      customBuildId: customBuildId ?? "",
      totalPrice: totalPrice.toString(),
      processor: excludeProductId(selectedProcessorOptions),
      motherboard: excludeProductId(selectedMotherboardOptions),
      ram: excludeProductId(selectedRAMOptions),
      ramQuantity: ramQuantity.toString(),
      ssd: excludeProductId(selectedSSDOptions),
      graphicsCard: excludeProductId(selectedGraphicsCardOptions),
      cabinet: excludeProductId(selectedCabinetOptions),
      psu: excludeProductId(selectedPSUOptions),
      hdd: excludeProductId(selectedHDDOptions),
      cooler: excludeProductId(selectedCoolerOptions),
    };

    // Store the data in localStorage
    localStorage.setItem(
      "checkoutCustomBuildData",
      JSON.stringify(checkoutData)
    );

    // Redirect to the checkout page without any query parameters
    router.push(`/checkout-custom-build`);
  };

  const fetchProcessorProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("custom_build")
        .select("processor")
        .eq("build_type", "AMD");

      if (error) {
        throw error;
      }

      const processorUUIDs = data.map((build) => build.processor);

      fetchProductsByUUIDs(processorUUIDs, setProcessorOptions);
    } catch (error) {
      console.error(
        "Error fetching processor products:",
        (error as Error).message
      );
    }
  }, []);

  const fetchProductsByUUIDs = async (
    uuids: string[],
    setOptions: React.Dispatch<React.SetStateAction<DropdownOption[]>>
  ) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          "product_id, product_name, product_SP, product_image, product_discount"
        )
        .in("product_id", uuids);

      if (error) {
        throw error;
      }

      const formattedOptions = data.map((product) => ({
        id: product.product_id,
        name: product.product_name.split(" ").slice(0, 10).join(" "),
        price: product.product_SP,
        image: product.product_image?.find((img: { url?: string }) =>
          img.url?.includes("_first")
        )?.url,
        discount: product.product_discount,
      }));

      setOptions(formattedOptions);
    } catch (error) {
      console.error("Error fetching products:", (error as Error).message);
    }
  };

  const handleSelectProcessor = async (selectedOption: DropdownOption) => {
    try {
      const { data, error } = await supabase
        .from("custom_build")
        .select("*")
        .eq("processor", selectedOption.id)
        .single();

      if (error) {
        throw error;
      }
      // Log the id from the custom_build table
      console.log("Custom build ID:", data.id);
      setCustomBuildId(data.id);
      fetchProductsByUUIDs(data.motherboards, setMotherboardOptions);
      fetchProductsByUUIDs(data.ram, setRamOptions);
      fetchProductsByUUIDs(data.ssd, setSsdOptions);
      fetchProductsByUUIDs(data.graphics_cards, setGraphicsCardOptions);
      fetchProductsByUUIDs(data.cabinets, setCabinetOptions);
      fetchProductsByUUIDs(data.psu, setPsuOptions);
      fetchProductsByUUIDs(data.hdd, setHddOptions);
      fetchProductsByUUIDs(data.cooling_systems, setCoolerOptions);

      setSelectedProcessorOptions([selectedOption]);
      setProcessorSP(selectedOption.price);
      setProcessorDiscount(selectedOption.discount);
    } catch (error) {
      console.error("Error fetching build details:", (error as Error).message);
    }
  };

  const handleSelect = (
    options: DropdownOption[],
    setSelectedOptions: React.Dispatch<React.SetStateAction<DropdownOption[]>>,
    setSP: React.Dispatch<React.SetStateAction<string>>,
    setDiscount: React.Dispatch<React.SetStateAction<number>>
  ) => {
    setSelectedOptions(options);
    setSP(options[0].price);
    setDiscount(options[0].discount);
  };

  const handleSelectRamQuantity = (quantity: number) => {
    setRamQuantity(quantity);
  };

  const calculateTotalPrice = useCallback(() => {
    const total =
      Number(processorSP) +
      Number(motherboardSP) +
      Number(ramSP) * ramQuantity + // Updated to multiply RAM price by quantity
      Number(ssdSP) +
      Number(graphicsCardSP) +
      Number(cabinetSP) +
      Number(psuSP) +
      Number(hddSP) +
      Number(coolerSP);
    setTotalPrice(total);
  }, [
    processorSP,
    motherboardSP,
    ramSP,
    ramQuantity,
    graphicsCardSP,
    cabinetSP,
    coolerSP,
    psuSP,
    hddSP,
    ssdSP,
  ]);

  useEffect(() => {
    fetchProcessorProducts();
  }, [fetchProcessorProducts]);

  useEffect(() => {
    calculateTotalPrice();
  }, [calculateTotalPrice]);
  const processorOffer = Math.round(
    (Number(processorSP) * processorDiscount) / 100
  );
  const motherboardOffer = Math.round(
    (Number(motherboardSP) * motherboardDiscount) / 100
  );
  const ramOffer = Math.round(
    (Number(ramSP) * ramQuantity * ramDiscount) / 100
  );
  const ssdOffer = Math.round((Number(ssdSP) * ssdDiscount) / 100);
  const graphicsCardOffer = Math.round(
    (Number(graphicsCardSP) * graphicsCardDiscount) / 100
  );
  const cabinetOffer = Math.round((Number(cabinetSP) * cabinetDiscount) / 100);
  const psuOffer = Math.round((Number(psuSP) * psuDiscount) / 100);
  const hddOffer = Math.round((Number(hddSP) * hddDiscount) / 100);
  const coolerOffer = Math.round((Number(coolerSP) * coolerDiscount) / 100);
  const totalDiscount =
    processorOffer +
    motherboardOffer +
    ssdOffer +
    graphicsCardOffer +
    hddOffer +
    ramOffer +
    cabinetOffer +
    psuOffer +
    coolerOffer;

  return (
    <div className="w-full h-full flex-wrap p-4 justify-center items-center flex">
      <div className="w-full md:w-1/2 h-96 relative p-0 justify-center items-center">
        <div className="sticky  h-full w-full flex justify-center items-center">
          <div className="w-72 scale-110 md:scale-150 absolute flex justify-center items-center h-40  z-[2]">
            {selectedMotherboardOptions.length < 1 ? (
              <div className="flex flex-col">
                <Image
                  src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/cbpc_amd/AMD_Custom.png"
                  className="hover:scale-105 duration-300 ease-in-out"
                  alt="Default Image"
                  width={512}
                  height={512}
                />
                <h1 className="text-sm text-center font-semibold">
                  Choose Your components to See the Computer
                </h1>
              </div>
            ) : (
              <Image
                src={selectedMotherboardOptions[0]?.image || "https://supabase.moderncomputer.in/storage/v1/object/public/product-image/product_by_category/Motherboard/image.png"}
                className={`w-full h-full object-contain ${
                  selectedMotherboardOptions.length ? "" : "invisible"
                }`}
                alt="Selected Motherboard Image"
                width={512}
                height={512}
              />
            )}

            <div className="w-32 h-48 border-0 -right-1 absolute -z-[1] md:-right-9 ">
              <Image
                src={selectedCabinetOptions[0]?.image || "https://supabase.moderncomputer.in/storage/v1/object/public/product-image/product_by_category/Cabinet/image.png"}
                className={`w-full h-full object-contain ${
                  selectedCabinetOptions.length ? "" : "invisible"
                }`}
                width={512}
                height={512}
                alt="cabinet"
              />
              <div className="w-16 h-28  absolute -top-12">
                <Image
                  src={selectedHDDOptions[0]?.image || "https://supabase.moderncomputer.in/storage/v1/object/public/product-image/product_by_category/Hard%20Disk/image.png"}
                  className={`w-full h-full object-contain ${
                    selectedHDDOptions.length ? "" : "invisible"
                  }`}
                  width={512}
                  height={512}
                  alt="Hard disk"
                />
              </div>
            </div>
            <div className="w-40 h-10 absolute z-[3]  left-5 -bottom-5">
              <Image
                src={selectedRAMOptions[0]?.image || "https://supabase.moderncomputer.in/storage/v1/object/public/product-image/product_by_category/RAM/image.png"}
                className={`w-full h-full object-contain border-none ${
                  selectedRAMOptions.length ? "" : "invisible"
                }`}
                width={512}
                height={512}
                alt="RAM"
              />
            </div>
            <div className="w-40 h-10 absolute z-[3]  left-5 -top-5">
              <Image
                src={selectedSSDOptions[0]?.image || "https://supabase.moderncomputer.in/storage/v1/object/public/product-image/product_by_category/SSD/image.png"}
                className={`w-full h-full object-contain ${
                  selectedSSDOptions.length ? "" : "invisible"
                }`}
                width={512}
                height={512}
                alt="SSD"
              />
            </div>
            <div className="w-20 h-20 absolute z-[3] -bottom-3 -left-3 md:-left-3">
              <Image
                src={selectedPSUOptions[0]?.image || "https://supabase.moderncomputer.in/storage/v1/object/public/product-image/product_by_category/Power%20Supply/image.png"}
                className={`w-full h-full object-contain ${
                  selectedPSUOptions.length ? "" : "invisible"
                }`}
                width={512}
                height={512}
                alt="Power Supply Unit"
              />
            </div>
            <div className="w-20 h-20 absolute z-[3] -top-3 -left-3 md:-left-3">
              <Image
                src={selectedProcessorOptions[0]?.image || "https://supabase.moderncomputer.in/storage/v1/object/public/product-image/product_by_category/Processor/image.png"}
                className={`w-full h-full object-contain ${
                  selectedProcessorOptions.length ? "" : "invisible"
                }`}
                width={512}
                height={512}
                alt="Processor"
              />
            </div>
            <div className="w-20 h-20 absolute z-[4] -top-9 -right-3 md:-right-3">
              <Image
                src={selectedGraphicsCardOptions[0]?.image || "https://supabase.moderncomputer.in/storage/v1/object/public/product-image/product_by_category/Graphics%20Card/image.png"}
                className={`w-full h-full object-contain ${
                  selectedGraphicsCardOptions.length ? "" : "invisible"
                }`}
                width={512}
                height={512}
                alt="Graphics Card"
              />
            </div>
            <div className="w-20 h-20 absolute z-[4] -bottom-9 -right-3 md:-right-3">
              <Image
                src={selectedCoolerOptions[0]?.image || "https://supabase.moderncomputer.in/storage/v1/object/public/product-image/product_by_category/Cooling%20System/image.png"}
                className={`w-full h-full object-contain ${
                  selectedCoolerOptions.length ? "" : "invisible"
                }`}
                width={512}
                height={512}
                alt="Cooler"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/2">
        <div
          className={`pb-20 w-full h-full gap-3 flex flex-col items-center justify-center`}
        >
          <ToastContainer />

          <div className="md:w-[80%] w-full flex rounded-md justify-center flex-col items-center gap-5 p-4 custom-backdrop-filter">
            <h1 className="text-2xl font-extrabold bg-gradient-to-br from-purple-600 to-blue-500 text-transparent bg-clip-text">
              Choose your Components
            </h1>
            <div className="w-full flex flex-col">
              <div className="w-full flex flex-col gap-2 justify-between items-start">
                <div className="flex justify-center items-center gap-4">
                  <Image
                    src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pre-build/processor/processor.png"
                    className="w-8 h-8"
                    height={512}
                    width={512}
                    alt="processor"
                  />
                  <h1 className="text-xl font-bold">Processor: </h1>
                  <div className="flex justify-center items-center gap-2">
                    <Image
                      src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/gift.png"
                      className="w-6 h-6"
                      height={512}
                      width={512}
                      alt="processor"
                    />
                    <h1 className="text-lg font-semibold text-indigo-500">
                      ₹{processorOffer} off
                    </h1>
                    <h1 className="text-sm font-semibold text-green-500">
                      ({processorDiscount}%)
                    </h1>
                  </div>
                </div>
                <div className="flex w-full justify-center gap-5 items-center">
                  <Dropdown
                    options={processorOptions}
                    onSelect={(options) => handleSelectProcessor(options[0])}
                    multiple={false}
                    reset={resetDropdown}
                  />
                  <h2 className="text-xs text-emerald-300">
                    ₹{processorSP.toLocaleString()}
                  </h2>
                </div>
              </div>
            </div>
            <div className="w-full flex flex-col gap-2 justify-between items-start">
              <div className="flex justify-center items-center gap-4">
                <Image
                  src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pre-build/motherboard/motherboard.png"
                  className="w-8 h-8"
                  height={512}
                  width={512}
                  alt="motherboard"
                />
                <h1 className="text-xl font-bold">Motherboard: </h1>
                <div className="flex justify-center items-center gap-2">
                  <Image
                    src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/gift.png"
                    className="w-6 h-6"
                    height={512}
                    width={512}
                    alt="motherboard"
                  />
                  <h1 className="text-lg font-semibold text-indigo-500">
                    ₹{motherboardOffer} off
                  </h1>
                  <h1 className="text-sm font-semibold text-green-500">
                    ({motherboardDiscount}%)
                  </h1>
                </div>
              </div>
              <div className="flex w-full justify-center gap-5 items-center">
                <Dropdown
                  options={motherboardOptions}
                  onSelect={(options) =>
                    handleSelect(
                      options,
                      setSelectedMotherboardOptions,
                      setMotherboardSP,
                      setMotherboardDiscount
                    )
                  }
                  reset={resetDropdown}
                  multiple={false}
                />
                <h2 className="text-xs text-emerald-300">
                  ₹{motherboardSP.toLocaleString()}
                </h2>
              </div>
            </div>
            <div className="flex w-full justify-center gap-5 items-center"></div>
            <div className="w-full flex-wrap flex gap-2 justify-between items-start">
              <div className="flex justify-center items-center gap-2">
                <Image
                  src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pre-build/RAM/RAM.png"
                  className="w-8 h-8"
                  height={512}
                  width={512}
                  alt="RAM"
                />
                <h1 className="text-xl font-bold">RAM: </h1>
                <div className="flex justify-center items-center gap-2">
                  <Image
                    src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/gift.png"
                    className="w-6 h-6"
                    height={512}
                    width={512}
                    alt="RAM"
                  />
                  <h1 className="text-lg font-semibold text-indigo-500">
                    ₹{ramOffer} off
                  </h1>
                  <h1 className="text-sm font-semibold text-green-500">
                    ({ramDiscount}%)
                  </h1>
                </div>
              </div>
              <div className="flex w-full justify-center gap-5 items-center">
                <Dropdown
                  options={ramOptions}
                  onSelect={(options) =>
                    handleSelect(
                      options,
                      setSelectedRAMOptions,
                      setRamSP,
                      setRamDiscount
                    )
                  }
                  reset={resetDropdown}
                  multiple={false}
                />
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold">Quantity:</label>
                  <select
                    className="p-2 bg-transparent border rounded-md"
                    value={ramQuantity}
                    onChange={(e) =>
                      handleSelectRamQuantity(Number(e.target.value))
                    }
                  >
                    {[1, 2, 4, 8, 16, 32].map((quantity) => (
                      <option key={quantity} value={quantity}>
                        {quantity}
                      </option>
                    ))}
                  </select>
                </div>
                <h2 className="text-xs text-emerald-300">
                  ₹{(Number(ramSP) * ramQuantity).toLocaleString()}
                </h2>
              </div>
            </div>
            <div className="w-full flex flex-col gap-2 justify-between items-start">
              <div className="flex justify-center items-center gap-2">
                <Image
                  src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pre-build/SSD/ssd.png"
                  className="w-8 h-8"
                  width={512}
                  height={512}
                  alt="SSD"
                />
                <h1 className="text-xl font-bold">SSD: </h1>
                <div className="flex justify-center items-center gap-2">
                  <Image
                    src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/gift.png"
                    className="w-6 h-6"
                    height={512}
                    width={512}
                    alt="ssd"
                  />
                  <h1 className="text-lg font-semibold text-indigo-500">
                    ₹{ssdOffer} off
                  </h1>
                  <h1 className="text-sm font-semibold text-green-500">
                    ({ssdDiscount}%)
                  </h1>
                </div>
              </div>
              <div className="flex w-full justify-center gap-5 items-center">
                <Dropdown
                  options={ssdOptions}
                  onSelect={(options) =>
                    handleSelect(
                      options,
                      setSelectedSSDOptions,
                      setSsdSP,
                      setSsdDiscount
                    )
                  }
                  reset={resetDropdown}
                  multiple={false}
                />
                <h2 className="text-xs text-emerald-300">
                  ₹{ssdSP.toLocaleString()}
                </h2>
              </div>
            </div>
            <div className="w-full flex flex-col gap-2 justify-between items-start">
              <div className="flex justify-center items-center gap-2">
                <Image
                  src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pre-build/graphics%20card/graphic_card.png"
                  className="w-8 h-8"
                  width={512}
                  height={512}
                  alt="Graphics Card"
                />
                <h1 className="text-xl font-bold">Graphics Card: </h1>
                <div className="flex justify-center items-center gap-2">
                  <Image
                    src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/gift.png"
                    className="w-6 h-6"
                    height={512}
                    width={512}
                    alt="graphicsCard"
                  />
                  <h1 className="text-lg font-semibold text-indigo-500">
                    ₹{graphicsCardOffer} off
                  </h1>
                  <h1 className="text-sm font-semibold text-green-500">
                    ({graphicsCardDiscount}%)
                  </h1>
                </div>
              </div>
              <div className="flex w-full justify-center gap-5 items-center">
                <Dropdown
                  options={graphicsCardOptions}
                  onSelect={(options) =>
                    handleSelect(
                      options,
                      setSelectedGraphicsCardOptions,
                      setGraphicsCardSP,
                      setGraphicsCardDiscount
                    )
                  }
                  reset={resetDropdown}
                  multiple={false}
                />
                <h2 className="text-xs text-emerald-300">
                  ₹{graphicsCardSP.toLocaleString()}
                </h2>
              </div>
            </div>
            <div className="w-full flex flex-col gap-2 justify-between items-start">
              <div className="flex justify-center items-center gap-2">
                <Image
                  src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pre-build/cabinet/high_tower.png"
                  className="w-8 h-8"
                  width={512}
                  height={512}
                  alt="Cabinet"
                />
                <h1 className="text-xl font-bold">Cabinet: </h1>
                <div className="flex justify-center items-center gap-2">
                  <Image
                    src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/gift.png"
                    className="w-6 h-6"
                    height={512}
                    width={512}
                    alt="cabinet"
                  />
                  <h1 className="text-lg font-semibold text-indigo-500">
                    ₹{cabinetOffer} off
                  </h1>
                  <h1 className="text-sm font-semibold text-green-500">
                    ({cabinetDiscount}%)
                  </h1>
                </div>
              </div>
              <div className="flex w-full justify-center gap-5 items-center">
                <Dropdown
                  options={cabinetOptions}
                  onSelect={(options) =>
                    handleSelect(
                      options,
                      setSelectedCabinetOptions,
                      setCabinetSP,
                      setCabinetDiscount
                    )
                  }
                  reset={resetDropdown}
                  multiple={false}
                />
                <h2 className="text-xs text-emerald-300">
                  ₹{cabinetSP.toLocaleString()}
                </h2>
              </div>
            </div>
            <div className="w-full flex flex-col gap-2 justify-between items-start">
              <div className="flex justify-center items-center gap-2">
                <Image
                  src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pre-build/SMPS/power_supply.png"
                  className="w-8 h-8"
                  width={512}
                  height={512}
                  alt="Power Supply"
                />
                <h1 className="text-xl font-bold">Power Supply: </h1>
                <div className="flex justify-center items-center gap-2">
                  <Image
                    src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/gift.png"
                    className="w-6 h-6"
                    height={512}
                    width={512}
                    alt="psu"
                  />
                  <h1 className="text-lg font-semibold text-indigo-500">
                    ₹{psuOffer} off
                  </h1>
                  <h1 className="text-sm font-semibold text-green-500">
                    ({psuDiscount}%)
                  </h1>
                </div>
              </div>
              <div className="flex w-full justify-center gap-5 items-center">
                <Dropdown
                  options={psuOptions}
                  onSelect={(options) =>
                    handleSelect(
                      options,
                      setSelectedPSUOptions,
                      setPsuSP,
                      setPsuDiscount
                    )
                  }
                  reset={resetDropdown}
                  multiple={false}
                />
                <h2 className="text-xs text-emerald-300">
                  ₹{psuSP.toLocaleString()}
                </h2>
              </div>
            </div>
            <div className="w-full flex flex-col gap-2 justify-between items-start">
              <div className="flex justify-center items-center gap-2">
                <Image
                  src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pre-build/hard%20disk/hard_disk.png"
                  className="w-8 h-8"
                  width={512}
                  height={512}
                  alt="Hard Disk"
                />
                <h1 className="text-xl font-bold">Hard Disk: </h1>
                <div className="flex justify-center items-center gap-2">
                  <Image
                    src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/gift.png"
                    className="w-6 h-6"
                    height={512}
                    width={512}
                    alt="hdd"
                  />
                  <h1 className="text-lg font-semibold text-indigo-500">
                    ₹{hddOffer} off
                  </h1>
                  <h1 className="text-sm font-semibold text-green-500">
                    ({hddDiscount}%)
                  </h1>
                </div>
              </div>
              <div className="flex w-full justify-center gap-5 items-center">
                <Dropdown
                  options={hddOptions}
                  onSelect={(options) =>
                    handleSelect(
                      options,
                      setSelectedHDDOptions,
                      setHddSP,
                      setHddDiscount
                    )
                  }
                  reset={resetDropdown}
                  multiple={false}
                />
                <h2 className="text-xs text-emerald-300">
                  ₹{hddSP.toLocaleString()}
                </h2>
              </div>
            </div>
            <div className="w-full flex flex-col gap-2 justify-between items-start">
              <div className="flex justify-center items-center gap-2">
                <Image
                  src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pre-build/cooler/cooler.png"
                  className="w-8 h-8"
                  width={512}
                  height={512}
                  alt="Cooler"
                />
                <h1 className="text-xl font-bold">Cooling System: </h1>
                <div className="flex justify-center items-center gap-2">
                  <Image
                    src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/gift.png"
                    className="w-6 h-6"
                    height={512}
                    width={512}
                    alt="cooler"
                  />
                  <h1 className="text-lg font-semibold text-indigo-500">
                    ₹{coolerOffer} off
                  </h1>
                  <h1 className="text-sm font-semibold text-green-500">
                    ({coolerDiscount}%)
                  </h1>
                </div>
              </div>
              <div className="flex w-full justify-center gap-5 items-center">
                <Dropdown
                  options={coolerOptions}
                  onSelect={(options) =>
                    handleSelect(
                      options,
                      setSelectedCoolerOptions,
                      setCoolerSP,
                      setCoolerDiscount
                    )
                  }
                  reset={resetDropdown}
                  multiple={false}
                />
                <h2 className="text-xs text-emerald-300">
                  ₹{coolerSP.toLocaleString()}
                </h2>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center gap-x-10 w-full">
            <h1 className="text-xl font-bold">
              <span className="text-indigo-500">Total Price:</span> ₹
              {totalPrice.toLocaleString()}
            </h1>
            <h1 className="text-xl font-bold text-green-500">
              ₹{totalDiscount} off
            </h1>
          </div>

          <button
            onClick={handleBuyNow}
            disabled={
              !selectedProcessorOptions.length ||
              !selectedMotherboardOptions.length ||
              !selectedRAMOptions.length ||
              !selectedSSDOptions.length ||
              !selectedGraphicsCardOptions.length ||
              !selectedPSUOptions.length ||
              !selectedCoolerOptions.length
            }
            className={`bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 h-10 w-28 rounded-md text-l hover:text-l hover:font-bold duration-200 cursor-pointer
  ${
    !selectedProcessorOptions.length ||
    !selectedMotherboardOptions.length ||
    !selectedRAMOptions.length ||
    !selectedSSDOptions.length ||
    !selectedGraphicsCardOptions.length ||
    !selectedPSUOptions.length ||
    !selectedCoolerOptions.length
      ? "opacity-50 cursor-not-allowed"
      : ""
  }`}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CPCAMDDisplay;
