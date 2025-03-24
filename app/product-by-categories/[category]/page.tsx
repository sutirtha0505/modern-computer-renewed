"use client";
import ProductByCategoriesItemList from "@/components/ProductByCategoriesItemList";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface Product {
  product_id: string;
  product_MRP: number;
  product_SP: number;
  product_amount: number;
  product_image: { url: string }[];
  product_name: string;
  show_product: string;
}

const ProductByCategoriesItemListPage = () => {
  const { category } = useParams<{ category: string }>();
  const decodedCategory = decodeURIComponent(category);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "product_id, product_image, product_name, product_MRP, product_SP, product_amount, show_product"
        )
        .eq("product_main_category", decodedCategory)
        .eq("show_product", true); // Filter products where show_product is true

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        console.log("Fetched Products:", data); // Log the data to check the structure
        setProducts(data);
      }
    };

    fetchProducts();
  }, [decodedCategory]);

  return (
    <div className="pt-16 w-full min-h-screen h-full flex flex-col justify-center items-center">
      <h1 className="font-extrabold bg-gradient-to-br from-pink-500 to-orange-400 text-center text-transparent inline-block text-3xl bg-clip-text m-10">
        {decodedCategory}
      </h1>
      <ProductByCategoriesItemList products={products} />
    </div>
  );
};

export default ProductByCategoriesItemListPage;
