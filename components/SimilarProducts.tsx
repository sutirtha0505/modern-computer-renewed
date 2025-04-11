"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';
import LoadingScreen from "./LoadingScreen";

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
  const [isMobile, setIsMobile] = useState(false);
  const [slideWidth, setSlideWidth] = useState(300);
  const [slideHeight, setSlideHeight] = useState(384);

  // Get the appropriate scroll speed based on device width
  const getScrollSpeed = useCallback(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
    
    // Set scroll speed based on device width (lower values = faster scrolling)
    if (width < 640) { // Mobile phone
      return 10; 
    } else if (width < 1024) { // Tablet
      return 100;
    } else { // Desktop
      return 1000;
    }
  }, []);

  const [scrollSpeed, setScrollSpeed] = useState(1000);
  
  // Embla carousel setup with AutoScroll plugin
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'start',
      slidesToScroll: 1,
      dragFree: true,
    },
    [
      AutoScroll({ 
        speed: scrollSpeed / 500, // Increased speed factor (was /10000)
        direction: 'forward',
        stopOnInteraction: true,
        stopOnMouseEnter: true,
        rootNode: (emblaRoot: HTMLElement) => emblaRoot
      })
    ]
  );

  // Scroll to previous slide
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);
  
  // Scroll to next slide
  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Update responsive dimensions and scroll speed
  useEffect(() => {
    const updateResponsiveness = () => {
      const width = window.innerWidth;
      
      // Update scroll speed
      const newScrollSpeed = getScrollSpeed();
      setScrollSpeed(newScrollSpeed);
      
      // Update dimensions based on screen size
      if (width < 640) { // Small mobile
        setSlideWidth(width - 40); // Full width minus padding
        setSlideHeight(300);
        setIsMobile(true);
      } else if (width < 768) { // Mobile
        setSlideWidth((width - 40 - 16) / 2); // Account for gap
        setSlideHeight(300);
        setIsMobile(true);
      } else if (width < 1024) { // Tablet
        setSlideWidth((width - 40 - 32) / 3); // Account for gaps
        setSlideHeight(350);
        setIsMobile(false);
      } else { // Desktop
        setSlideWidth((width - 40 - 48) / 4); // Account for gaps
        setSlideHeight(384);
        setIsMobile(false);
      }
      
      // Update Embla plugin if available
      if (emblaApi) {
        emblaApi.reInit();
      }
    };
    
    updateResponsiveness();
    window.addEventListener('resize', updateResponsiveness);
    return () => window.removeEventListener('resize', updateResponsiveness);
  }, [emblaApi, getScrollSpeed]);

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

  if (loading) return <LoadingScreen />;
  if (similarProducts.length === 0) return <div className="text-2xl font-bold w-full h-full flex justify-center items-center">No similar products found.</div>;

  return (
    <div className="w-full h-full flex flex-col gap-6 justify-center items-center p-6">
      <h1 className="text-xl font-bold text-indigo-500">Similar Products</h1>
      
      <div className="w-full relative">
        {/* Previous button */}
        <button
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-slate-950 text-white p-2 rounded-full cursor-pointer z-10 hover:bg-slate-800"
          onClick={scrollPrev}
          aria-label="Previous item"
        >
          <ArrowLeft />
        </button>
        
        {/* Embla carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {similarProducts.map((product, index) => {
            const productImage = product.product_image.find((img) => img.url.includes("_first"));
            return (
              <div
                key={`${product.product_id}-${index}`}
                className="flex-shrink-0"
                  style={{ 
                    width: slideWidth, 
                    paddingRight: 16, // Apply consistent padding to all slides for proper looping
                  }}
              >
                <div
                    className="border p-4 h-full flex flex-col justify-center items-center rounded-md cursor-pointer bg-indigo-300 dark:bg-gray-700"
                  onClick={() => router.push(`/product/${product.product_id}`)}
                    style={{ height: slideHeight }}
                >
                  {product.product_image?.length > 0 && (
                    <Image
                      src={productImage?.url || product.product_image[0].url}
                      alt={product.product_name}
                        width={isMobile ? 150 : 200}
                        height={isMobile ? 150 : 200}
                      className="object-contain rounded-md w-60 h-60 hover:scale-125 duration-500"
                    />
                  )}
                    <h2 className="mt-2 font-bold text-center">
                      {truncateText(product.product_name, isMobile ? 5 : 10)}
                    </h2>
                    <div className="flex gap-5 flex-wrap justify-center">
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
        </div>

        {/* Next button */}
        <button
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-slate-950 text-white p-2 rounded-full cursor-pointer z-10 hover:bg-slate-800"
          onClick={scrollNext}
          aria-label="Next item"
        >
          <ArrowRight />
        </button>
      </div>
    </div>
  );
};

export default SimilarProducts;
