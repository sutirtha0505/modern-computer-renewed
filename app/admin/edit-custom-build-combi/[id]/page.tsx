"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DropdownForCPCEdit from "@/components/DropdownForCPCEdit";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type DropdownOption = {
  id: string;
  name: string;
  price: string;
  image: string;
};
type ProductImage = {
  url: string;
};

type Build = {
  id: number;
  processor: string;
  build_type: string;
  motherboards: string[];
  ram: string[];
  ssd: string[];
  graphics_cards: string[];
  cabinets: string[];
  psu: string[];
  hdd: string[];
  cooling_systems: string[];
};

type Product = {
  product_id: string;
  product_image: { url: string }[];
  product_name: string;
};

const EditCustomPCCombination = () => {
  const { id } = useParams();
  const [build, setBuild] = useState<Build | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
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
  const [selectedBuildType, setSelectedBuildType] = useState<DropdownOption[]>(
    []
  );
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("custom_build")
          .select("*")
          .eq("id", id);

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setBuild(data[0]);
        } else {
          toast.error("No build found");
        }
      } catch (error) {
        toast.error("Error fetching data");
        console.error(error);
      }
    };

    fetchData();
    fetchProducts();
  }, [id]);

  useEffect(() => {
    if (build && build.build_type) {
      setBuildType(build.build_type);
    }
  }, [build]);

  useEffect(() => {
    const buildTypeOption = buildType
      ? {
          id: buildType.toLowerCase(),
          name: buildType,
          price: "",
          image: `https://supabase.moderncomputer.in/storage/v1/object/public/product-image/item_icon/${buildType.toLowerCase()}.png`,
        }
      : null;
    setSelectedBuildType(buildTypeOption ? [buildTypeOption] : []);
  }, [buildType]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("product_id, product_image, product_name");

      if (error) {
        throw error;
      }

      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", (error as Error).message);
    }
  };

  const fetchProductsByCategory = async (
    category: string,
    setOptions: React.Dispatch<React.SetStateAction<DropdownOption[]>>
  ) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          "product_id, product_name, product_SP, product_category, product_image"
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
        }) => ({
          id: product.product_id,
          name: product.product_name,
          price: `₹${product.product_SP.toLocaleString()}`,
          image: product.product_image?.find((img: ProductImage) =>
            img.url.includes("_first")
          )?.url || "",
        })
      );

      setOptions(formattedOptions);
    } catch (error) {
      console.error(
        `Error fetching ${category} products:`,
        (error as Error).message
      );
    }
  };

  const fetchProcessorProducts = useCallback(() => {
    if (buildType === "AMD") {
      fetchProductsByCategory("AMD_CPU", setProcessorOptions);
    } else if (buildType === "Intel") {
      fetchProductsByCategory("INTEL_CPU", setProcessorOptions);
    }
  }, [buildType]);
  
  // Similarly, memoize other fetch functions
  const fetchMotherboardProducts = useCallback(() => fetchProductsByCategory("Motherboard", setMotherboardOptions), []);
  const fetchRamProducts = useCallback(() => fetchProductsByCategory("RAM", setRamOptions), []);
  const fetchSsdProducts = useCallback(() => fetchProductsByCategory("SSD", setSsdOptions), []);
  const fetchGraphicsCardProducts = useCallback(() => fetchProductsByCategory("GPU", setGraphicsCardOptions), []);
  const fetchCabinetProducts = useCallback(() => fetchProductsByCategory("Cabinet", setCabinetOptions), []);
  const fetchPsuProducts = useCallback(() => fetchProductsByCategory("PSU", setPsuOptions), []);
  const fetchHddProducts = useCallback(() => fetchProductsByCategory("HDD", setHddOptions), []);
  const fetchCoolerProducts = useCallback(() => fetchProductsByCategory("Cooler", setCoolerOptions), []);
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

  const setSelectedOptionsForCategory = useCallback((
    category: string,
    items: string[] | string,
    setSelectedOptions: React.Dispatch<React.SetStateAction<DropdownOption[]>>
  ) => {
    const selectedOptions = products
      .filter((product) => {
        if (Array.isArray(items)) {
          return items.includes(product.product_id);
        } else {
          return items === product.product_id;
        }
      })
      .map((product) => ({
        id: product.product_id,
        name: product.product_name,
        price: "", // Assuming price isn't needed for selected options
        image:
          product.product_image?.find((img: ProductImage) => img.url.includes("_first"))
            ?.url || "",
      }));
    setSelectedOptions(selectedOptions);
  },[products]);

  const handleSelect = (
    options: DropdownOption[],
    setSelectedOptions: React.Dispatch<React.SetStateAction<DropdownOption[]>>,
    category: string
  ) => {
    console.log(`Selected options for ${category}:`, options);
    setSelectedOptions(options);
  };

  const handleBuildTypeSelect = (option: DropdownOption) => {
    setBuildType(option.name);
  };

  useEffect(() => {
    if (build) {
      setSelectedOptionsForCategory(
        "processor",
        build.processor,
        setSelectedProcessorOptions
      );
      setSelectedOptionsForCategory(
        "motherboards",
        build.motherboards,
        setSelectedMotherboardOptions
      );
      setSelectedOptionsForCategory("ram", build.ram, setSelectedRAMOptions);
      setSelectedOptionsForCategory("ssd", build.ssd, setSelectedSSDOptions);
      setSelectedOptionsForCategory(
        "graphics_cards",
        build.graphics_cards,
        setSelectedGraphicsCardOptions
      );
      setSelectedOptionsForCategory(
        "cabinets",
        build.cabinets,
        setSelectedCabinetOptions
      );
      setSelectedOptionsForCategory("psu", build.psu, setSelectedPSUOptions);
      setSelectedOptionsForCategory("hdd", build.hdd, setSelectedHDDOptions);
      setSelectedOptionsForCategory(
        "cooling_systems",
        build.cooling_systems,
        setSelectedCoolerOptions
      );
    }
  }, [build, setSelectedOptionsForCategory]);

  const handleSaveBuild = async () => {
    const selectedProcessorIds = selectedProcessorOptions.map(
      (option) => option.id
    );
    const selectedMotherboardIds = selectedMotherboardOptions.map(
      (option) => option.id
    );
    const selectedRamIds = selectedRAMOptions.map((option) => option.id);
    const selectedSsdIds = selectedSSDOptions.map((option) => option.id);
    const selectedGraphicsCardIds = selectedGraphicsCardOptions.map(
      (option) => option.id
    );
    const selectedCabinetIds = selectedCabinetOptions.map(
      (option) => option.id
    );
    const selectedPsuIds = selectedPSUOptions.map((option) => option.id);
    const selectedHddIds = selectedHDDOptions.map((option) => option.id);
    const selectedCoolerIds = selectedCoolerOptions.map((option) => option.id);

    const updateData: Partial<Build> = {
      processor: selectedProcessorIds[0],
      motherboards: selectedMotherboardIds,
      ram: selectedRamIds,
      ssd: selectedSsdIds,
      graphics_cards: selectedGraphicsCardIds,
      cabinets: selectedCabinetIds,
      psu: selectedPsuIds,
      hdd: selectedHddIds,
      cooling_systems: selectedCoolerIds,
      build_type: buildType || "",
    };

    try {
      const { error } = await supabase
        .from("custom_build")
        .update(updateData)
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast.success("Your build is saved successfully");
      setTimeout(() => {
        router.push("/admin/custom_build_table");
      }, 1500);
    } catch (error) {
      toast.error("Error saving your build");
      console.error(error);
    }
  };

  return (
    <div className="w-screen h-full min-h-screen items-center justify-center flex p-24">
      <div className=" w-[80%] bg-gray-800 flex flex-col items-center  gap-3 rounded-md custom-backdrop-filter p-3">
        <h2>Build Type</h2>
        <DropdownForCPCEdit
          options={[
            {
              id: "AMD",
              name: "AMD",
              price: "",
              image:
                "https://supabase.moderncomputer.in/storage/v1/object/public/product-image/item_icon/amd.png",
            },
            {
              id: "INTEL",
              name: "Intel",
              price: "",
              image:
                "https://supabase.moderncomputer.in/storage/v1/object/public/product-image/item_icon/intel.png",
            },
          ]}
          onSelect={(options) => handleBuildTypeSelect(options[0])}
          multiple={false}
          defaultValue={selectedBuildType}
          disabled={selectedBuildType.length > 0}
        />
        <h2>Processor</h2>
        <DropdownForCPCEdit
          options={processorOptions}
          onSelect={(options) =>
            handleSelect(options, setSelectedProcessorOptions, "processor")
          }
          multiple={false}
          defaultValue={selectedProcessorOptions}
          disabled={selectedProcessorOptions.length > 0}
        />
        <h2>Motherboard</h2>
        <DropdownForCPCEdit
          options={motherboardOptions}
          onSelect={(options) =>
            handleSelect(options, setSelectedMotherboardOptions, "motherboards")
          }
          defaultValue={selectedMotherboardOptions}
        />
        <h2>RAM</h2>
        <DropdownForCPCEdit
          options={ramOptions}
          onSelect={(options) =>
            handleSelect(options, setSelectedRAMOptions, "ram")
          }
          defaultValue={selectedRAMOptions}
        />
        <h2>SSD</h2>
        <DropdownForCPCEdit
          options={ssdOptions}
          onSelect={(options) =>
            handleSelect(options, setSelectedSSDOptions, "ssd")
          }
          defaultValue={selectedSSDOptions}
        />
        <h2>Graphics Card</h2>
        <DropdownForCPCEdit
          options={graphicsCardOptions}
          onSelect={(options) =>
            handleSelect(
              options,
              setSelectedGraphicsCardOptions,
              "graphics_cards"
            )
          }
          defaultValue={selectedGraphicsCardOptions}
        />
        <h2>Cabinet</h2>
        <DropdownForCPCEdit
          options={cabinetOptions}
          onSelect={(options) =>
            handleSelect(options, setSelectedCabinetOptions, "cabinets")
          }
          defaultValue={selectedCabinetOptions}
        />
        <h2>PSU</h2>
        <DropdownForCPCEdit
          options={psuOptions}
          onSelect={(options) =>
            handleSelect(options, setSelectedPSUOptions, "psu")
          }
          defaultValue={selectedPSUOptions}
        />
        <h2>HDD</h2>
        <DropdownForCPCEdit
          options={hddOptions}
          onSelect={(options) =>
            handleSelect(options, setSelectedHDDOptions, "hdd")
          }
          defaultValue={selectedHDDOptions}
        />
        <h2>Cooler</h2>
        <DropdownForCPCEdit
          options={coolerOptions}
          onSelect={(options) =>
            handleSelect(options, setSelectedCoolerOptions, "cooling_systems")
          }
          defaultValue={selectedCoolerOptions}
        />
        <button
          onClick={handleSaveBuild}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Save Build
        </button>
      </div>
    </div>
  );
};

export default EditCustomPCCombination;
