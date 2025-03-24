"use client";
import { Heart } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Product } from "@/types/types";

// interface Product {
//   product_id: string;
//   product_name: string;
//   product_image: { url: string }[];
//   product_SP: number; // Selling price
//   product_MRP: number; // Maximum retail price
//   product_amount: number; // Available stock
//   show_product: string;
// }
const ProductCard = ({ products }: { products: Product }) => {
  const [isHeartFilled, setIsHeartFilled] = useState(false);
  const router = useRouter();
  const productImage = products.product_image.find((img) =>
    img.url.includes("_first")
  );

  const handleHeartClick = () => {
    setIsHeartFilled(!isHeartFilled);
  };

  const renderProductAmount = () => {
    if (products.product_amount === 0) {
      return (
        <div className="relative bg-gray-300 filter grayscale w-60 h-80 flex flex-col gap-3 p-2 items-center rounded-md custom-backdrop-filter">
          <div
            className="absolute z-[2] bg-white/70 rounded-full p-1 top-1 right-1 cursor-pointer"
            onClick={handleHeartClick}
          >
            <Heart
              className={
                isHeartFilled ? "text-red-500 fill-current" : "text-red-500"
              }
            />
          </div>
          <div className="w-44 h-96 flex items-center overflow-hidden object-fill">
            <Image
              src={productImage?.url || ""}
              width={200}
              height={100}
              alt={products.product_name}
              className="transition duration-300 ease-in-out rounded-sm hover:scale-110"
            />
          </div>
          <h1 className="text-sm text-center">{`${products.product_name.substring(
            0,
            70
          )}...`}</h1>
          <div className="flex justify-between gap-6">
            <p>&#x20B9;{`${products.product_SP}`}</p>
            <p className="text-[#b8b4b4] line-through select-none">
              &#x20B9;{`${products.product_MRP}`}
            </p>
          </div>
          <p className="text-xs font-bold text-red-500">
            {products.product_amount} items left
          </p>
          <button
            className="bg-gradient-to-br from-purple-600 to-blue-500 cursor-not-allowed opacity-50 focus:ring-4 focus:outline-none focus:ring-blue-300 h-32 w-36 rounded-md text-xs hover:text-xs hover:font-bold duration-200"
            disabled
          >
            Check out
          </button>
        </div>
      );
    } else if (products.product_amount < 5) {
      return (
        <div
          className="relative bg-white/50 w-60 h-80 flex flex-col gap-3 p-2 items-center rounded-md custom-backdrop-filter cursor-pointer"
          onClick={() => router.push(`/product/${products.product_id}`)}
        >
          <div
            className="absolute z-[2] bg-white/70 rounded-full p-1 top-1 right-1 cursor-pointer"
            onClick={handleHeartClick}
          >
            <Heart
              className={
                isHeartFilled ? "text-red-500 fill-current" : "text-red-500"
              }
            />
          </div>
          <div className="w-44 h-96 flex items-center overflow-hidden object-fill">
            <Image
              src={productImage?.url || ""}
              width={200}
              height={100}
              alt={products.product_name}
              className="transition duration-300 ease-in-out rounded-sm hover:scale-110"
            />
          </div>
          <h1 className="text-sm text-center">{`${products.product_name.substring(
            0,
            70
          )}...`}</h1>
          <div className="flex justify-between gap-6">
            <p>&#x20B9;{`${products.product_SP}`}</p>
            <p className="text-[#b8b4b4] line-through select-none">
              &#x20B9;{`${products.product_MRP}`}
            </p>
          </div>
          <p className="text-xs font-bold text-red-500">
            {products.product_amount} items left
          </p>
          <button
            className="bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 h-32 w-36 rounded-md text-xs hover:text-xs hover:font-bold duration-200"
            onClick={() => router.push(`/product/${products.product_id}`)}
          >
            Check out
          </button>
        </div>
      );
    } else {
      return (
        <div
          className="relative bg-white/50 w-60 h-80 flex flex-col gap-3 p-2 items-center rounded-md custom-backdrop-filter cursor-pointer"
          onClick={() => router.push(`/product/${products.product_id}`)}
        >
          <div
            className="absolute z-[2] bg-white/70 rounded-full p-1 top-1 right-1 cursor-pointer"
            onClick={handleHeartClick}
          >
            <Heart
              className={
                isHeartFilled ? "text-red-500 fill-current" : "text-red-500"
              }
            />
          </div>
          <div className="w-44 h-96 flex items-center overflow-hidden object-fill">
            <Image
              src={productImage?.url || ""}
              width={200}
              height={100}
              alt={products.product_name}
              className="transition duration-300 ease-in-out rounded-sm hover:scale-110"
            />
          </div>
          <h1 className="text-sm text-center">{`${products.product_name.substring(
            0,
            70
          )}...`}</h1>
          <div className="flex justify-between gap-6">
            <p>&#x20B9;{`${products.product_SP}`}</p>
            <p className="text-[#b8b4b4] line-through select-none">
              &#x20B9;{`${products.product_MRP}`}
            </p>
          </div>
          <button
            className="bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 h-32 w-36 rounded-md text-xs hover:text-xs hover:font-bold duration-200"
            onClick={() => router.push(`/product/${products.product_id}`)}
          >
            Check out
          </button>
        </div>
      );
    }
  };

  return renderProductAmount();
};

export default ProductCard;
