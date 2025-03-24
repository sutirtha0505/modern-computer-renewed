import React, { useState } from "react";
import { Pen, TableProperties } from "lucide-react";
import { MdOutlineDashboardCustomize } from "react-icons/md";
import DensitySmallIcon from "@mui/icons-material/DensitySmall";
import CategoryIcon from "@mui/icons-material/Category";
import AllProductOffer from "./AllProductOffer"; // Import the component
import CategorizedProductOffer from "./CategorisedProductOffer"; // Import the component
import SingleProductOffer from "./SingleProductOffer"; // Import the component
import AllPBPCOffer from "./AllPBPCOffer"; // Import the component
import IntelPBPCOffer from "./IntelPBPCOffer"; // Import the component
import AMDPBPCOffer from "./AMDPBPCOffer"; // Import the component
import AllCBPCOffer from "./AllCBPCOffer"; // Import the component
import IntelCBPCOffer from "./IntelCBPCOffer"; // Import the component
import AMDCBPCOffer from "./AMDCBPCOffer"; // Import the component
import { supabase } from "@/lib/supabaseClient";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

const OfferManagement = () => {
  const [selectedDiv, setSelectedDiv] = useState<number | null>(null);
  const [showAllProductOffer, setShowAllProductOffer] =
    useState<boolean>(false);
  const [showCategorizedProductOffer, setShowCategorizedProductOffer] =
    useState<boolean>(false);
  const [showSingleProductOffer, setShowSingleProductOffer] =
    useState<boolean>(false);
  const [showAllPBPCOffer, setShowAllPBPCOffer] = useState<boolean>(false);
  const [showIntelPBPCOffer, setShowIntelPBPCOffer] = useState<boolean>(false);
  const [showAMDPBPCOffer, setShowAMDPBPCOffer] = useState<boolean>(false);
  const [showAllCBPCOffer, setShowAllCBPCOffer] = useState<boolean>(false);
  const [showIntelCBPCOffer, setShowIntelCBPCOffer] = useState<boolean>(false);
  const [showAMDCBPCOffer, setShowAMDCBPCOffer] = useState<boolean>(false);

  const resetOffers = async () => {
    // Execute the update query with a condition where show_product is TRUE
    const { error } = await supabase
      .from("products")
      .update({
        coupon_code: null,
        code_equiv_percent: null,
        date_applicable: null,
      })
      .match({ show_product: true }); // Add this condition to filter rows

    if (error) {
      toast.error("Error resetting offers.");
    } else {
      toast.success("All the Offers will be reset successfully.");
    }
  };
  const resetPBPCOffers = async () => {
    // Execute the update query with a condition where show_product is TRUE
    const { error } = await supabase
      .from("pre_build")
      .update({
        coupon_code: null,
        code_equiv_percent: null,
        date_applicable: null,
      })
      .or("build_type.eq.AMD,build_type.eq.Intel");

    if (error) {
      toast.error("Error resetting offers.");
    } else {
      toast.success(
        "All the Offers for Pre Build PC will be reset successfully."
      );
    }
  };
  const resetCBPCOffers = async () => {
    // Execute the update query with a condition where show_product is TRUE
    const { error } = await supabase
      .from("custom_build")
      .update({
        coupon_code: null,
        code_equiv_percent: null,
        date_applicable: null,
      })
      .or("build_type.eq.AMD,build_type.eq.Intel");

    if (error) {
      toast.error("Error resetting offers.");
    } else {
      toast.success(
        "All the Offers for Custom Build PC will be reset successfully."
      );
    }
  };

  const renderSubDivs = () => {
    if (
      selectedDiv === 1 &&
      !showAllProductOffer &&
      !showCategorizedProductOffer &&
      !showSingleProductOffer &&
      !showAllPBPCOffer &&
      !showIntelPBPCOffer &&
      !showAMDPBPCOffer &&
      !showAllCBPCOffer &&
      !showIntelCBPCOffer &&
      !showAMDCBPCOffer
    ) {
      return (
        <div className="w-full flex gap-5 justify-center items-center mt-4">
          <div
            className="p-8 gap-4 rounded-sm bg-green-400 border-green-400 border-2 cursor-pointer flex flex-col hover:bg-transparent hover:text-green-400 justify-center items-center"
            onClick={() => setShowAllProductOffer(true)}
          >
            <DensitySmallIcon />
            <p className="text-xs text-center">All Products offer</p>
          </div>
          <div
            className="p-8 gap-4 rounded-sm bg-yellow-500 border-yellow-500 border-2 cursor-pointer flex flex-col hover:bg-transparent hover:text-yellow-500 justify-center items-center"
            onClick={() => setShowCategorizedProductOffer(true)}
          >
            <CategoryIcon />
            <p className="text-xs text-center">Categorized Offer</p>
          </div>
          <div
            className="p-8 gap-4 rounded-sm bg-blue-400 border-blue-400 border-2 cursor-pointer flex flex-col hover:bg-transparent hover:text-blue-400 justify-center items-center"
            onClick={() => setShowSingleProductOffer(true)}
          >
            <Pen />
            <p className="text-xs text-center">Single Product Offer</p>
          </div>
        </div>
      );
    } else if (selectedDiv === 2) {
      return (
        <div className="w-full flex gap-5 justify-center items-center mt-4">
          <div
            className="p-8 gap-4 rounded-sm bg-green-400 border-green-400 border-2 cursor-pointer flex flex-col hover:bg-transparent hover:text-green-400 justify-center items-center"
            onClick={() => setShowAllPBPCOffer(true)}
          >
            <DensitySmallIcon />
            <p className="text-xs text-center">All Prebuild PC Offers</p>
          </div>
          <div
            className="p-8 gap-4 rounded-sm bg-yellow-500 border-yellow-500 border-2 cursor-pointer flex flex-col hover:bg-transparent hover:text-yellow-500 justify-center items-center"
            onClick={() => setShowAMDPBPCOffer(true)}
          >
            <Image
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/item_icon/amd.png"
              alt=""
              className="w-6 h-6"
              width={200}
              height={200}
            />
            <p className="text-xs text-center">AMD Prebuild PC Offers</p>
          </div>
          <div
            className="p-8 gap-4 rounded-sm bg-emerald-400 border-emerald-400 border-2 cursor-pointer flex flex-col hover:bg-transparent hover:text-emerald-400 justify-center items-center"
            onClick={() => setShowIntelPBPCOffer(true)}
          >
            <Image
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/item_icon/intel.png"
              alt=""
              className="w-6 h-6"
              width={200}
              height={200}
            />
            <p className="text-xs text-center">Intel Prebuild PC Offers</p>
          </div>
        </div>
      );
    } else if (selectedDiv === 3) {
      return (
        <div className="w-full flex gap-5 justify-center items-center mt-4">
          <div
            className="p-8 gap-4 rounded-sm bg-green-400 border-green-400 border-2 cursor-pointer flex flex-col hover:bg-transparent hover:text-green-400 justify-center items-center"
            onClick={() => setShowAllCBPCOffer(true)}
          >
            <DensitySmallIcon />
            <p className="text-xs text-center">All Custom Build PC Offers</p>
          </div>
          <div
            className="p-8 gap-4 rounded-sm bg-yellow-500 border-yellow-500 border-2 cursor-pointer flex flex-col hover:bg-transparent hover:text-yellow-500 justify-center items-center"
            onClick={() => setShowIntelCBPCOffer(true)}
          >
            <Image
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/item_icon/intel.png"
              alt=""
              height={200}
              width={200}
              className="w-6 h-6"
            />
            
            <p className="text-xs text-center">Intel Custom Build PC Offers</p>
          </div>
          <div
            className="p-8 gap-4 rounded-sm bg-emerald-400 border-emerald-400 border-2 cursor-pointer flex flex-col hover:bg-transparent hover:text-emerald-400 justify-center items-center"
            onClick={() => setShowAMDCBPCOffer(true)}
          >
            <Image
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/item_icon/amd.png"
              alt=""
              height={200}
              width={200}
              className="w-6 h-6"
            />
            <p className="text-xs text-center">AMD Custom Build PC Offers</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-screen flex flex-col gap-6 p-6 items-center">
      <ToastContainer />
      {!showAllProductOffer &&
      !showCategorizedProductOffer &&
      !showSingleProductOffer &&
      !showAllPBPCOffer &&
      !showIntelPBPCOffer &&
      !showAMDPBPCOffer &&
      !showAllCBPCOffer &&
      !showIntelCBPCOffer &&
      !showAMDCBPCOffer ? (
        <>
          <h1 className="font-bold text-2xl text-center">
            <span className="text-indigo-500">Offer</span> Management System
          </h1>
          <div className="flex flex-wrap gap-6 justify-center items-center">
            {(selectedDiv === null || selectedDiv === 1) && (
              <div
                className="p-4 rounded-sm flex flex-col justify-center items-center bg-yellow-400 border-yellow-400 border-2 hover:bg-transparent hover:text-yellow-400 cursor-pointer h-24 gap-2"
                onClick={() => setSelectedDiv(1)}
              >
                <TableProperties size={30} />
                <p className="text-center font-semibold text-xs">
                  Offer on Products
                </p>
              </div>
            )}
            {(selectedDiv === null || selectedDiv === 2) && (
              <div
                className="p-4 rounded-sm flex flex-col justify-center items-center bg-orange-400 border-orange-400 border-2 hover:bg-transparent hover:text-orange-400 cursor-pointer h-24 gap-2"
                onClick={() => setSelectedDiv(2)}
              >
                <TableProperties size={30} />
                <p className="text-center font-semibold text-xs">
                  Offer on Pre-Build PC
                </p>
              </div>
            )}
            {(selectedDiv === null || selectedDiv === 3) && (
              <div
                className="p-4 rounded-sm flex flex-col justify-center items-center bg-teal-400 border-teal-400 border-2 hover:bg-transparent hover:text-teal-400 cursor-pointer h-24 gap-2"
                onClick={() => setSelectedDiv(3)}
              >
                <MdOutlineDashboardCustomize size={30} />
                <p className="text-center font-semibold text-xs">
                  Offer on Custom Build PC
                </p>
              </div>
            )}
          </div>
          {renderSubDivs()}
          {selectedDiv !== null && (
            <button
              onClick={() => setSelectedDiv(null)}
              className="px-4 py-2 mt-4 bg-gray-800 text-white rounded hover:bg-gray-600"
            >
              Back
            </button>
          )}
        </>
      ) : showAllProductOffer ? (
        <div className="w-screen flex flex-col justify-center items-center">
          <AllProductOffer />
          <div className="w-full flex gap-4 justify-center items-center">
            <button
              onClick={() => setShowAllProductOffer(false)}
              className="px-4 py-2 mt-4 bg-gray-800 text-white rounded hover:bg-gray-600 w-36"
            >
              Back
            </button>
            <button
              onClick={resetOffers} // Call resetOffers function on click
              className="px-4 py-1 mt-4 bg-indigo-500 border-indigo-500 border-2 text-white rounded hover:bg-transparent hover:text-indigo-500 w-36"
            >
              Reset
            </button>
          </div>
        </div>
      ) : showCategorizedProductOffer ? (
        <div className="w-screen flex flex-col justify-center items-center">
          <CategorizedProductOffer />
          <button
            onClick={() => setShowCategorizedProductOffer(false)}
            className="px-4 py-2 mt-4 bg-gray-800 text-white rounded hover:bg-gray-600"
          >
            Back
          </button>
        </div>
      ) : showSingleProductOffer ? (
        <div className="w-screen flex flex-col justify-center items-center">
          <SingleProductOffer />
          <button
            onClick={() => setShowSingleProductOffer(false)}
            className="px-4 py-2 mt-4 bg-gray-800 text-white rounded hover:bg-gray-600"
          >
            Back
          </button>
        </div>
      ) : showAllPBPCOffer ? (
        <div className="w-screen flex flex-col justify-center items-center">
          <AllPBPCOffer />
          <div className="w-full flex gap-4 justify-center items-center">
            <button
              onClick={() => setShowAllPBPCOffer(false)}
              className="px-4 py-2 mt-4 bg-gray-800 text-white rounded hover:bg-gray-600"
            >
              Back
            </button>
            <button
              onClick={resetPBPCOffers} // Call resetOffers function on click
              className="px-4 py-1 mt-4 bg-indigo-500 border-indigo-500 border-2 text-white rounded hover:bg-transparent hover:text-indigo-500 w-36"
            >
              Reset
            </button>
          </div>
        </div>
      ) : showIntelPBPCOffer ? (
        <div className="w-screen flex flex-col justify-center items-center">
          <IntelPBPCOffer />
          <button
            onClick={() => setShowIntelPBPCOffer(false)}
            className="px-4 py-2 mt-4 bg-gray-800 text-white rounded hover:bg-gray-600"
          >
            Back
          </button>
        </div>
      ) : showAMDPBPCOffer ? (
        <div className="w-screen flex flex-col justify-center items-center">
          <AMDPBPCOffer />
          <button
            onClick={() => setShowAMDPBPCOffer(false)}
            className="px-4 py-2 mt-4 bg-gray-800 text-white rounded hover:bg-gray-600"
          >
            Back
          </button>
        </div>
      ) : showAllCBPCOffer ? (
        <div className="w-screen flex flex-col justify-center items-center">
          <AllCBPCOffer />
          <div className="w-full flex gap-4 justify-center items-center">
          <button
            onClick={() => setShowAllCBPCOffer(false)}
            className="px-4 py-2 mt-4 bg-gray-800 text-white rounded hover:bg-gray-600"
          >
            Back
          </button>
          <button
              onClick={resetCBPCOffers} // Call resetOffers function on click
              className="px-4 py-1 mt-4 bg-indigo-500 border-indigo-500 border-2 text-white rounded hover:bg-transparent hover:text-indigo-500 w-36"
            >
              Reset
            </button>
          </div>
          
        </div>
      ) : showIntelCBPCOffer ? (
        <div className="w-screen flex flex-col justify-center items-center">
          <IntelCBPCOffer />
          <button
            onClick={() => setShowIntelCBPCOffer(false)}
            className="px-4 py-2 mt-4 bg-gray-800 text-white rounded hover:bg-gray-600"
          >
            Back
          </button>
        </div>
      ) : showAMDCBPCOffer ? (
        <div className="w-screen flex flex-col justify-center items-center">
          <AMDCBPCOffer />
          <button
            onClick={() => setShowAMDCBPCOffer(false)}
            className="px-4 py-2 mt-4 bg-gray-800 text-white rounded hover:bg-gray-600"
          >
            Back
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default OfferManagement;
