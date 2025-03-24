import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  CalendarCheck2,
  Percent,
  ScanSearch,
  TicketPercent,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

// Define the type for the product
interface Product {
  product_id: string; // Changed to product_id as string
  product_name: string;
  product_image: { url: string }[]; // Assuming each product image is an object with a `url` property
}

const SingleProductOffer = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>(""); // Store the product_id
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [couponCode, setCouponCode] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<number | "">("");
  const [applicabilityDate, setApplicabilityDate] = useState<string>("");

  // Fetch product names and images from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("product_id, product_name, product_image"); // Fetch product_id, product_name, and product_image

      if (error) {
        toast.error("Error fetching products");
      } else {
        setProducts(data as Product[]);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on the input search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts([]);
    } else {
      const filtered = products.filter((product) =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  // Handle selecting a product from the suggestions
  const handleProductSelect = (product: Product) => {
    setSelectedProductId(product.product_id); // Store the product_id
    setSearchTerm(product.product_name); // Display product_name in the input field
    setFilteredProducts([]);
  };

  // Helper function to get the image URL that contains '_first'
  const getFirstImageUrl = (images: { url: string }[]): string | undefined => {
    const firstImage = images.find((image) => image.url.includes("_first"));
    return firstImage
      ? firstImage.url
      : images.length > 0
      ? images[0].url
      : undefined;
  };

  // Handle form submission
  const handleApplyOffer = async () => {
    if (!selectedProductId || !couponCode || !discountPercent || !applicabilityDate) {
      toast.error("Please fill out all fields.");
      return;
    }

    const { error } = await supabase
      .from("products")
      .update({
        coupon_code: couponCode,
        code_equiv_percent: discountPercent,
        date_applicable: applicabilityDate,
      })
      .eq("product_id", selectedProductId); // Match the product_id to apply the offer

    if (error) {
      toast.error("Error applying offer");
    } else {
      toast.success("Offer applied successfully!");
      setTimeout(() => {
        setSearchTerm("");
        setCouponCode("");
        setDiscountPercent("");
        setApplicabilityDate("");
      }, 4000); // Reset form after 4 seconds
    }
  };

  return (
    <div className="w-full pt-6 flex flex-col items-center p-6 gap-6">
      <ToastContainer />
      <h1 className="text-2xl font-bold">
        Offer for{" "}
        <span className="text-indigo-500">Selected Categorised Products</span>
      </h1>
      <p className="text-medium p-6 text-center">
        From this Section, you can apply a{" "}
        <span className="text-indigo-500">coupon code</span> for a{" "}
        <span className="text-indigo-600">specific time period</span>. If you
        enter a coupon code here, it will be applied to{" "}
        <span className="text-indigo-500">The selected specific Product.</span>{" "}
        You will also need to enter the{" "}
        <span className="text-indigo-500">Discount percentage</span>. The
        discount percentage will be applied to the{" "}
        <span className="text-indigo-500">Selling price</span>.
      </p>
      <div className="w-[390px] rounded-md flex flex-col justify-center items-center p-4 bg-gray-900 gap-6">
        <h1 className="font-bold">Offer Management System</h1>
        <div className="w-full flex justify-between items-center relative">
          <ScanSearch />
          <label htmlFor="product" className="text-sm font-bd text-indigo-500">
            Product:
          </label>
          <input
            type="text"
            className="bg-transparent text-xs font-bold border outline-none w-[70%] rounded-md p-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search product"
          />
          {/* Dropdown for product suggestions */}
          {filteredProducts.length > 0 && (
            <ul className="absolute top-full text-xs left-[109px] w-[70%] bg-slate-800 max-h-40 overflow-y-auto z-10 rounded-md shadow-lg">
              {filteredProducts.map((product, index) => (
                <li
                  key={index}
                  className="cursor-pointer p-2 flex items-center hover:bg-slate-600"
                  onClick={() => handleProductSelect(product)}
                >
                  {/* Render product image */}
                  {getFirstImageUrl(product.product_image) && (
                    <Image
                      src={getFirstImageUrl(product.product_image) as string}
                      alt={product.product_name}
                      className="w-8 h-8 mr-2"
                      width={500}
                      height={500}
                    />
                  )}
                  {product.product_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="w-full flex gap-2 justify-between items-center">
          <TicketPercent />
          <label htmlFor="coupon" className="text-sm font-bd text-indigo-500">
            Coupon Code:
          </label>
          <input
            type="text"
            id="coupon"
            className="bg-transparent text-xs font-bold border-b outline-none"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
        </div>

        <div className="w-full flex gap-2 justify-between items-center">
          <Percent />
          <label
            htmlFor="percentage"
            className="text-sm font-bd text-indigo-500"
          >
            Equivalent percentage:
          </label>
          <input
            type="number"
            id="percentage"
            className="bg-transparent text-xs font-bd border-b outline-none w-36"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.valueAsNumber)}
          />
        </div>

        <div className="w-full flex gap-2 justify-between items-center">
          <CalendarCheck2 />
          <label htmlFor="date" className="text-sm font-bd text-indigo-500">
            Time of applicability:
          </label>
          <input
            type="date"
            id="date"
            className="bg-transparent text-xs font-bd border-b outline-none"
            value={applicabilityDate}
            onChange={(e) => setApplicabilityDate(e.target.value)}
          />
        </div>

        <div className="flex justify-center w-full items-center">
          <button
            onClick={handleApplyOffer}
            className="bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 h-10 w-36 rounded-md text-l hover:text-l hover:font-bold duration-200"
          >
            Apply Offer
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleProductOffer;
