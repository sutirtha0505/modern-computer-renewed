import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { InfoIcon } from "lucide-react";
import Image from "next/image";

interface Product {
  name: string;
  price: number;
  image: string;
}
interface CustomBuildSingleProductFinalCheckOutProps {
  userId: string;
}

interface ProductDetails {
  processor: string;
  build_type: string;
  coupon_code: string;
  code_equiv_percent: number;
  date_applicable: string;
  product_name?: string;
}

interface CustomerDetails {
  name: string;
  customer_house_no: string;
  customer_house_street: string;
  customer_house_city: string;
  customer_house_pincode: number;
  customer_house_landmark: string;
  image: string;
  email: string;
  phone_no: string;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const CustomBuildSingleProductFinalCheckOut: React.FC<
  CustomBuildSingleProductFinalCheckOutProps
> = ({ userId }) => {
  const router = useRouter();
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [processor, setProcessor] = useState<Product[]>([]);
  const [motherboard, setMotherboard] = useState<Product[]>([]);
  const [ram, setRam] = useState<Product[]>([]);
  const [ramQuantity, setRamQuantity] = useState<number>(1);
  const [ssd, setSsd] = useState<Product[]>([]);
  const [graphicsCard, setGraphicsCard] = useState<Product[]>([]);
  const [cabinet, setCabinet] = useState<Product[]>([]);
  const [psu, setPsu] = useState<Product[]>([]);
  const [hdd, setHdd] = useState<Product[]>([]);
  const [cooler, setCooler] = useState<Product[]>([]);
  const [customBuildId, setCustomBuildId] = useState<string>("");
  const [couponCode, setCouponCode] = useState<string>("");
  const [discountedTotal, setDiscountedTotal] = useState<number>(0);
  const [couponApplied, setCouponApplied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [isPincodeValid, setIsPincodeValid] = useState<boolean>(true);
  useEffect(() => {
    // Fetch the stored data from localStorage
    const storedData = localStorage.getItem("checkoutCustomBuildData");

    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setTotalPrice(Number(parsedData.totalPrice) || 0);
      setProcessor(parsedData.processor || []);
      setMotherboard(parsedData.motherboard || []);
      setRam(parsedData.ram || []);
      setRamQuantity(Number(parsedData.ramQuantity) || 1);
      setSsd(parsedData.ssd || []);
      setGraphicsCard(parsedData.graphicsCard || []);
      setCabinet(parsedData.cabinet || []);
      setPsu(parsedData.psu || []);
      setHdd(parsedData.hdd || []);
      setCooler(parsedData.cooler || []);
      setCustomBuildId(parsedData.customBuildId || "");
    }
  }, []);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!customBuildId) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("custom_build")
          .select(
            "processor, build_type, coupon_code, code_equiv_percent, date_applicable"
          )
          .eq("id", customBuildId)
          .single();

        if (error) throw error;

        setProduct(data);
      } catch (error) {
        console.error(
          "Error fetching product details:",
          (error as Error).message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [customBuildId]);

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
          .from("users")
          .select(
            "name, customer_house_no, customer_house_street, customer_house_city, customer_house_pincode, customer_house_landmark, image, email, phone_no"
          )
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching customer details:", error);
          return;
        }

        if (
          !data.name ||
          !data.customer_house_no ||
          !data.customer_house_street ||
          !data.customer_house_city ||
          !data.customer_house_pincode ||
          !data.customer_house_landmark ||
          !data.email ||
          !data.phone_no ||
          !data.image
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

  const handlePayment = async () => {
    setLoading(true);

    try {
      const payableAmount = Math.round(
        couponApplied ? discountedTotal : totalPrice
      ); // Use totalPrice if coupon is not applied

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
        description: product?.product_name || "",
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
          name: customerDetails?.name,
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

    const { error } = await supabase.from("order_table_custom_build").insert([
      {
        order_id: order_id,
        payment_id: payment_id,
        customer_id: userId,
        payment_amount: amount, // Use the amount passed from the payment handler
        ordered_products: [
          {
            processor_name: processor[0]?.name || "",
            quantity: 1,
            image_url: processor[0]?.image,
          },
          {
            motherboard_name: motherboard[0]?.name || "",
            quantity: 1,
            image_url: motherboard[0]?.image,
          },
          {
            ram_name: ram[0]?.name || "",
            quantity: ramQuantity,
            image_url: ram[0]?.image,
          }, // Using ramQuantity here
          {
            ssd_name: ssd[0]?.name || "",
            quantity: 1,
            image_url: ssd[0]?.image,
          }, //
          {
            hdd_name: hdd[0]?.name || "",
            quantity: 1,
            image_url: hdd[0]?.image,
          }, // Using hdd here
          {
            cabinet_name: cabinet[0]?.name || "",
            quantity: 1,
            image_url: cabinet[0]?.image,
          }, //
          {
            psu_name: psu[0]?.name || "",
            quantity: 1,
            image_url: psu[0]?.image,
          },
          {
            cooler_name: cooler[0]?.name || "",
            quantity: 1,
            image_url: cooler[0]?.image,
          },
          {
            graphics_card_name: graphicsCard[0]?.name || "",
            quantity: 1,
            image_url: graphicsCard[0]?.image,
          },
        ],
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

  const handleApplyCoupon = () => {
    if (couponCode === product?.coupon_code) {
      const currentDate = dayjs(); // Get the current date
      const applicableDate = dayjs(product?.date_applicable); // Get the applicable date for the coupon

      // Check if the coupon is still valid based on the date
      if (currentDate.isBefore(applicableDate)) {
        if (!isNaN(totalPrice)) {
          const discount = totalPrice * (product.code_equiv_percent / 100);
          setDiscountedTotal(totalPrice - discount);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full flex justify-center items-center p-6 gap-2 flex-col md:flex-row">
      <div className="w-full md:w-1/2 flex flex-col overflow-y-auto gap-4">
        <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-slate-300 dark:bg-slate-800">
          <h1 className="text-xl font-bold">
            Your <span className="text-indigo-500">Configuration</span>
          </h1>
          <div className="flex justify-start gap-4 items-center w-full">
            <Image
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pre-build/processor/processor.png"
              className="w-6 h-6"
              alt="Default Image"
              width={200}
              height={200}
            />
            <h2>Processor:</h2>
            {processor.map((item, index) => (
              <div
                key={index}
                className="flex gap-2 flex-row-reverse bg-gray-600 border p-2 rounded-md w-full justify-center items-center "
              >
                <p className="text-xs font-bold">{item.name.slice(0, 50)}...</p>
                <Image
                  src={item.image}
                  alt={item.name.slice(0, 50)}
                  className="rounded-full w-4 h-4"
                  width={200}
                  height={200}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-start gap-4 items-center w-full">
            <Image
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pre-build/motherboard/motherboard.png"
              className="w-6 h-6"
              alt="Default Image"
              height={200}
              width={200}
            />
            <h2>Motherboard:</h2>
            {motherboard.map((item, index) => (
              <div
                key={index}
                className="flex gap-2 flex-row-reverse bg-gray-600 border p-2 rounded-md w-full justify-center items-center "
              >
                <p className="text-xs font-bold">{item.name.slice(0, 50)}...</p>
                <Image
                  src={item.image}
                  alt={item.name.slice(0, 50)}
                  className="rounded-full w-4 h-4"
                  width={200}
                  height={200}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-start gap-4 items-center w-full">
            <Image
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pre-build/RAM/RAM.png"
              className="w-6 h-6"
              alt="Default Image"
              height={200}
              width={200}
            />
            <h2>RAM:</h2>
            {ram.map((item, index) => (
              <div
                key={index}
                className="flex gap-2 flex-row-reverse bg-gray-600 border p-2 rounded-md w-full justify-center items-center "
              >
                <p className="text-xs font-bold">{item.name.slice(0, 50)}...</p>
                <Image
                  src={item.image}
                  alt={item.name.slice(0, 50)}
                  className="rounded-full w-4 h-4"
                  height={200}
                  width={200}
                />
              </div>
            ))}
            <p className="text-nowrap">X {ramQuantity}</p>
          </div>

          <div className="flex justify-start gap-4 items-center w-full">
            <Image
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pre-build/SSD/ssd.png"
              className="w-6 h-6"
              alt="Default Image"
              width={200}
              height={200}
            />
            <h2>SSD:</h2>
            {ssd.map((item, index) => (
              <div
                key={index}
                className="flex gap-2 flex-row-reverse bg-gray-600 border p-2 rounded-md w-full justify-center items-center "
              >
                <p className="text-xs font-bold">{item.name.slice(0, 50)}...</p>
                <Image
                  src={item.image}
                  alt={item.name.slice(0, 50)}
                  className="rounded-full w-4 h-4"
                  width={200}
                  height={200}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-start gap-4 items-center w-full">
            <Image
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pre-build/graphics%20card/graphic_card.png"
              className="w-6 h-6"
              alt="Default Image"
              width={200}
              height={200}
            />
            <h2>Graphics Card:</h2>
            {graphicsCard.map((item, index) => (
              <div
                key={index}
                className="flex gap-2 flex-row-reverse bg-gray-600 border p-2 rounded-md w-full justify-center items-center "
              >
                <p className="text-xs font-bold">{item.name.slice(0, 50)}...</p>
                <Image
                  src={item.image}
                  alt={item.name.slice(0, 50)}
                  className="rounded-full w-4 h-4"
                  width={200}
                  height={200}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-start gap-4 items-center w-full">
            <Image
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pre-build/cabinet/high_tower.png"
              className="w-6 h-6"
              alt="Default Image"
              width={200}
              height={200}
            />
            <h2>Cabinet:</h2>
            {cabinet.map((item, index) => (
              <div
                key={index}
                className="flex gap-2 flex-row-reverse bg-gray-600 border p-2 rounded-md w-full justify-center items-center "
              >
                <p className="text-xs font-bold">{item.name.slice(0, 50)}...</p>
                <Image
                  src={item.image}
                  alt={item.name.slice(0, 50)}
                  className="rounded-full w-4 h-4"
                  width={200}
                  height={200}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-start gap-4 items-center w-full">
            <Image
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pre-build/SMPS/power_supply.png"
              className="w-6 h-6"
              alt="Default Image"
              width={200}
              height={200}
            />
            <h2>Power Supply:</h2>
            {psu.map((item, index) => (
              <div
                key={index}
                className="flex gap-2 flex-row-reverse bg-gray-600 border p-2 rounded-md w-full justify-center items-center "
              >
                <p className="text-xs font-bold">{item.name.slice(0, 50)}...</p>
                <Image
                  src={item.image}
                  alt={item.name.slice(0, 50)}
                  className="rounded-full w-4 h-4"
                  width={200}
                  height={200}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-start gap-4 items-center w-full">
            <Image
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/cbpc_intel/INTEL_Custom.png"
              className="w-6 h-6"
              alt="Default Image"
              width={200}
              height={200}
            />
            <h2>Hard Disk:</h2>
            {hdd.map((item, index) => (
              <div
                key={index}
                className="flex gap-2 flex-row-reverse bg-gray-600 border p-2 rounded-md w-full justify-center items-center "
              >
                <p className="text-xs font-bold">{item.name.slice(0, 50)}...</p>
                <Image
                  src={item.image}
                  alt={item.name.slice(0, 50)}
                  className="rounded-full w-4 h-4"
                  width={200}
                  height={200}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-start gap-4 items-center w-full">
            <Image
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pre-build/hard%20disk/hard_disk.png"
              className="w-6 h-6"
              alt="Default Image"
              width={200}
              height={200}
            />
            <h2>Cooler:</h2>
            {cooler.map((item, index) => (
              <div
                key={index}
                className="flex gap-2 flex-row-reverse bg-gray-600 border p-2 rounded-md w-full justify-center items-center "
              >
                <p className="text-xs font-bold">{item.name.slice(0, 50)}...</p>
                <Image
                  src={item.image}
                  alt={item.name.slice(0, 50)}
                  className="rounded-full w-4 h-4"
                  width={200}
                  height={200}
                />
              </div>
            ))}
          </div>
            <div className="flex justify-center items-center gap-3">
              <InfoIcon className="text-indigo-500" />
              <p className="text-sm font-extrabold">
                If you cancel your{" "}
                <span className="text-indigo-500"> Custom Build PC</span> order{" "}
                <span className="text-green-400">5%</span> of the price will be
                deducted as penalty
              </p>
            </div>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4">
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
              &#x20B9;{totalPrice.toFixed(2)}
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
              className={`rounded-md bg-transparent border w-44 outline-none p-2 text-xs ${
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
                <span>
                  &#x20B9;{(discountedTotal || totalPrice).toFixed(2)}
                </span>
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
              disabled={loading || !isPincodeValid}
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

export default CustomBuildSingleProductFinalCheckOut;
