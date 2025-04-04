"use client";
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Product {
  product_id: string;
  product_name: string;
  product_MRP: number;
  product_SP: number;
  product_image: { url: string }[];
}

const BestSellerSlider = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("product_id, product_name, product_MRP, product_SP, product_image")
        .eq("best_seller", true);

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data as Product[]);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const handleSlider = () => {
      const inputs = sliderRef.current?.querySelectorAll(
        'input[name="slider"]'
      ) as NodeListOf<HTMLInputElement>;
      const dots = sliderRef.current?.querySelectorAll(".dots label");
      if (inputs && dots) {
        inputs.forEach((input, index) => {
          input.addEventListener("change", () => {
            dots.forEach((dot, i) => {
              if (i === index) {
                dot.classList.add("active");
              } else {
                dot.classList.remove("active");
              }
            });
          });
        });
      }
    };

    const startAutoSlide = () => {
      const inputs = sliderRef.current?.querySelectorAll(
        'input[name="slider"]'
      ) as NodeListOf<HTMLInputElement>;
      if (inputs) {
        let currentIndex = 0;
        setInterval(() => {
          currentIndex = (currentIndex + 1) % inputs.length;
          inputs[currentIndex].checked = true;
          inputs[currentIndex].dispatchEvent(new Event("change"));
        }, 3000);
      }
    };

    handleSlider();
    startAutoSlide();
  }, [products]);

  const getProductImage = (images: { url: string }[]) => {
    return images.find((img) => img.url.includes('_first'))?.url || '';
  };

  const handleCheckOut = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center pt-10" ref={sliderRef}>
      <h1 className=" text-center font-extrabold text-4xl">Our <span className="text-indigo-500 mx-2"> Best Selling </span> Products</h1>
      <div className="container overflow-hidden scale-90 md:scale-100">
        <div className="container-wrapper">
          <div className="slider flex flex-col justify-center items-center scale-[65%] md:scale-100">
            <input
              type="radio"
              name="slider"
              id="s1"
              defaultChecked
              className="hidden"
            />
            <input type="radio" name="slider" id="s2" className="hidden" />
            <input type="radio" name="slider" id="s3" className="hidden" />
            <input type="radio" name="slider" id="s4" className="hidden" />
            <input type="radio" name="slider" id="s5" className="hidden" />
            <input type="radio" name="slider" id="s6" className="hidden" />
            <input type="radio" name="slider" id="s7" className="hidden" />

            <div className="cards">
              {products.length >= 1 && (
                <label htmlFor="s1" id="slide1" className="bg-gray-400 dark:bg-[#10172B]">
                  <div className="card">
                    <Image
                      src={getProductImage(products[0].product_image)}
                      alt={products[0].product_name}
                      width={512}
                      height={512}
                    />
                    <h1 className="text-center text-sm">{products[0].product_name}</h1>
                    <div className="price">
                      <p className=" text-medium font-extrabold">&#x20B9; {products[0].product_SP}</p>
                      <p className="font-bold opacity-50 dark:text-white/30 line-through">&#x20B9; {products[0].product_MRP}</p>
                    </div>
                    <button 
                      onClick={() => handleCheckOut(products[0].product_id)}
                      className="bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 h-10 w-28 rounded-md text-l hover:text-l hover:font-bold duration-200"
                    >
                      Check out
                    </button>
                  </div>
                </label>
              )}

              {products.length >= 2 && (
                <label htmlFor="s2" id="slide2" className="bg-gray-400 dark:bg-[#10172B]">
                  <div className="card">
                    <Image
                      src={getProductImage(products[1].product_image)}
                      alt={products[1].product_name}
                      width={512}
                      height={512}
                    />
                    <h1 className="text-center text-sm">{products[1].product_name}</h1>
                    <div className="price">
                      <p className=" text-medium font-extrabold">&#x20B9; {products[1].product_SP}</p>
                      <p className="font-bold opacity-50 dark:text-white/30 line-through">&#x20B9; {products[1].product_MRP}</p>
                    </div>
                    <button 
                      onClick={() => handleCheckOut(products[1].product_id)}
                      className="bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 h-10 w-28 rounded-md text-l hover:text-l hover:font-bold duration-200"
                    >
                      Check out
                    </button>
                  </div>
                </label>
              )}

              {products.length >= 3 && (
                <label htmlFor="s3" id="slide3" className="bg-gray-400 dark:bg-[#10172B]">
                  <div className="card">
                    <Image
                      src={getProductImage(products[2].product_image)}
                      alt={products[2].product_name}
                      width={512}
                      height={512}
                    />
                    <h1 className="text-center text-sm">{products[2].product_name}</h1>
                    <div className="price">
                      <p className=" text-medium font-extrabold">&#x20B9; {products[2].product_SP}</p>
                      <p className="font-bold opacity-50 dark:text-white/30 line-through">&#x20B9; {products[2].product_MRP}</p>
                    </div>
                    <button 
                      onClick={() => handleCheckOut(products[2].product_id)}
                      className="bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 h-10 w-28 rounded-md text-l hover:text-l hover:font-bold duration-200"
                    >
                      Check out
                    </button>
                  </div>
                </label>
              )}

              {products.length >= 4 && (
                <label htmlFor="s4" id="slide4" className="bg-gray-400 dark:bg-[#10172B]">
                  <div className="card">
                    <Image
                      src={getProductImage(products[3].product_image)}
                      alt={products[3].product_name}
                      width={512}
                      height={512}
                    />
                    <h1 className="text-center text-sm">{products[3].product_name}</h1>
                    <div className="price">
                      <p className=" text-medium font-extrabold">&#x20B9; {products[3].product_SP}</p>
                      <p className="font-bold opacity-50 dark:text-white/30 line-through">&#x20B9; {products[3].product_MRP}</p>
                    </div>
                    <button 
                      onClick={() => handleCheckOut(products[3].product_id)}
                      className="bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 h-10 w-28 rounded-md text-l hover:text-l hover:font-bold duration-200"
                    >
                      Check out
                    </button>
                  </div>
                </label>
              )}

              {products.length >= 5 && (
                <label htmlFor="s5" id="slide5" className="bg-gray-400 dark:bg-[#10172B]">
                  <div className="card">
                    <Image
                      src={getProductImage(products[4].product_image)}
                      alt={products[4].product_name}
                      width={512}
                      height={512}
                    />
                    <h1 className="text-center text-sm">{products[4].product_name}</h1>
                    <div className="price">
                      <p className=" text-medium font-extrabold">&#x20B9; {products[4].product_SP}</p>
                      <p className="font-bold opacity-50 dark:text-white/30 line-through">&#x20B9; {products[4].product_MRP}</p>
                    </div>
                    <button 
                      onClick={() => handleCheckOut(products[4].product_id)}
                      className="bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 h-10 w-28 rounded-md text-l hover:text-l hover:font-bold duration-200"
                    >
                      Check out
                    </button>
                  </div>
                </label>
              )}

              {products.length >= 6 && (
                <label htmlFor="s6" id="slide6" className="bg-gray-400 dark:bg-[#10172B]">
                  <div className="card">
                    <Image
                      src={getProductImage(products[5].product_image)}
                      alt={products[5].product_name}
                      height={512}
                      width={512}
                    />
                    <h1 className="text-center text-sm">{products[5].product_name}</h1>
                    <div className="price">
                      <p className=" text-medium font-extrabold">&#x20B9; {products[5].product_SP}</p>
                      <p className="font-bold opacity-50 dark:text-white/30 line-through">&#x20B9; {products[5].product_MRP}</p>
                    </div>
                    <button 
                      onClick={() => handleCheckOut(products[5].product_id)}
                      className="bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 h-10 w-28 rounded-md text-l hover:text-l hover:font-bold duration-200"
                    >
                      Check out
                    </button>
                  </div>
                </label>
              )}

              {products.length >= 7 && (
                <label htmlFor="s7" id="slide7" className="bg-gray-400 dark:bg-[#10172B]">
                  <div className="card">
                    <Image
                      src={getProductImage(products[6].product_image)}
                      alt={products[6].product_name}
                      width={512}
                      height={512}
                    />
                    <h1 className="text-center text-sm">{products[6].product_name}</h1>
                    <div className="price">
                      <p className=" text-medium font-extrabold">&#x20B9; {products[6].product_SP}</p>
                      <p className="font-bold opacity-50 dark:text-white/30 line-through">&#x20B9; {products[6].product_MRP}</p>
                    </div>
                    <button 
                      onClick={() => handleCheckOut(products[6].product_id)}
                      className="bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 h-10 w-28 rounded-md text-l hover:text-l hover:font-bold duration-200"
                    >
                      Check out
                    </button>
                  </div>
                </label>
              )}
            </div>

            <div className="dots">
              <label htmlFor="s1" className="active"></label>
              <label htmlFor="s2"></label>
              <label htmlFor="s3"></label>
              <label htmlFor="s4"></label>
              <label htmlFor="s5"></label>
              <label htmlFor="s6"></label>
              <label htmlFor="s7"></label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestSellerSlider;
