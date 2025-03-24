import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient"; // Ensure to import your Supabase client
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

interface PreBuildPCSingleProductFinalCheckOutProps {
  userId: string; // Explicitly typing the userId as a string
}
interface Product {
  build_name: string;
  image_urls: { url: string }[];
  build_type: string;
  coupon_code: string;
  code_equiv_percent: number;
  date_applicable: string;
}
interface CustomerDetails {
  customer_name: string;
  customer_house_no: string;
  customer_house_street: string;
  customer_house_city: string;
  customer_house_pincode: number;
  customer_house_landmark: string;
  profile_photo: string;
  email: string;
  phone_no: string;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
const PreBuildSingleProductFinalCheckOut: React.FC<
  PreBuildPCSingleProductFinalCheckOutProps
> = ({ userId }) => {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [couponCode, setCouponCode] = useState<string>("");
  const [discountedTotal, setDiscountedTotal] = useState<number>(0);
  const [couponApplied, setCouponApplied] = useState<boolean>(false);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [sellingPrice, setSellingPrice] = useState<number>(0); // State for selling price

  const [isPincodeValid, setIsPincodeValid] = useState<boolean>(true);

  useEffect(() => {
    const storedProduct = localStorage.getItem("checkoutProduct");
    if (storedProduct) {
      const { id, selling_price } = JSON.parse(storedProduct);
      fetchProductDetails(id, selling_price);
      setProductId(id);
    }
  }, []);

  const fetchProductDetails = async (id: string, selling_price: string) => {
    setLoading(true); // Set loading state to true
    try {
      const { data, error } = await supabase
        .from("pre_build")
        .select(
          "build_name, image_urls, build_type, coupon_code, code_equiv_percent, date_applicable"
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      setProduct(data);
      setSellingPrice(Number(selling_price)); // Use the passed selling_price directly

      // Extract the image URL with "_first"
      const firstImageUrl = data.image_urls?.find((img: { url: string }) =>
        img.url.includes("_first")
      )?.url;

      setImageUrl(firstImageUrl || "");
    } catch (error) {
      console.error(
        "Error fetching product details:",
        (error as Error).message
      );
    } finally {
      setLoading(false); // Set loading state to false
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      console.log("Razorpay script loaded");
    };
    script.onerror = () => {
      console.error("Error loading Razorpay script");
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        const { data, error } = await supabase
          .from("profile")
          .select(
            "customer_name, customer_house_no, customer_house_street, customer_house_city, customer_house_pincode, customer_house_landmark, profile_photo, email, phone_no"
          )
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching customer details:", error);
          return;
        }

        if (
          !data.customer_name ||
          !data.customer_house_no ||
          !data.customer_house_street ||
          !data.customer_house_city ||
          !data.customer_house_pincode ||
          !data.customer_house_landmark ||
          !data.email ||
          !data.phone_no ||
          !data.profile_photo
        ) {
          router.push(`/profile/${userId}`);
        } else {
          setCustomerDetails(data);
          const isValidPincode =
            data.customer_house_pincode >= 700000 &&
            data.customer_house_pincode <= 740000;
          setIsPincodeValid(isValidPincode);

          if (!isValidPincode) {
            toast.error(
              "Delivery not available to the entered pincode. We're Shipping within West Bengal, India. Please visit our store and try again later."
            );
          }
        }
      } catch (error) {
        console.error("Error fetching customer details:", error);
      }
    };

    if (userId) {
      fetchCustomerDetails();
    }
  }, [userId, router]);

  const handleApplyCoupon = () => {
    if (couponCode === product?.coupon_code) {
      const currentDate = dayjs(); // Get the current date
      const applicableDate = dayjs(product?.date_applicable); // Get the applicable date for the coupon

      // Check if the coupon is still valid based on the date
      if (currentDate.isBefore(applicableDate)) {
        if (!isNaN(sellingPrice)) {
          const discount = sellingPrice * (product.code_equiv_percent / 100);
          setDiscountedTotal(sellingPrice - discount);
          setCouponApplied(true);
          toast.success("Coupon code redeemed successfully!");
        } else {
          toast.error("Invalid selling price");
        }
      } else {
        toast.error("Coupon code has expired");
      }
    } else {
      toast.error("Wrong coupon code");
    }
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      const payableAmount = couponApplied ? discountedTotal : sellingPrice; // Use sellingPrice if coupon is not applied

      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: payableAmount, // Pass the correct amount
          currency: "INR",
        }),
      });

      const data = await response.json();

      if (!window.Razorpay) {
        console.error("Razorpay is not loaded");
        toast.error("Payment gateway is not available. Please try again.");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        app_name: "Modern Computer",
        description: product?.build_name,
        image:
          "https://supabase.moderncomputer.in/storage/v1/object/public/product-image/About/Logo.gif",
        order_id: data.id,
        handler: async (response: RazorpayResponse) => {
          toast.success("Payment successful!");
          console.log("Payment Response:", response);

          // Save order in database, using the correct amount
          await saveOrder(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            payableAmount // Pass the actual amount charged
          );
          setTimeout(() => {
            router.push("/orders");
          }, 3000);
        },
        prefill: {
          name: customerDetails?.customer_name,
          email: customerDetails?.email,
          contact: customerDetails?.phone_no,
        },
        notes: {
          address: `${customerDetails?.customer_house_no}, ${customerDetails?.customer_house_street}, ${customerDetails?.customer_house_city}, ${customerDetails?.customer_house_pincode}`,
        },
        theme: {
          color: "#6265F1",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error during payment:", error);
      toast.error("Payment failed!");
    } finally {
      setLoading(false);
    }
  };

  const saveOrder = async (
    order_id: string,
    payment_id: string,
    amount: number
  ) => {
    const expectedDeliveryDate = dayjs().add(7, "day").format("YYYY-MM-DD");

    const { error } = await supabase.from("order_table_pre_build").insert([
      {
        order_id: order_id,
        payment_id: payment_id,
        customer_id: userId,
        payment_amount: amount, // Use the amount passed from the payment handler
        ordered_products: [productId],
        order_address: `${customerDetails?.customer_house_no}, ${customerDetails?.customer_house_street}, ${customerDetails?.customer_house_city}, ${customerDetails?.customer_house_pincode}`,
        expected_delivery_date: expectedDeliveryDate,
        created_at: new Date(),
      },
    ]);

    if (error) {
      console.error("Error saving order:", error);
      toast.error("Failed to save the order. Please try again.");
    } else {
      toast.success("Order saved successfully!");
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading indicator while fetching data
  }

  if (!product || !customerDetails) {
    return <div>No product found.</div>; // Handle the case where no product data is available
  }

  return (
    <div className="w-full flex justify-center items-center p-6 gap-2 flex-col md:flex-row">
      <div className="w-full md:w-1/2 flex flex-col overflow-y-auto gap-4">
        <div className="flex flex-wrap justify-center items-center gap-4 p-4 border rounded-lg bg-slate-300 dark:bg-slate-800">
          <Image
            src={imageUrl}
            alt={product.build_name}
            width={200}
            height={200}
            className="rounded-lg"
          />
          <div className="flex flex-col gap-2">
            <p className="font-bold text-sm text-center">
              {product.build_name} -{" "}
              <span className="text-indigo-500">
                {product.build_type} Build
              </span>
            </p>
          </div>
          <div className="flex gap-3 px-8 justify-between items-center">
            <p className="text-indigo-500 font-extrabold">
              Total: <span className="text-white">&#x20B9;{sellingPrice}</span>
            </p>
            <p className="font-extrabold text-sm text-indigo-500">
              Quantity: <span className="text-white">1</span>
            </p>
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4">
        {/* Additional content goes here */}
        <div className="w-96 bg-slate-300 dark:bg-slate-800 gap-5 p-4 flex flex-col justify-between items-center rounded-md">
          <h1 className="text-2xl font-bold">
            Order <span className="text-indigo-500">Summary</span>
          </h1>
          <div className="w-full flex gap-2 justify-center items-center">
            <Image
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/money.png"
              alt=""
              className="w-8 h-8"
              width={200}
              height={200}
            />
            <label htmlFor="amount" className="text-sm font-bold">
              Product Amount:
            </label>
            <p className="text-sm font-bold text-indigo-600">
              &#x20B9;{sellingPrice}
            </p>
          </div>
          <div className="w-full flex gap-2 justify-center items-center">
            <Image
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/fast-delivery.png"
              alt=""
              className="w-8 h-8"
              width={200}
              height={200}
            />
            <label htmlFor="amount" className="text-sm font-bold">
              Delivery Amount:
            </label>
            <p className="text-sm font-bold text-indigo-600">&#x20B9;0</p>
          </div>
          <div className="w-full flex gap-2 justify-center items-center">
            <Image
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/voucher.png"
              alt=""
              className="w-6 h-6"
              width={200}
              height={200}
            />
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className={`rounded-md bg-transparent border-1 border-indigo-500 w-44 outline-none p-2 text-xs ${
                couponApplied ? "bg-gray-600 cursor-not-allowed" : ""
              }`}
              placeholder="Coupon code..."
              disabled={couponApplied} // Disable input after coupon applied
            />
            <button
              onClick={handleApplyCoupon}
              className={`rounded-md p-2 text-xs ${
                couponApplied
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-500 text-white"
              } `}
              disabled={couponApplied} // Disable button after coupon applied
            >
              {couponApplied ? "Applied" : "Apply"}
            </button>
          </div>
          <hr />
          <div className="w-full flex gap-2 justify-center items-center">
            <Image
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/cashless-payment.png"
              alt=""
              className="w-6 h-6"
              width={200}
              height={200}
            />
            <p className="font-bold text-sm">
              Total Amount Payable <br />
              (Including all Taxes):
            </p>
            <p className="text-sm font-bold text-indigo-600">
              {loading ? (
                <span>Loading...</span>
              ) : (
                <span>&#x20B9;{discountedTotal || sellingPrice}</span>
              )}
            </p>
          </div>
          <div className="flex justify-center">
            <button
              className={`bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 h-10 w-36 rounded-md text-l hover:text-l hover:font-bold duration-200 ${
                !isPincodeValid || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : ""
              }`}
              onClick={handlePayment}
              disabled={loading || !isPincodeValid} // Disable button if pincode is not valid
            >
              {loading ? "Processing..." : "Pay Here"}
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default PreBuildSingleProductFinalCheckOut;
