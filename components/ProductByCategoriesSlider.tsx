"use client";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { supabase } from "@/lib/supabaseClient";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Product {
  category_product_image: string;
  product_main_category: string;
}

const ProductByCategoriesSlider: React.FC = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("category_product_image, product_main_category");

      if (error) {
        console.error(error);
      } else {
        // Filter out duplicates
        const uniqueCategories = Array.from(
          new Set(data.map((product: Product) => product.product_main_category))
        );

        const uniqueProducts: Product[] = uniqueCategories.map((category) => {
          return data.find(
            (product) => product.product_main_category === category
          ) as Product;
        });

        setProducts(uniqueProducts.filter((product) => product !== undefined));
      }
    };

    fetchProducts();
  }, []);

  const settings = {
    infinite: true,
    speed: 3000,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    pauseOnHover: true,
    centerMode: true,
    adaptiveHeight: true,
    cssEase: "linear",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="w-full h-full flex items-center justify-center gap-36 flex-col p-9" id="productbycategoriesslider">
      <h1 className="text-center text-3xl font-extrabold">
        Product By <span className="text-indigo-600">Categories</span>
      </h1>
      <div className="w-full">
        <Slider {...settings}>
          {products.map((product, index) => (
            <div
              key={index}
              onClick={() => {
                router.push(
                  `/product-by-categories/${encodeURIComponent(
                    product.product_main_category
                  )}`
                );
              }}
              className="cursor-pointer hover:scale-105 ease-in-out duration-[0.5s]"
            >
              <Image
                src={product.category_product_image}
                className="w-40 h-40 mx-auto"
                alt={product.product_main_category}
                width={500}
                height={500}
              />
              <h1 className="text-center font-bold">
                {product.product_main_category}
              </h1>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default ProductByCategoriesSlider;
