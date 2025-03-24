import { CalendarCheck2, Percent, Settings, TicketPercent } from "lucide-react";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { supabase } from "@/lib/supabaseClient"; // Import your Supabase client
import Image from "next/image";

const IntelPBPCOffer = () => {
  const [couponCode, setCouponCode] = useState("");
  const [percentage, setPercentage] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = async () => {
    const { error } = await supabase
      .from("pre_build")
      .update({
        coupon_code: couponCode,
        code_equiv_percent: percentage,
        date_applicable: date,
      })
      .match({ build_type: "Intel" }); // Only update where build_type is 'AMD'

    if (error) {
      toast.error("Error applying offer.");
    } else {
      toast.success("Offer applied on Intel build PCs successfully.");
      // Reset form after 4 seconds
      setTimeout(() => {
        setCouponCode("");
        setPercentage("");
        setDate("");
      }, 4000);
    }
  };

  return (
    <div className="w-full pt-6 flex flex-col items-center p-6 gap-6">
      <ToastContainer />
      <h1 className="text-2xl font-bold">
        Offer for{" "}
        <span className="text-indigo-500">Pre Intel-Build Products</span>
      </h1>
      <p className="text-medium p-6 text-center">
        From this Section, you can apply a{" "}
        <span className="text-indigo-500">coupon code</span> for a{" "}
        <span className="text-indigo-600">specific time period</span>. If you
        enter a coupon code here, it will be applied to all{" "}
        <span className="text-indigo-500">Pre Intel-Build Products.</span>{" "}
        You will also need to enter the{" "}
        <span className="text-indigo-500">Discount percentage</span>. The
        discount percentage will be applied to the{" "}
        <span className="text-indigo-500">Selling price</span>.
      </p>
      <div className="w-96 rounded-md flex flex-col justify-center items-center p-4 bg-gray-900 gap-6">
        <h1 className="font-bold">Offer Management System</h1>
        <div className="w-full flex gap-2 justify-between items-center">
          <Settings />
          <label htmlFor="build" className="text-sm font-bd text-indigo-500">
            Build type:
          </label>
          <div className="w-[60%] rounded-md bg-slate-700 flex justify-center items-center gap-4">
            <Image
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/item_icon/intel.png"
              alt=""
              className="w-6 h-6"
              width={500}
              height={500}
            />
            <p className="text-sm">INTEL</p>
          </div>
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
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
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
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent text-xs font-bd border-b outline-none"
          />
        </div>
        <div className="flex justify-center w-full items-center">
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 h-10 w-36 rounded-md text-l hover:text-l hover:font-bold duration-200"
          >
            Apply Offer
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntelPBPCOffer;
