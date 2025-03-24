"use client";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import React, { useEffect, useState } from "react";

type PreBuild = {
  id: number;
  build_name: string;
  build_type: string;
  selling_price: number;
  processor: string;
  motherboard: string;
  ram: string;
  ram_quantity: number;
  ssd: string;
  graphics_card: string;
  cabinet: string;
  psu: string;
  hdd: string;
  cooling_system: string;
  additional_products: string[];
  image_urls: { url: string }[];
};

type Product = {
  product_id: string;
  product_image: { url: string }[];
  product_name: string;
};

const PreBuildTable = () => {
  const [prebuilds, setPreBuilds] = useState<PreBuild[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingBuildId, setEditingBuildId] = useState<number | null>(null);
  const [editingBuildName, setEditingBuildName] = useState<string>("");
  const [editingSellingPrice, setEditingSellingPrice] = useState<number>(0);

  useEffect(() => {
    fetchPreBuilds();
    fetchProducts();
  }, []);

  const fetchPreBuilds = async () => {
    try {
      const { data, error } = await supabase.from("pre_build").select("*");
      if (error) {
        throw error;
      }
      setPreBuilds(data);
    } catch (error) {
      console.error("Error fetching pre-builds:", (error as Error).message);
    }
  };

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

  const getProductNameById = (productId: string) => {
    const product = products.find(
      (product) => product.product_id === productId
    );
    return product ? product.product_name : "No product is added";
  };

  const getProductImageByID = (productId: string) => {
    const product = products.find(
      (product) => product.product_id === productId
    );
    if (product) {
      const imageUrl = product.product_image.find((img) =>
        img.url.includes("_first")
      )?.url;
      return imageUrl ? imageUrl : "default_image_url";
    } else {
      return "https://supabase.moderncomputer.in/storage/v1/object/public/product-image/menu-icons/products.png"; // replace with your default image URL
    }
  };

  const startEditingBuild = (build: PreBuild) => {
    setEditingBuildId(build.id);
    setEditingBuildName(build.build_name);
    setEditingSellingPrice(build.selling_price);
  };

  const saveBuild = async (buildId: number) => {
    try {
      const { error } = await supabase
        .from("pre_build")
        .update({
          build_name: editingBuildName,
          selling_price: editingSellingPrice,
        })
        .eq("id", buildId);
      if (error) {
        throw error;
      }

      // Update state with the new build details
      setPreBuilds(
        prebuilds.map((build) =>
          build.id === buildId
            ? { ...build, build_name: editingBuildName, selling_price: editingSellingPrice }
            : build
        )
      );
      setEditingBuildId(null); // stop editing
    } catch (error) {
      console.error("Error saving build:", (error as Error).message);
    }
  };

  const deleteBuild = async (buildId: number) => {
    try {
      const { error } = await supabase
        .from("pre_build")
        .delete()
        .eq("id", buildId);
      if (error) {
        throw error;
      }

      // Update state to remove the deleted build
      setPreBuilds(prebuilds.filter((build) => build.id !== buildId));
    } catch (error) {
      console.error("Error deleting build:", (error as Error).message);
    }
  };

  const truncateProductName = (productName: string, wordLimit: number) => {
    const words = productName.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : productName;
  };

  return (
    <div className="p-4 flex flex-col">
      <h1 className="text-2xl mb-4 text-center font-extrabold ">
        <span className="text-indigo-500">Pre-Build</span> PC Table
      </h1>
      <div className="w-full overflow-x-auto">
        <table className="border">
          <thead>
            <tr>
              <th className="py-2 border">Build Type</th>
              <th className="py-2 border">Build Name</th>
              <th className="py-2 border">Product Image</th>
              <th className="py-2 border">Processor</th>
              <th className="py-2 border">Motherboard</th>
              <th className="py-2 border">RAM</th>
              <th className="py-2 border">SSD</th>
              <th className="py-2 border">Graphics Card</th>
              <th className="py-2 border">HDD</th>
              <th className="py-2 border">Cooling Systems</th>
              <th className="py-2 border">PSU</th>
              <th className="py-2 border">Cabinet</th>
              <th className="py-2 border">Gift Items</th>
              <th className="py-2 border">Selling Price</th>
              <th className="py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {prebuilds.map((build) => (
              <tr key={build.id}>
                <td className="border px-4 py-2">{build.build_type}</td>
                <td className="border px-4 py-2">
                  {editingBuildId === build.id ? (
                    <input
                      type="text"
                      value={editingBuildName}
                      onChange={(e) => setEditingBuildName(e.target.value)}
                      className=" w-20 bg-inherit border px-2 py-1"
                    />
                  ) : (
                    build.build_name
                  )}
                </td>
                <td className="border px-4 py-2">
                  {build.image_urls.map((image_url, index) => (
                    <div key={index} className="relative flex flex-col w-full">
                      <Image
                        src={image_url.url}
                        alt={`Build ${build.id} Image ${index}`}
                        className="max-h-60 max-w-60 object-cover rounded-md"
                        width={200}
                        height={200}
                      />
                    </div>
                  ))}
                </td>
                <td className=" border px-4 py-2">
                  <Image
                    src={getProductImageByID(build.processor)}
                    alt={getProductNameById(build.processor)}
                    className="w-16 h-16 mx-auto"
                    width={200}
                    height={200}
                  />
                  {truncateProductName(getProductNameById(build.processor), 5)}
                </td>

                <td className="border px-4 py-2">
                  <Image
                    src={getProductImageByID(build.motherboard)}
                    alt={getProductNameById(build.motherboard)}
                    className="w-16 h-16 mx-auto"
                    width={200}
                    height={200}
                  />
                  {truncateProductName(getProductNameById(build.motherboard), 5)}
                </td>

                <td className="border px-4 py-2">
                  <Image
                    src={getProductImageByID(build.ram)}
                    alt={getProductNameById(build.ram)}
                    className="w-16 h-16 mx-auto"
                    width={200}
                    height={200}
                  />
                  {truncateProductName(getProductNameById(build.ram), 5)} X{" "}
                  {build.ram_quantity}
                </td>

                <td className="border px-4 py-2">
                  <Image
                    src={getProductImageByID(build.ssd)}
                    alt={getProductNameById(build.ssd)}
                    className="w-16 h-16 mx-auto"
                    width={200}
                    height={200}
                  />
                  {truncateProductName(getProductNameById(build.ssd), 5)}
                </td>

                <td className="border px-4 py-2">
                  <Image
                    src={getProductImageByID(build.graphics_card)}
                    alt={getProductNameById(build.graphics_card)}
                    className="w-16 h-16 mx-auto"
                    width={200}
                    height={200}
                  />
                  {truncateProductName(getProductNameById(build.graphics_card), 5)}
                </td>

                <td className="border px-4 py-2">
                  <Image
                    src={getProductImageByID(build.hdd)}
                    alt={getProductNameById(build.hdd)}
                    className="w-16 h-16 mx-auto"
                    width={200}
                    height={200}
                  />
                  {truncateProductName(getProductNameById(build.hdd), 5)}
                </td>

                <td className="border px-4 py-2">
                  <Image
                    src={getProductImageByID(build.cooling_system)}
                    alt={getProductNameById(build.cooling_system)}
                    className="w-16 h-16 mx-auto"
                    width={200}
                    height={200}
                  />
                  {truncateProductName(getProductNameById(build.cooling_system), 5)}
                </td>

                <td className="border px-4 py-2">
                  <Image
                    src={getProductImageByID(build.psu)}
                    alt={getProductNameById(build.psu)}
                    className="w-16 h-16 mx-auto"
                    width={200}
                    height={200}
                  />
                  {truncateProductName(getProductNameById(build.psu), 5)}
                </td>

                <td className="border px-4 py-2">
                  <Image
                    src={getProductImageByID(build.cabinet)}
                    alt={getProductNameById(build.cabinet)}
                    className="w-16 h-16 mx-auto"
                    width={200}
                    height={200}
                  />
                  {truncateProductName(getProductNameById(build.cabinet), 5)}
                </td>

                <td className="border px-4 py-2">
                  {build.additional_products.map((product, index) => (
                    <React.Fragment key={index}>
                      <div key={product}>
                        <Image
                          src={getProductImageByID(product)}
                          alt={getProductNameById(product)}
                          className="w-8 h-8 mr-2"
                          width={200}
                          height={200}
                        />
                        {truncateProductName(getProductNameById(product), 3)}
                      </div>
                      {index < build.additional_products.length - 1}
                    </React.Fragment>
                  ))}
                </td>

                <td className="border px-4 py-2">
                  {editingBuildId === build.id ? (
                    <input
                      type="number"
                      value={editingSellingPrice}
                      onChange={(e) =>
                        setEditingSellingPrice(parseFloat(e.target.value))
                      }
                      className=" w-20 bg-transparent border px-2 py-1"
                    />
                  ) : (
                    `₹${build.selling_price}`
                  )}
                </td>

                <td className="border px-4 py-2 justify-center">
                  {editingBuildId === build.id ? (
                    <div className="flex flex-col gap-2">
                      <button
                        className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => saveBuild(build.id)}
                      >
                        Save
                      </button>
                      <button
                        className="w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => setEditingBuildId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <button
                        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => startEditingBuild(build)}
                      >
                        Edit
                      </button>
                      <button
                        className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => deleteBuild(build.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PreBuildTable;
