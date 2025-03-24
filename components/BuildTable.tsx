"use client"
import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

const CustomBuildTable = () => {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchBuilds();
    fetchProducts();
  }, []);

  const fetchBuilds = async () => {
    try {
      const { data, error } = await supabase.from("custom_build").select("*");

      if (error) {
        throw error;
      }

      setBuilds(data);
    } catch (error) {
      console.error("Error fetching builds:", (error as Error).message);
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
    if (product) {
      return product.product_name;
    } else {
      return "Unknown";
    }
  };

  const getProductImageById = (productId: string) => {
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

  const truncateProductName = (productName: string, wordLimit: number) => {
    const words = productName.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : productName;
  };

  const router = useRouter();

  const editBuild = useCallback(
    (buildId: number) => {
      router.push(`/admin/edit-custom-build-combi/${buildId}`);
    },
    [router]
  );

  const deleteBuild = async (buildId: number) => {
    try {
      const { error } = await supabase
        .from("custom_build")
        .delete()
        .eq("id", buildId);

      if (error) {
        throw error;
      }

      // Update state to remove the deleted build
      setBuilds(builds.filter((build) => build.id === buildId));
    } catch (error) {
      console.error("Error deleting build:", (error as Error).message);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4 text-center font-bold"><span className="text-indigo-600">Custom PC</span> Build Combinations</h1>
      <div className="flex items-center justify-start overflow-x-auto">
        <table className="">
          <thead>
            <tr>
              <th className="py-2 border text-indigo-600">Build Type</th>
              <th className="py-2 border text-indigo-600">Processor</th>
              <th className="py-2 border text-indigo-600">Motherboards</th>
              <th className="py-2 border text-indigo-600">RAM</th>
              <th className="py-2 border text-indigo-600">SSD</th>
              <th className="py-2 border text-indigo-600">Graphics Cards</th>
              <th className="py-2 border text-indigo-600">Cabinets</th>
              <th className="py-2 border text-indigo-600">PSU</th>
              <th className="py-2 border text-indigo-600">HDD</th>
              <th className="py-2 border text-indigo-600">Cooling Systems</th>
              <th className="py-2 border text-indigo-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {builds.map((build) => (
              <tr key={build.id}>
                <td className="border px-4 py-2">{build.build_type}</td>
                <td className="border px-4 py-2">
                  <Image
                    src={getProductImageById(build.processor)}
                    alt={getProductNameById(build.processor)}
                    className="w-16 h-16 mx-auto"
                    width={512}
                    height={512}
                  />
                  {truncateProductName(getProductNameById(build.processor), 5)}
                </td>
                <td className="border px-4 py-2">
                  {build.motherboards.map((item, index) => (
                    <React.Fragment key={index}>
                      <div>
                        <Image
                          src={getProductImageById(item)}
                          alt={getProductNameById(item)}
                          className="w-16 h-16 mx-auto"
                          height={512}
                          width={512}
                        />
                        {truncateProductName(getProductNameById(item), 5)}
                      </div>
                      {index < build.motherboards.length - 1 && (
                        <hr className="my-2 border-t-1" />
                      )}
                    </React.Fragment>
                  ))}
                </td>
                <td className="border px-4 py-2">
                  {build.ram.map((item, index) => (
                    <React.Fragment key={index}>
                      <div>
                        <Image
                          src={getProductImageById(item)}
                          alt={getProductNameById(item)}
                          className="w-16 h-16 mx-auto"
                          width={512}
                          height={512}
                        />
                        {truncateProductName(getProductNameById(item), 5)}
                      </div>
                      {index < build.ram.length - 1 && (
                        <hr className="my-2 border-t-1" />
                      )}
                    </React.Fragment>
                  ))}
                </td>
                <td className="border px-4 py-2">
                  {build.ssd.map((item, index) => (
                    <React.Fragment key={index}>
                      <div>
                        <Image
                          src={getProductImageById(item)}
                          alt={getProductNameById(item)}
                          className="w-16 h-16 mx-auto"
                          width={512}
                          height={512}
                        />
                        {truncateProductName(getProductNameById(item), 5)}
                      </div>
                      {index < build.ssd.length - 1 && (
                        <hr className="my-2 border-t-1" />
                      )}
                    </React.Fragment>
                  ))}
                </td>
                <td className="border px-4 py-2">
                  {build.graphics_cards.map((item, index) => (
                    <React.Fragment key={index}>
                      <div>
                        <Image
                          src={getProductImageById(item)}
                          alt={getProductNameById(item)}
                          className="w-16 h-16 mx-auto"
                          width={512}
                          height={512}
                        />
                        {truncateProductName(getProductNameById(item), 5)}
                      </div>
                      {index < build.graphics_cards.length - 1 && (
                        <hr className="my-2 border-t-1" />
                      )}
                    </React.Fragment>
                  ))}
                </td>
                <td className="border px-4 py-2">
                  {build.cabinets.map((item, index) => (
                    <React.Fragment key={index}>
                      <div>
                        <Image
                          src={getProductImageById(item)}
                          alt={getProductNameById(item)}
                          className="w-16 h-16 mx-auto"
                          height={512}
                          width={512}
                        />
                        {truncateProductName(getProductNameById(item), 5)}
                      </div>
                      {index < build.cabinets.length - 1 && (
                        <hr className="my-2 border-t-1" />
                      )}
                    </React.Fragment>
                  ))}
                </td>
                <td className="border px-4 py-2">
                  {build.psu.map((item, index) => (
                    <React.Fragment key={index}>
                      <div>
                        <Image
                          src={getProductImageById(item)}
                          alt={getProductNameById(item)}
                          className="w-16 h-16 mx-auto"
                          height={512}
                          width={512}
                        />
                        {truncateProductName(getProductNameById(item), 5)}
                      </div>
                      {index < build.psu.length - 1 && (
                        <hr className="my-2 border-t-1" />
                      )}
                    </React.Fragment>
                  ))}
                </td>
                <td className="border px-4 py-2">
                  {build.hdd.map((item, index) => (
                    <React.Fragment key={index}>
                      <div>
                        <Image
                          src={getProductImageById(item)}
                          alt={getProductNameById(item)}
                          className="w-16 h-16 mx-auto"
                          width={512}
                          height={512}
                        />
                        {truncateProductName(getProductNameById(item), 5)}
                      </div>
                      {index < build.hdd.length - 1 && (
                        <hr className="my-2 border-t-1" />
                      )}
                    </React.Fragment>
                  ))}
                </td>
                <td className="border px-4 py-2">
                  {build.cooling_systems.map((item, index) => (
                    <React.Fragment key={index}>
                      <div>
                        <Image
                          src={getProductImageById(item)}
                          alt={getProductNameById(item)}
                          className="w-16 h-16 mx-auto"
                          width={512}
                          height={512}
                        />
                        {truncateProductName(getProductNameById(item), 5)}
                      </div>
                      {index < build.cooling_systems.length - 1 && (
                        <hr className="my-2 border-t-1" />
                      )}
                    </React.Fragment>
                  ))}
                </td>
                <td className="border px-4 py-2">
                  <div className="flex flex-col items-center gap-10">
                    <button
                      onClick={() => editBuild(build.id)}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      onClick={() => deleteBuild(build.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomBuildTable;
