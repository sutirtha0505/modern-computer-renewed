"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface SingleProduct {
  product_id: string;
  product_name: string;
  product_SP: number;
  product_MRP: number;
  product_image?: { url: string }[];
  product_description: string;
  quantity: number;
  product_discount: number;
  product_amount: number;
  product_main_category?: string;
  show_product?: boolean;
}

interface FetchedProduct {
  product_id: string;
  product_name: string;
  product_image: { url: string }[];
  product_MRP: number;
  product_SP: number;
  product_discount: number;
}

interface SimilarProductsProps {
  singleProduct: SingleProduct;
}

const truncateText = (text: string, wordLimit: number = 10) => {
  const words = text.split(" ");
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(" ") + "...";
};

const SimilarProducts: React.FC<SimilarProductsProps> = ({ singleProduct }) => {
  const router = useRouter();
  const [similarProducts, setSimilarProducts] = useState<FetchedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(1); // start at 1 (first real slide)
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  const slideWidth = 384;
  const slideHeight = 384;
  const gap = 16;

  const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);
  const isHovered = useRef(false);

  // Fetch similar products
  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!singleProduct?.product_main_category) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("product_id, product_name, product_image, product_MRP, product_SP, product_discount")
        .eq("product_main_category", singleProduct.product_main_category)
        .neq("product_id", singleProduct.product_id)
        .eq("show_product", true);

      if (error) {
        console.error("Error fetching:", error);
      } else {
        setSimilarProducts(data as FetchedProduct[]);
      }
      setLoading(false);
    };

    fetchSimilarProducts();
  }, [singleProduct]);

  // Infinite loop scroll handling
  useEffect(() => {
    const total = similarProducts.length;

    if (total === 0) return;

    const transitionTime = 500;
    let timeout: NodeJS.Timeout;

    if (currentIndex === total + 1) {
      // If we hit the fake first clone at the end
      timeout = setTimeout(() => {
        setTransitionEnabled(false);
        setCurrentIndex(1); // jump to real first
      }, transitionTime);
    }

    if (currentIndex === 0) {
      // If we hit the fake last clone at the beginning
      timeout = setTimeout(() => {
        setTransitionEnabled(false);
        setCurrentIndex(total); // jump to real last
      }, transitionTime);
    }

    return () => clearTimeout(timeout);
  }, [currentIndex, similarProducts.length]);

  // Re-enable transition after jump
  useEffect(() => {
    if (!transitionEnabled) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransitionEnabled(true);
        });
      });
    }
  }, [transitionEnabled]);

  // Auto-scroll
  const handleNext = useCallback(() => {
    if (similarProducts.length === 0) return;
    setCurrentIndex((prev) => prev + 1);
  }, [similarProducts]);

  const handlePrev = () => {
    if (similarProducts.length === 0) return;
    setCurrentIndex((prev) => prev - 1);
  };

  useEffect(() => {
    if (similarProducts.length === 0) return;

    autoScrollInterval.current = setInterval(() => {
      if (!isHovered.current) {
        handleNext();
      }
    }, 3000);

    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
        autoScrollInterval.current = null;
      }
    };
  }, [handleNext, similarProducts]);

  if (loading) return <div>Loading similar products...</div>;
  if (similarProducts.length === 0) return <div>No similar products found.</div>;

  // Clones for seamless scroll
  const extendedSlides = [
    similarProducts[similarProducts.length - 1], // clone last
    ...similarProducts,
    similarProducts[0], // clone first
  ];

  const containerStyle = {
    transform: `translateX(-${currentIndex * (slideWidth + gap)}px)`,
    transition: transitionEnabled ? "transform 0.5s ease" : "none",
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 justify-center items-center">
      <h1 className="text-xl font-bold text-indigo-500">Similar Products</h1>
      <div
        className="relative overflow-hidden w-full"
        onMouseEnter={() => (isHovered.current = true)}
        onMouseLeave={() => (isHovered.current = false)}
      >
        <div className="flex" style={containerStyle}>
          {extendedSlides.map((product, index) => {
            const productImage = product.product_image.find((img) => img.url.includes("_first"));
            return (
              <div
                key={`${product.product_id}-${index}`}
                className="flex-shrink-0"
                style={{ width: slideWidth, height: slideHeight, marginRight: gap }}
              >
                <div
                  className="border p-4 h-full w-full flex flex-col justify-center items-center rounded-md cursor-pointer bg-indigo-300 dark:bg-gray-700"
                  onClick={() => router.push(`/product/${product.product_id}`)}
                >
                  {product.product_image?.length > 0 && (
                    <Image
                      src={productImage?.url || product.product_image[0].url}
                      alt={product.product_name}
                      width={200}
                      height={200}
                      className="object-contain rounded-md w-60 h-60 hover:scale-125 duration-500"
                    />
                  )}
                  <h2 className="mt-2 font-bold">{truncateText(product.product_name)}</h2>
                  <div className="flex gap-5">
                    <p className="font-extrabold text-xl">₹{product.product_SP}</p>
                    <div className="flex gap-1">
                      <p className="line-through text-[#b8b4b4] text-sm">₹{product.product_MRP}</p>
                      <p className="font-bold text-sm text-emerald-300">
                        ({product.product_discount.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Arrows */}
        <button
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-slate-950 text-white p-2 rounded-full cursor-pointer"
          onClick={handlePrev}
        >
          <ArrowLeft />
        </button>
        <button
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-slate-950 text-white p-2 rounded-full cursor-pointer"
          onClick={handleNext}
        >
          <ArrowRight />
        </button>
      </div>
    </div>
  );
};

export default SimilarProducts;
