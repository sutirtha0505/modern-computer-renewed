"use client";

import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../lib/supabaseClient";
import { BadgeInfo, CloudUpload } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

const ProductUploadForm: React.FC = () => {
  const [productName, setProductName] = useState<string>("");
  const [productSP, setProductSP] = useState<number>(0);
  const [productDescription, setProductDescription] = useState<string>("");
  const [productMRP, setProductMRP] = useState<number>(0);
  const [productMainCategory, setProductMainCategory] = useState("");
  const [productCategory, setProductCategory] = useState<string>(""); // New state for category
  const [dropzone1Images, setDropzone1Images] = useState<File[]>([]);
  const [dropzone2Images, setDropzone2Images] = useState<File[]>([]);
  const [suggestions, setSuggestions] = useState<
    { category: string; image: string }[]
  >([]);
  // const [categoryImageUrl, setCategoryImageUrl] = useState<string>("");
  const [isTooltipVisible, setIsTooltipVisible] = useState<boolean>(false);
  const [isSuggestionVisible, setIsSuggestionVisible] = useState<boolean>(false); // State for tooltip visibility
  useEffect(() => {
    const fetchSuggestions = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("product_main_category, category_product_image");

      if (error) {
        console.error("Error fetching suggestions:", error.message);
        return;
      }

      if (data) {
        // Filter duplicates based on 'product_main_category'
        const uniqueSuggestions = Array.from(
          new Map(
            data.map((item) => [item.product_main_category, item])
          ).values()
        ).map((item) => ({
          category: item.product_main_category,
          image: item.category_product_image,
        }));

        setSuggestions(uniqueSuggestions);
      }
    };

    fetchSuggestions();
  }, []);

  const handleDropzone1Drop = (acceptedFiles: File[]) => {
    setDropzone1Images([...dropzone1Images, ...acceptedFiles]);
  };

  const handleDropzone2Drop = (acceptedFiles: File[]) => {
    setDropzone2Images([...dropzone2Images, ...acceptedFiles]);
  };

  const { getRootProps: getRootProps1, getInputProps: getInputProps1 } = useDropzone({
    onDrop: handleDropzone1Drop,
  });

  const { getRootProps: getRootProps2, getInputProps: getInputProps2 } = useDropzone({
    onDrop: handleDropzone2Drop,
  });

  const handleRemoveImage = (index: number, dropzone: "dropzone1" | "dropzone2") => {
    if (dropzone === "dropzone1") {
      setDropzone1Images(dropzone1Images.filter((_, i) => i !== index));
    } else {
      setDropzone2Images(dropzone2Images.filter((_, i) => i !== index));
    }
  };


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      if (file.type !== "image/png") {
        toast.error("Only PNG images are allowed.");
        return;
      }

      if (file.name !== "image.png") {
        toast.error("The image name must be 'image.png'.");
        return;
      }

      // Only allow one file
      if (dropzone1Images.length > 0) {
        toast.error("You can upload only one image.");
        return;
      }

      setDropzone1Images([file]); // Set the uploaded image
    }
  };


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    if (
      !productName ||
      !productDescription ||
      productMRP === 0 ||
      productSP === 0 ||
      !productMainCategory ||
      !productCategory ||
      dropzone2Images.length === 0
    ) {
      toast.error("Please fill all the fields and upload at least one image");
      return;
    }
  
    // Check if any image filename ends with _first
    const hasFirstImage = dropzone2Images.some((image) =>
      image.name.match(/_first\.(png|jpeg|webp|jpg|gif)$/i)
    );
    if (!hasFirstImage) {
      toast.error("You forgot to mention the first image. Make sure one image ends with '_first'.");
      return;
    }
  
    // Encode the main category and construct the image URL
    const encodedProductMainCategory = encodeURIComponent(productMainCategory);
    const categoryImageUrl = `https://supabase.moderncomputer.in/storage/v1/object/public/product-image/product_by_category/${encodedProductMainCategory}/image.png`;
  
    // Check if folder exists for the product category
    const { data: listData, error: listError } = await supabase.storage
      .from("product-image")
      .list(`product_by_category/${productMainCategory}`);
  
    if (listError) {
      console.error("Error checking category folder:", listError.message);
      toast.error(`Error checking category folder: ${listError.message}`);
      return;
    }
  
    if (!listData || listData.length === 0) {
      // Folder does not exist, upload category images
      const uploadPromises = dropzone1Images.map(async (image) => {
        const filePath = `product_by_category/${productMainCategory}/${image.name}`;
        const { error: uploadError } = await supabase.storage
          .from("product-image")
          .upload(filePath, image);
  
        if (uploadError) {
          console.error("Error uploading image:", uploadError.message);
          toast.error(`Error uploading image: ${uploadError.message}`);
          return;
        }
      });
  
      await Promise.all(uploadPromises);
    }
  
    // Calculate product discount
    const productDiscount = Math.round(((productMRP - productSP) / productMRP) * 100);
  
    // Check for duplicate product name
    const { data: existingProducts, error: checkError } = await supabase
      .from("products")
      .select("product_name")
      .eq("product_name", productName);
  
    if (checkError) {
      console.error("Error checking product name:", checkError.message);
      toast.error(`Error checking product name: ${checkError.message}`);
      return;
    }
  
    if (existingProducts && existingProducts.length > 0) {
      toast.error("Already this product is listed");
      return;
    }
  
    const productId = uuidv4();
    const imageUrls: { url: string }[] = []; // Replace `any[]` with a proper type
  
    // Upload product images
    const uploadPromises = dropzone2Images.map(async (image) => {
      const filePath = `${productId}/${uuidv4()}_${image.name}`;
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
  
    // const calculatedSP = productMRP - (productMRP * productDiscount) / 100;
  
    // Insert product into the database
    const { error: insertError } = await supabase
      .from("products")
      .insert([
        {
          product_id: productId,
          product_image: imageUrls,
          product_name: productName,
          product_description: productDescription,
          product_MRP: Number(productMRP),
          product_discount: Number(productDiscount),
          product_SP: Number(productSP),
          product_amount: 100,
          product_category: productCategory,
          product_main_category: productMainCategory,
          category_product_image: categoryImageUrl,
        },
      ]);
  
    if (insertError) {
      console.error("Error adding product:", insertError.message);
      toast.error(`Error adding product: ${insertError.message}`);
      return;
    }
  
    toast.success("Product added successfully!");
    setProductName("");
    setProductDescription("");
    setProductMRP(0);
    setProductSP(0);
    setProductCategory("");
    setProductMainCategory("");
    setDropzone2Images([]);
  };
  


  return (
    <div className="w-full h-full flex gap-2 flex-col justify-center items-center min-h-screen p-10">
      <ToastContainer />
      <h1 className="text-center text-2xl font-bold">Add Products Here</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 w-4/5 flex flex-col rounded-md gap-5 items-center justify-between py-4 px-6"
      >
        <div className="flex flex-col w-full">
          <Autocomplete
            freeSolo
            options={suggestions}
            getOptionLabel={(option) => (typeof option === "string" ? option : option.category)}
            renderOption={(props, option) => (
              <Box
                component="li"
                {...props}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  padding: 1,
                }}
              >
                {option.image && (
                  <Image
                    src={option.image}
                    alt={option.category}
                    width={40}
                    height={40}
                    className="rounded-md"
                  />
                )}
                <span>{typeof option === "string" ? option : option.category}</span>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Type Product Category"
                variant="standard"
                required
              />
            )}
            onChange={(event, newValue) => {
              if (typeof newValue === "string") {
                setProductMainCategory(newValue);
              } else if (newValue?.category) {
                setProductMainCategory(newValue.category);
              }
            }}
            onInputChange={(event, newInputValue) => {
              setProductMainCategory(newInputValue);
            }}
            className="w-full"
          />
        </div>
        <div className="flex flex-col justify-center items-center w-full gap-6">
          <label className="font-semibold">Category Image:</label>
          {suggestions.some(suggestion => suggestion.category === productMainCategory) ? (
            <div className="flex flex-col items-center gap-4">
              <Image
                src={
                  suggestions.find(
                    suggestion => suggestion.category === productMainCategory
                  )?.image || ""
                }
                alt={`Image for ${productMainCategory}`}
                width={100}
                height={100}
                className="rounded-md"
              />
              <span>Image already exists for this category.</span>
            </div>
          ) : (
            <>
              <div
                {...getRootProps1()}
                className="border-2 border-white rounded-md bg-transparent p-4 flex-col flex items-center border-dashed w-full"
              >
                <input {...getInputProps1()} onChange={handleFileChange} />
                <CloudUpload />
                <p className="text-center">Upload category image here</p>
              </div>
              <div className="flex flex-wrap">
                {dropzone1Images.map((file, index) => (
                  <div key={index} className="relative">
                    <div className="w-24 h-24 border-2 border-dashed rounded-full flex items-center justify-center overflow-hidden m-2">
                      <Image
                        src={URL.createObjectURL(file)} // Display preview of uploaded image
                        alt={`Product Image ${index}`}
                        width={96} // Adjust size for circular image
                        height={96}
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index, "dropzone1")}
                      className="absolute top-0 right-0 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>



        <div className="flex flex-col relative w-full">
          <div
            className="flex justify-between items-center"
            onMouseOver={() => setIsTooltipVisible(true)}
            onMouseOut={() => setIsTooltipVisible(false)}
          >
            <label className="font-semibold">Product Category Code:</label>
            <BadgeInfo className=" hover:text-indigo-500 cursor-help" />
          </div>
          {isTooltipVisible && (
            <div className="absolute z-[2] w-full top-6 left-0 bg-white/50 text-white text-sm p-2 rounded custom-backdrop-filter">
              <h1 className="text-center text-indigo-500 font-bold">
                Cheatlist for Product Category
              </h1>
              <table className="border-black text-black w-full p-4 text-center">
                <thead>
                  <tr>
                    <th className="border">Product</th>
                    <th className="border">Product Category</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border">AMD Processor</td>
                    <td className="border">AMD_CPU</td>
                  </tr>
                  <tr>
                    <td className="border">Intel Processor</td>
                    <td className="border">INTEL_CPU</td>
                  </tr>
                  <tr>
                    <td className="border">Motherboard</td>
                    <td className="border">Motherboard</td>
                  </tr>
                  <tr>
                    <td className="border">RAM</td>
                    <td className="border">RAM</td>
                  </tr>
                  <tr>
                    <td className="border">SSD</td>
                    <td className="border">SSD</td>
                  </tr>
                  <tr>
                    <td className="border">Graphics Card</td>
                    <td className="border">GPU</td>
                  </tr>
                  <tr>
                    <td className="border">Cabinet</td>
                    <td className="border">Cabinet</td>
                  </tr>
                  <tr>
                    <td className="border">Power Supply</td>
                    <td className="border">PSU</td>
                  </tr>
                  <tr>
                    <td className="border">Hard Disk</td>
                    <td className="border">HDD</td>
                  </tr>
                  <tr>
                    <td className="border">Laptop</td>
                    <td className="border">Laptop</td>
                  </tr>
                  <tr>
                    <td className="border">Monitor</td>
                    <td className="border">Monitor</td>
                  </tr>
                  <tr>
                    <td className="border">Keyboard</td>
                    <td className="border">Keyboard</td>
                  </tr>
                  <tr>
                    <td className="border">Mouse</td>
                    <td className="border">Mouse</td>
                  </tr>
                  <tr>
                    <td className="border">Pendrive</td>
                    <td className="border">Pendrive</td>
                  </tr>
                  <tr>
                    <td className="border">Cooler</td>
                    <td className="border">Cooler</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          <input
            type="text"
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value)}
            required
            className="border-b-2 border-white bg-transparent outline-none pl-1 h-10"
          />
        </div>
        <div className="flex flex-col w-full">
          <label className="font-semibold">Product Name:</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
            className="border-b-2 h-10 border-white bg-transparent outline-none pl-1"
          />
        </div>
        <div className="flex flex-col w-full">
          <label className="font-semibold">Product Description:</label>
          <input
            type="text"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            required
            className="border-b-2 border-white  bg-transparent outline-none pl-1"
          />
        </div>
        <div className="flex flex-col w-full">
          <label className="font-semibold">Product MRP:</label>
          <input
            type="number"
            value={productMRP}
            onChange={(e) => setProductMRP(Number(e.target.value))}
            required
            className="border-b-2 border-white  bg-transparent pl-1 outline-none"
          />
        </div>
        <div className="flex flex-col w-full">
          <label className="font-semibold">Product Selling Price:</label>
          <input
            type="number"
            value={productSP}
            onChange={(e) => setProductSP(Number(e.target.value))}
            required
            className="border-b-2 border-white  bg-transparent pl-1 outline-none"
          />
        </div>
        <div className="flex flex-col relative w-full gap-6">
          <div
            className="flex justify-between items-center"
            onMouseOver={() => setIsSuggestionVisible(true)}
            onMouseOut={() => setIsSuggestionVisible(false)}
          >
            <label className="font-semibold">Product Images:</label>
            <BadgeInfo className="hover:text-indigo-500 cursor-help" />
          </div>
          {isSuggestionVisible && (
            <div className="absolute z-[2] top-6 left-0 bg-white/50 text-white text-sm p-2 rounded custom-backdrop-filter w-full">
              <h1 className="text-center text-indigo-500 font-bold">
                Cheatlist for Uploading Image
              </h1>
              <p className="text-center text-black">
                Remember to <b>Rename</b> the image you want to set as{" "}
                <b>First image</b>.
              </p>
              <p className="text-center text-black">
                Rename it and add{" "}
                <span className="text-indigo-500 font-bold">_first</span> at the
                end of the image name.
              </p>
              <p className="text-center text-black">
                If you have only one image, also in that case, <b>Rename</b> and
                add <span className="text-indigo-500 font-bold">_first</span> to
                that image name.
              </p>
            </div>
          )}
          <div
            {...getRootProps2()}
            className="border-2 border-white rounded-md bg-transparent p-4 flex-col flex items-center border-dashed"
          >
            <input {...getInputProps2()} multiple />
            <CloudUpload />
            <p className="text-center">Upload product image here</p>
          </div>
          <div className="flex flex-wrap">
            {dropzone2Images.map((file, index) => (
              <div key={index} className="relative">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`Product Image ${index}`}
                  className="max-h-20 max-w-20 object-cover rounded-md m-2"
                  width={500}
                  height={500}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index, "dropzone2")}
                  className="absolute top-0 right-0 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="bg-indigo-500 p-2 rounded-md hover:font-bold"
        >
          Add Product
        </button>
      </form>
    </div>
  );
};

export default ProductUploadForm;
