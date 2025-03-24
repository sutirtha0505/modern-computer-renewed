"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dropdown from "@/components/Dropdown";
import { useRouter } from "next/navigation";
import { BadgeInfo, CloudUpload } from "lucide-react";
import Image from "next/image";

type DropdownOption = {
  id: string;
  name: string;
  price: string;
  image: string;
  discount: number;
};

interface ProductImage {
  url: string; // Adjust fields based on your database schema
}


const PBPCListing = () => {
  const router = useRouter();
  const [buildType, setBuildType] = useState<string | null>(null);
  const [buildName, setBuildName] = useState<string>("");
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [additionalProducts, setAdditionalProducts] = useState<
    DropdownOption[]
  >([]);
  const [additionalProductOptions, setAdditionalProductOptions] = useState<
    DropdownOption[]
  >([]);
  const [images, setImages] = useState<File[]>([]);
  const [resetDropdown, setResetDropdown] = useState(false);

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
  const [selectedRAMQuantity, setSelectedRAMQuantity] = useState<number>(1); // New state for RAM quantity
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

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setImages([...images, ...acceptedFiles]);
    },
  });


  const fetchProductsByCategory = useCallback(
    async (category: string, setOptions: React.Dispatch<React.SetStateAction<DropdownOption[]>>) => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("product_id, product_name, product_SP, product_image, product_discount")
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
            image: product.product_image?.find((img) => img.url.includes("_first"))?.url || "",
            discount: product.product_discount,
          })
        );

        setOptions(formattedOptions);
      } catch (error) {
        console.error(`Error fetching ${category} products:`, error);
      }
    },
    []
  );

  const fetchAdditionalProducts = useCallback(async () => {
    try {
      const excludedCategories = [
        "Motherboard",
        "RAM",
        "SSD",
        "GPU",
        "PSU",
        "HDD",
        "Cooler",
        "AMD_CPU",
        "INTEL_CPU",
        "Cabinet",
      ];

      const { data, error } = await supabase
        .from("products")
        .select("product_id, product_name, product_SP, product_image, product_discount")
        .not("product_category", "in", `(${excludedCategories.join(",")})`);

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
          image: product.product_image?.find((img) => img.url.includes("_first"))?.url || "",
          discount: 0,
        })
      );

      setAdditionalProductOptions(formattedOptions);
    } catch (error) {
      console.error("Error fetching additional products:", error);
    }
  }, []);

  useEffect(() => {
    if (buildType) {
      fetchProductsByCategory(buildType === "AMD" ? "AMD_CPU" : "INTEL_CPU", setProcessorOptions);
      fetchProductsByCategory("Motherboard", setMotherboardOptions);
      fetchProductsByCategory("RAM", setRamOptions);
      fetchProductsByCategory("SSD", setSsdOptions);
      fetchProductsByCategory("GPU", setGraphicsCardOptions);
      fetchProductsByCategory("Cabinet", setCabinetOptions);
      fetchProductsByCategory("PSU", setPsuOptions);
      fetchProductsByCategory("HDD", setHddOptions);
      fetchProductsByCategory("Cooler", setCoolerOptions);
      fetchAdditionalProducts();
    }
  }, [buildType, fetchProductsByCategory, fetchAdditionalProducts]);

  const handleSelect = (
    options: DropdownOption[],
    setSelectedOptions: React.Dispatch<React.SetStateAction<DropdownOption[]>>
  ) => {
    setSelectedOptions(options);
  };

  const handleBuildTypeSelect = (option: DropdownOption) => {
    setBuildType(option.name);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const calculateTotalPrice = () => {
    let totalPrice = 0;

    const allSelectedOptions = [
      selectedProcessorOptions,
      selectedMotherboardOptions,
      selectedRAMOptions,
      selectedSSDOptions,
      selectedGraphicsCardOptions,
      selectedCabinetOptions,
      selectedPSUOptions,
      selectedHDDOptions,
      selectedCoolerOptions,
      additionalProducts,
    ];

    allSelectedOptions.forEach((options) => {
      options.forEach((option) => {
        const price = parseFloat(option.price.replace(/[^\d.-]/g, ""));
        if (!isNaN(price)) {
          totalPrice += price;
        }
      });
    });

    selectedRAMOptions.forEach((option) => {
      const price = parseFloat(option.price.replace(/[^\d.-]/g, ""));
      if (!isNaN(price)) {
        totalPrice += price * selectedRAMQuantity;
      }
    });

    return totalPrice.toLocaleString();
  };

  const saveBuild = async () => {
    const payload = {
      processor: selectedProcessorOptions[0]?.id,
      build_type: buildType,
      build_name: buildName,
      selling_price: sellingPrice,
      motherboard: selectedMotherboardOptions[0]?.id,
      ram: selectedRAMOptions[0]?.id,
      ram_quantity: selectedRAMQuantity,
      ssd: selectedSSDOptions[0]?.id,
      graphics_card: selectedGraphicsCardOptions[0]?.id,
      cabinet: selectedCabinetOptions[0]?.id,
      psu: selectedPSUOptions[0]?.id,
      hdd: selectedHDDOptions[0]?.id,
      cooling_system: selectedCoolerOptions[0]?.id,
      additional_products: additionalProducts.map((option) => option.id),
    };

    try {
      const { data: existingBuilds, error: existingBuildsError } =
        await supabase
          .from("pre_build")
          .select("*")
          .eq("processor", payload.processor);

      if (existingBuildsError) {
        throw existingBuildsError;
      }

      if (existingBuilds.length > 0) {
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
        const buildId = uuidv4();
        const imageUrls: { url: string }[] = [];
        const uploadPromises = images.map(async (image) => {
          const filePath = `${buildId}/${uuidv4()}_${image.name}`;
          const { error: uploadError } = await supabase.storage
            .from("product-image")
            .upload(filePath, image);

          if (uploadError) {
            console.error("Error uploading image:", uploadError.message);
            toast.error(`Error uploading image: ${uploadError.message}`);
            return;
          }

          const { data: publicUrlData } = await supabase.storage
            .from("product-image")
            .getPublicUrl(filePath);

          if (publicUrlData) {
            imageUrls.push({ url: publicUrlData.publicUrl });
          } else {
            console.error("Error getting public URL");
            toast.error("Error getting public URL");
          }
        });

        await Promise.all(uploadPromises);

        const { error } = await supabase
          .from("pre_build")
          .insert([{ ...payload, id: buildId, image_urls: imageUrls }]);

        if (error) {
          throw error;
        }

        toast.success("Your build combination is ready");

        setSelectedProcessorOptions([]);
        setSelectedMotherboardOptions([]);
        setSelectedRAMOptions([]);
        setSelectedSSDOptions([]);
        setSelectedGraphicsCardOptions([]);
        setSelectedCabinetOptions([]);
        setSelectedPSUOptions([]);
        setSelectedHDDOptions([]);
        setSelectedCoolerOptions([]);
        setAdditionalProducts([]);
        setImages([]);
        setBuildType(null);
        setBuildName("");
        setSellingPrice(0);
        setResetDropdown(true);
        setTimeout(() => {
          setResetDropdown(false);
        }, 100);
      }
    } catch (error) {
      console.error("Error saving build:", (error as Error).message);
      toast.error("Error saving build. Please try again.");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="w-full mb-14 max-w-3xl mt-5">
        <div className="bg-gray-800 p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-semibold mb-6 text-center">
            Create a <span className="text-indigo-500">Pre-Build PC</span>
          </h1>
          <div className="flex flex-col gap-4">
            <div className="w-full flex flex-col justify-center items-center">
              <label className="block font-medium mb-1">
                Build Type <BadgeInfo className="inline-block w-4 h-4" />
              </label>
              <Dropdown
                options={[
                  {
                    id: "AMD",
                    name: "AMD",
                    price: "",
                    image:
                      "https://supabase.moderncomputer.in/storage/v1/object/public/product-image/item_icon/amd.png",
                      discount: 0
                  },
                  {
                    id: "INTEL",
                    name: "Intel",
                    price: "",
                    image:
                      "https://supabase.moderncomputer.in/storage/v1/object/public/product-image/item_icon/intel.png",
                      discount: 0
                  },
                ]}
                onSelect={(options) => handleBuildTypeSelect(options[0])}
                multiple={false}
                reset={resetDropdown}
              />
            </div>
            <div className="w-full flex flex-col justify-center items-center">
              <label className="block font-medium mb-1">Build Name</label>
              <input
                type="text"
                className="bg-transparent px-4 py-2 border rounded-md outline-none"
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
              />
            </div>

            <div className="w-full flex flex-col justify-center items-center">
              <label className="block font-medium mb-1">Processor</label>
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
              <label className="block font-medium mb-1">Motherboards</label>
              <Dropdown
                options={motherboardOptions}
                onSelect={(options) =>
                  handleSelect(options, setSelectedMotherboardOptions)
                }
                multiple={false}
                reset={resetDropdown}
              />
            </div>
            <div className="w-full flex flex-col justify-center items-center">
              <label className="block font-medium mb-1">RAM</label>
              <Dropdown
                options={ramOptions}
                onSelect={(options) =>
                  handleSelect(options, setSelectedRAMOptions)
                }
                multiple={false}
                reset={resetDropdown}
              />
              <select
                value={selectedRAMQuantity}
                onChange={(e) => setSelectedRAMQuantity(Number(e.target.value))}
                className="w-24 bg-transparent border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              >
                {[1, 2, 3, 4].map((quantity) => (
                  <option key={quantity} value={quantity}>
                    {quantity}x
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full flex flex-col justify-center items-center">
              <label className="block font-medium mb-1">SSD</label>
              <Dropdown
                options={ssdOptions}
                onSelect={(options) =>
                  handleSelect(options, setSelectedSSDOptions)
                }
                multiple={false}
                reset={resetDropdown}
              />
            </div>
            <div className="w-full flex flex-col justify-center items-center">
              <label className="block font-medium mb-1">Graphics Card</label>
              <Dropdown
                options={graphicsCardOptions}
                onSelect={(options) =>
                  handleSelect(options, setSelectedGraphicsCardOptions)
                }
                multiple={false}
                reset={resetDropdown}
              />
            </div>
            <div className="w-full flex flex-col justify-center items-center">
              <label className="block font-medium mb-1">Cabinet</label>
              <Dropdown
                options={cabinetOptions}
                onSelect={(options) =>
                  handleSelect(options, setSelectedCabinetOptions)
                }
                multiple={false}
                reset={resetDropdown}
              />
            </div>
            <div className="w-full flex flex-col justify-center items-center">
              <label className="block font-medium mb-1">PSU</label>
              <Dropdown
                options={psuOptions}
                onSelect={(options) =>
                  handleSelect(options, setSelectedPSUOptions)
                }
                multiple={false}
                reset={resetDropdown}
              />
            </div>
            <div className="w-full flex flex-col justify-center items-center">
              <label className="block font-medium mb-1">HDD</label>
              <Dropdown
                options={hddOptions}
                onSelect={(options) =>
                  handleSelect(options, setSelectedHDDOptions)
                }
                multiple={false}
                reset={resetDropdown}
              />
            </div>
            <div className="w-full flex flex-col justify-center items-center">
              <label className="block font-medium mb-1">Cooling System</label>
              <Dropdown
                options={coolerOptions}
                onSelect={(options) =>
                  handleSelect(options, setSelectedCoolerOptions)
                }
                multiple={false}
                reset={resetDropdown}
              />
            </div>
            <div className="w-full flex flex-col justify-center items-center">
              <label className="block font-medium mb-1">
                Additional Products
              </label>
              <Dropdown
                options={additionalProductOptions}
                onSelect={(options) =>
                  handleSelect(options, setAdditionalProducts)
                }
                multiple={true}
                reset={resetDropdown}
              />
            </div>

            <div className="w-full flex flex-col justify-center items-center">
              <label className="block font-medium mb-1">
                Selling Price{" "}
                <span className="text-indigo-600">
                  ({`₹${calculateTotalPrice()}`})
                </span>{" "}
              </label>
              <input
                type="number"
                className="bg-transparent px-4 py-2 border rounded-md outline-none"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
              />
            </div>

            <div className="w-full justify-center items-center flex flex-col">
              <label className="block font-medium mb-1">Product Image</label>
              <div
                {...getRootProps({
                  className:
                    "border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer rounded-md",
                })}
              >
                <input {...getInputProps()} />
                <CloudUpload className="w-6 h-6 inline-block mb-2" />
                <p>
                  Drag &apos;n&apos; drop some images here, or click to select
                  images
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={URL.createObjectURL(image)}
                      alt={`Upload Preview ${index}`}
                      className="h-20 w-20 object-cover rounded-md"
                      width={500}
                      height={500}
                    />
                    <button
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                      onClick={() => handleRemoveImage(index)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-center mt-6">
            <button
              onClick={saveBuild}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-2 rounded-md"
            >
              Save Build
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PBPCListing;
