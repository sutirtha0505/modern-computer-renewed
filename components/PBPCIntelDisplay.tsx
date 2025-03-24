"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Product {
  id: number;
  build_type: string;
  build_name: string;
  image_urls: { url: string }[];
  additional_products: Product[];
}

const PBPCIntelDisplay: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("pre_build")
        .select("*")
        .eq("build_type", "Intel");

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        console.log("Fetched products:", data); // Log the fetched products
        setProducts(data || []);
      }
    };

    fetchProducts();
  }, []);
  const router = useRouter();

  return (
    <div className="w-full h-full flex flex-wrap justify-center items-center pb-14">
      <div className="w-[70%] p-4">
        <div className="flex flex-wrap gap-8 justify-center">
          {products.map((product) => {
            const productImage = product.image_urls?.find((img) =>
              img.url.includes("_first")
            );
            
            return productImage ? (
              <div onClick={() =>{
                router.replace(`/pre-build-pc/${product.id}`);
              }}
                key={product.id}
                className="p-2 border-2 rounded-md bg-white/50 custom-backdrop-filter justify-center items-center flex flex-col gap-3 hover:text-indigo-600 cursor-pointer"
              >
                <Image
                  src={productImage.url}
                  alt={`Product ${product.id}`}
                  className="w-60 h-40 object-cover p-2 items-center hover:scale-105 duration-300 ease-in-out"
                  width={500}
                  height={500}
                />
                <h1 className="text-center text-medium font-semibold">
                  {product.build_name}
                </h1>
                <p className="text-center text-xs font-bold text-green-400">
                  +{product.additional_products?.length || 0} gift items included
                </p>

              </div>
            ) : (
              null
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PBPCIntelDisplay;
