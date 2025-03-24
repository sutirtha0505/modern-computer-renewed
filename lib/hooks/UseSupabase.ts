import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Product } from "@/types/types";

// interface Product {
//   product_id: string;
//   product_name: string;
//   product_description: string;
//   product_category: string;
//   // Add other fields based on your `products` table structure
// }

export const UseSupabase = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filterData, setFilterData] = useState<Product[]>([]);
  const [singleProduct, setSingleProduct] = useState<Product | null>(null);

  const getDataFromSupabase = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (data) {
      setProducts(data);
      console.log(data);
    }
    if (error) {
      console.log(error);
    }
  };

  const getFilterData = async (query: string) => {
    const decodedQuery = decodeURIComponent(query); // Decode the URL-encoded query string
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .or(
        `product_name.ilike.%${decodedQuery}%, product_description.ilike.%${decodedQuery}%, product_category.ilike.%${decodedQuery}%`
      );
    if (data) {
      setFilterData(data);
      console.log(data);
    }
    if (error) {
      console.log(error);
    }
  };

  const getSingleProduct = async (product_id: string) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("product_id", product_id)
        .single(); // This assumes product_id is unique and returns a single product
      if (data) {
        setSingleProduct(data);
      }
      if (error) {
        throw error;
      }
    } catch (error) {
      console.log(error);
    }
  };

  return {
    products,
    getDataFromSupabase,
    filterData,
    getFilterData,
    singleProduct,
    getSingleProduct,
  };
};
