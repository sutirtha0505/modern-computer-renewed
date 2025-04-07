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
    const decodedQuery = decodeURIComponent(query).trim();
    if (!decodedQuery) {
      setFilterData([]);
      return;
    }
  
    // First: check for an exact (case-insensitive) match in the product_category
    const { data: categoryData, error: categoryError } = await supabase
      .from("products")
      .select("*")
      .ilike("product_category", decodedQuery);
  
    if (categoryError) {
      console.error("Category search error:", categoryError);
    }
  
    // Filter to ensure an exact match on the category value
    const exactCategoryMatch = categoryData?.filter(product =>
      product.product_category?.toLowerCase() === decodedQuery.toLowerCase()
    );
  
    if (exactCategoryMatch && exactCategoryMatch.length > 0) {
      setFilterData(exactCategoryMatch);
      console.log(exactCategoryMatch);
      return;
    }
  
    // Otherwise: search for partial matches in the product_name
    const { data: nameData, error: nameError } = await supabase
      .from("products")
      .select("*")
      .ilike("product_name", `%${decodedQuery}%`);
  
    if (nameError) {
      console.error("Name search error:", nameError);
    }
  
    if (nameData) {
      setFilterData(nameData);
      console.log(nameData);
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
