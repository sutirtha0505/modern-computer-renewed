"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import LoadingScreen from "./LoadingScreen";

interface FetchedProduct {
  product_id: string;
  product_name: string;
  product_image: { url: string }[];
  product_MRP: number;
  product_SP: number;
  product_discount: number;
  product_main_category?: string;
}

const truncateText = (text: string, wordLimit: number = 10) => {
  const words = text.split(" ");
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(" ") + "...";
};

const ProductCategoriesInHomePage: React.FC = () => {
  const router = useRouter();
  const [products, setProducts] = useState<FetchedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [slideWidth, setSlideWidth] = useState(300);
  const [slideHeight, setSlideHeight] = useState(384);

  // categories will be derived from products that are marked show_in_homepage
  const [categories, setCategories] = useState<string[]>([]);

  // get scroll speed based on viewport
  const getScrollSpeed = useCallback(() => {
    const width = typeof window !== "undefined" ? window.innerWidth : 1200;
    if (width < 640) return 10;
    if (width < 1024) return 100;
    return 1000;
  }, []);

  const [scrollSpeed, setScrollSpeed] = useState(1000);

  /**
   * Small subcomponent: a carousel for a single category.
   * Each instance manages its own Embla carousel and responsiveness.
   */
  const CategoryCarousel: React.FC<{ title: string; items: FetchedProduct[] }> = ({ title, items }) => {
    const [localIsMobile, setLocalIsMobile] = useState(false);
    const [localSlideWidth, setLocalSlideWidth] = useState(300);
    const [localSlideHeight, setLocalSlideHeight] = useState(384);
    const [localScrollSpeed, setLocalScrollSpeed] = useState(1000);

    const [emblaRefLocal, emblaApiLocal] = useEmblaCarousel(
      {
        loop: true,
        align: "start",
        slidesToScroll: 1,
        dragFree: true,
      },
      [
        AutoScroll({
          speed: localScrollSpeed / 500,
          direction: "forward",
          stopOnInteraction: true,
          stopOnMouseEnter: true,
          rootNode: (emblaRoot: HTMLElement) => emblaRoot,
        }),
      ]
    );

    const scrollPrevLocal = useCallback(() => {
      if (emblaApiLocal) emblaApiLocal.scrollPrev();
    }, [emblaApiLocal]);

    const scrollNextLocal = useCallback(() => {
      if (emblaApiLocal) emblaApiLocal.scrollNext();
    }, [emblaApiLocal]);

    useEffect(() => {
      const update = () => {
        const width = window.innerWidth;
        const newScroll = getScrollSpeed();
        setLocalScrollSpeed(newScroll);

        if (width < 640) {
          setLocalSlideWidth(width - 40);
          setLocalSlideHeight(300);
          setLocalIsMobile(true);
        } else if (width < 768) {
          setLocalSlideWidth((width - 40 - 16) / 2);
          setLocalSlideHeight(300);
          setLocalIsMobile(true);
        } else if (width < 1024) {
          setLocalSlideWidth((width - 40 - 32) / 3);
          setLocalSlideHeight(350);
          setLocalIsMobile(false);
        } else {
          setLocalSlideWidth((width - 40 - 48) / 4);
          setLocalSlideHeight(384);
          setLocalIsMobile(false);
        }

        if (emblaApiLocal) emblaApiLocal.reInit();
      };

      update();
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }, [emblaApiLocal]);

    if (!items || items.length === 0) return null;

    return (
      <section className="w-full">
        <h3 className="text-xl font-bold">Watch our latest <span className="text-indigo-500">{title}</span></h3>
        <div className="w-full relative mt-3">
          <button
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-slate-950 text-white p-2 rounded-full cursor-pointer z-10 hover:bg-slate-800"
            onClick={scrollPrevLocal}
            aria-label={`Previous ${title}`}
          >
            <ArrowLeft />
          </button>

          <div className="overflow-hidden" ref={emblaRefLocal}>
            <div className="flex">
              {items.map((product, idx) => {
                const productImage = product.product_image?.find((img) => img.url.includes("_first"));
                return (
                  <div key={`${product.product_id}-${idx}`} className="flex-shrink-0" style={{ width: localSlideWidth, paddingRight: 16 }}>
                    <div
                      className="border p-4 h-full flex flex-col justify-center items-center rounded-md cursor-pointer bg-indigo-300 dark:bg-gray-700"
                      onClick={() => router.push(`/product/${product.product_id}`)}
                      style={{ height: localSlideHeight }}
                    >
                      {product.product_image?.length > 0 && (
                        <Image
                          src={productImage?.url || product.product_image[0].url}
                          alt={product.product_name}
                          width={localIsMobile ? 150 : 200}
                          height={localIsMobile ? 150 : 200}
                          className="object-contain rounded-md w-60 h-60 hover:scale-105 duration-300"
                        />
                      )}
                      <h4 className="mt-2 font-bold text-center text-sm md:text-base">{truncateText(product.product_name, localIsMobile ? 6 : 10)}</h4>
                      <div className="flex gap-5 flex-wrap justify-center mt-2">
                        <p className="font-extrabold text-lg">₹{product.product_SP}</p>
                        <div className="flex gap-1 items-center">
                          <p className="line-through text-[#b8b4b4] text-sm">₹{product.product_MRP}</p>
                          <p className="font-bold text-sm text-emerald-300">({product.product_discount.toFixed(2)}%)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-slate-950 text-white p-2 rounded-full cursor-pointer z-10 hover:bg-slate-800"
            onClick={scrollNextLocal}
            aria-label={`Next ${title}`}
          >
            <ArrowRight />
          </button>
        </div>
      </section>
    );
  };

  // keep a simple responsiveness effect for initial layout values
  useEffect(() => {
    const updateResponsiveness = () => {
      const width = window.innerWidth;
      const newScroll = getScrollSpeed();
      setScrollSpeed(newScroll);

      if (width < 640) {
        setSlideWidth(width - 40);
        setSlideHeight(300);
        setIsMobile(true);
      } else if (width < 768) {
        setSlideWidth((width - 40 - 16) / 2);
        setSlideHeight(300);
        setIsMobile(true);
      } else if (width < 1024) {
        setSlideWidth((width - 40 - 32) / 3);
        setSlideHeight(350);
        setIsMobile(false);
      } else {
        setSlideWidth((width - 40 - 48) / 4);
        setSlideHeight(384);
        setIsMobile(false);
      }
    };

    updateResponsiveness();
    window.addEventListener("resize", updateResponsiveness);
    return () => window.removeEventListener("resize", updateResponsiveness);
  }, [getScrollSpeed]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      // Fetch products that are marked to show in homepage and are sellable
      const { data, error } = await supabase
        .from("products")
        .select("product_id, product_name, product_image, product_MRP, product_SP, product_discount, product_main_category, created_at, show_product, show_in_homepage")
        .eq("show_product", true)
        .eq("show_in_homepage", true)
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) {
        console.error("Error fetching category products:", error);
        setProducts([]);
        setCategories([]);
      } else {
        const fetched = (data || []) as FetchedProduct[];
        setProducts(fetched);

        // derive unique categories from fetched products (preserve original spelling)
        const uniq = Array.from(new Set(fetched.map((p) => (p.product_main_category || "").toString()).filter(Boolean)));
        uniq.sort((a, b) => a.localeCompare(b));
        setCategories(uniq);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // Log category counts for debugging (runs client-side when products change)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const counts = categories.reduce((acc: Record<string, number>, c) => {
      const count = products.filter((p) => (p.product_main_category || "").toString() === c).length;
      acc[c] = count;
      return acc;
    }, {});
    console.debug("Product category counts (homepage):", counts);
  }, [products, categories]);

  if (loading) return <LoadingScreen />;
  if (products.length === 0) return null;

  return (
    <div className="w-full h-full flex flex-col gap-6 justify-center items-center p-6">
      <h1 className="text-2xl font-bold text-indigo-500">Featured <span className="text-white">Components</span></h1>

      <div className="w-full flex flex-col gap-8">

        {categories.map((cat) => {
          const itemsForCat = products.filter((p) => (p.product_main_category || "").toString() === cat);
          return <CategoryCarousel key={cat} title={cat} items={itemsForCat} />;
        })}
      </div>
    </div>
  );
};

export default ProductCategoriesInHomePage;
