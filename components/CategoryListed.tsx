// components/CategoryListed.tsx
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

type Product = {
  product_category: string;
  product_main_category: string | null;
  category_product_image: string | null;
};
type ProductItem = {
  product_category: string; // Define other properties if needed
};


const CategoryListed: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [matchingCategories, setMatchingCategories] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("product_category, product_main_category, category_product_image");

      if (error) {
        console.error("Error fetching products:", error);
        return;
      }

      // Filter out products with null product_main_category
      const filteredProducts = data.filter(
        (product: Product) => product.product_main_category !== null
      );

      // Create a map to store unique product main categories
      const uniqueMainCategories = new Map<string, Product>();
      filteredProducts.forEach((product: Product) => {
        if (!uniqueMainCategories.has(product.product_main_category!)) {
          uniqueMainCategories.set(product.product_main_category!, product);
        }
      });

      // Convert the map back to an array
      const uniqueProductsArray = Array.from(uniqueMainCategories.values());

      setProducts(uniqueProductsArray);

      // Fetch matching categories for each unique product_main_category
      uniqueProductsArray.forEach(async (product) => {
        const { data, error } = await supabase
          .from("products")
          .select("product_category")
          .eq("product_main_category", product.product_main_category);

        if (error) {
          console.error("Error fetching matching categories:", error);
          return;
        }

        const matchingCategories = data.map((item: ProductItem) => item.product_category);
        const uniqueMatchingCategories = Array.from(new Set(matchingCategories)).join(", ");

        setMatchingCategories((prevState) => ({
          ...prevState,
          [product.product_main_category!]: uniqueMatchingCategories,
        }));
      });
    };

    fetchProducts();
  }, []);

  return (
    <div className="flex flex-wrap gap-4 justify-center items-center">
      {products.map((product, index) => (
        <div
          key={index}
          className="flex flex-col items-center space-y-4 bg-slate-900 p-4 rounded shadow-md"
        >
          {product.category_product_image && (
            <Image
              src={product.category_product_image}
              alt="Category"
              className="w-24 h-24 object-cover rounded-full"
              width={1000}
              height={1000}
            />
          )}
          <input
            type="text"
            placeholder="Input product category"
            value={product.product_main_category || ""}
            readOnly
            className="border bg-transparent border-gray-300 p-2"
          />
          <input
            type="text"
            placeholder="Matching product categories"
            value={matchingCategories[product.product_main_category!] || ""}
            readOnly
            className="border bg-transparent border-gray-300 p-2"
          />
        </div>
      ))}
    </div>
  );
};

export default CategoryListed;
