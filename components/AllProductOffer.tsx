import { CalendarCheck2, Percent, TicketPercent } from "lucide-react";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { supabase } from "@/lib/supabaseClient"; // Import your Supabase client

const AllProductOffer = () => {
  const [couponCode, setCouponCode] = useState("");
  const [equivPercent, setEquivPercent] = useState<number | "">("");
  const [dateApplicable, setDateApplicable] = useState("");

  const handleApplyOffer = async () => {
    try {
      // Ensure all inputs are valid
      if (
        couponCode.trim() === "" ||
        equivPercent === "" ||
        dateApplicable.trim() === ""
      ) {
        toast.error("Please fill in all fields.");
        return;
      }

      // Update rows in the Supabase table where `show_product` is true
      const { data, error } = await supabase
        .from("products")
        .update({
          coupon_code: couponCode,
          code_equiv_percent: equivPercent,
          date_applicable: dateApplicable,
        })
        .eq("show_product", true); // Filter rows where `show_product` is true

      if (error) {
        // Log detailed error information
        console.error("Error updating products table:", error.message);
        throw error;
      }

      // Log the returned data (optional for debugging purposes)
      console.log("Update result:", data);

      // Show the success message including the coupon code
      toast.success(`${couponCode} applied successfully!`);

      // Reset form fields
      setCouponCode("");
      setEquivPercent("");
      setDateApplicable("");
    } catch (error) {
      // Ensure that the error is properly caught and logged
      console.error("Caught error:", error);
      toast.error("Error applying offer. Please try again.");
    }
  };

  return (
    <div className="w-full pt-6 flex flex-col items-center p-6 gap-6">
      <h1 className="text-2xl font-bold">
        Offer for <span className="text-indigo-500">All the products</span>
      </h1>
      <p className="text-medium p-6 text-center">
        From this Section, you can apply a{" "}
        <span className="text-indigo-500">coupon code</span> for a{" "}
        <span className="text-indigo-600">specific time period</span>. If you
        enter a coupon code here, it will be applied to{" "}
        <span className="text-indigo-500">All the Products.</span> You will also
        need to enter the{" "}
        <span className="text-indigo-500">Discount percentage</span>. The
        discount percentage will be applied to the{" "}
        <span className="text-indigo-500">Selling price</span>.
      </p>

      <div className="w-96 rounded-md flex flex-col justify-center items-center p-4 bg-gray-900 gap-6">
        <h1 className="font-bold">Offer Management System</h1>
        <div className="w-full flex gap-2 justify-between items-center">
          <TicketPercent />
          <label htmlFor="amount" className="text-sm font-bd text-indigo-500">
            Coupon Code:
          </label>
          <input
            type="text"
            id="amount"
            className="bg-transparent text-xs font-bd border-b outline-none"
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
            value={equivPercent}
            onChange={(e) => setEquivPercent(Number(e.target.value))}
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
            value={dateApplicable}
            onChange={(e) => setDateApplicable(e.target.value)}
          />
        </div>
        <div className="flex justify-center w-full items-center">
          <button
            className="bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 h-10 w-36 rounded-md text-l hover:text-l hover:font-bold duration-200"
            onClick={handleApplyOffer}
          >
            Apply Offer
          </button>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default AllProductOffer;
