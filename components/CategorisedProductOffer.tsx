import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // Adjust the path based on your file structure
import DropdownCategory from "./DropdownCategory"; // Adjust the path based on your file structure
import { CalendarCheck2, Percent, TicketPercent } from "lucide-react";
import CategoryIcon from "@mui/icons-material/Category";
import { ToastContainer, toast } from 'react-toastify'; // Import react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Import toastify styles

type Product = {
  product_main_category: string;
  category_product_image: string;
};

const CategorisedProductOffer = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [resetDropdown, setResetDropdown] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [codeEquivPercent, setCodeEquivPercent] = useState<number | null>(null);
  const [dateApplicable, setDateApplicable] = useState<string>("");

  // Fetch product categories from Supabase
  useEffect(() => {
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("product_main_category, category_product_image");

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data || []);

      // Example usage of `products`
      const filteredProducts = data?.filter(
        (product) => product.product_main_category === "SpecificCategory"
      );
      console.log("Filtered products:", filteredProducts);
    }
  };

  fetchProducts();
}, [products]);


  // Handle product selection from DropdownCategory
  const handleProductSelection = (selectedOptions: Product[]) => {
    setSelectedProducts(selectedOptions);
  };

  // Handle Apply Offer button click
  const handleApplyOffer = async () => {
    if (!couponCode || codeEquivPercent === null || !dateApplicable) {
      toast.error("Please fill in all the fields before applying the offer.");
      return;
    }

    try {
      const promises = selectedProducts.map(async (product) => {
        const { error } = await supabase
          .from("products")
          .update({
            coupon_code: couponCode,
            code_equiv_percent: codeEquivPercent,
            date_applicable: dateApplicable,
          })
          .eq("product_main_category", product.product_main_category)
          .eq("show_product", true); // Match where `show_product` is true

        if (error) {
          throw error;
        }
      });

      await Promise.all(promises);

      // Success toast
      toast.success("Offer applied successfully!");

      // Reset the form after 3 seconds
      setTimeout(() => {
        setCouponCode("");
        setCodeEquivPercent(null);
        setDateApplicable("");
        setResetDropdown(true); // Reset the dropdown
        setSelectedProducts([]);
      }, 3000);
    } catch (error) {
      console.error("Error applying offer:", error);
      toast.error("Failed to apply the offer. Please try again.");
    }
  };

  return (
    <div className="w-full pt-6 flex flex-col items-center p-6 gap-6">
      <h1 className="text-2xl font-bold">
        Offer for <span className="text-indigo-500">Selected Categorised Products</span>
      </h1>
      <p className="text-medium p-6 text-center">
        From this Section, you can apply a{" "}
        <span className="text-indigo-500">coupon code</span> for a{" "}
        <span className="text-indigo-600">specific time period</span>. If you
        enter a coupon code here, it will be applied to{" "}
        <span className="text-indigo-500">
          The selected categorised Products.
        </span>{" "}
        You will also need to enter the{" "}
        <span className="text-indigo-500">Discount percentage</span>. The
        discount percentage will be applied to the{" "}
        <span className="text-indigo-500">Selling price</span>.
      </p>

      {/* Dropdown for selecting product categories */}
      <div className="w-[390px] rounded-md flex flex-col justify-center items-center p-4 bg-gray-900 gap-6">
        <h1 className="font-bold">Offer Management System</h1>
        <div className="w-full flex justify-between items-center">
          <CategoryIcon />
          <label htmlFor="amount" className="text-sm font-bd text-indigo-500">
            Category:
          </label>
          <DropdownCategory
            onSelect={handleProductSelection}
            multiple={true}
            reset={resetDropdown}
          />
        </div>
        <div className="w-full flex gap-2 justify-between items-center">
          <TicketPercent />
          <label htmlFor="amount" className="text-sm font-bd text-indigo-500">
            Coupon Code:
          </label>
          <input
            type="text"
            id="amount"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="bg-transparent text-xs font-bd border-b outline-none"
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
            value={codeEquivPercent || ""}
            onChange={(e) => setCodeEquivPercent(Number(e.target.value))}
            className="bg-transparent text-xs font-bd border-b outline-none w-36"
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
            value={dateApplicable}
            onChange={(e) => setDateApplicable(e.target.value)}
            className="bg-transparent text-xs font-bd border-b outline-none"
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

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default CategorisedProductOffer;
