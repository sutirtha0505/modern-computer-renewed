import { useRouter } from "next/navigation"; // Correct import for App Router
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image"; // Import Next.js Image component for optimized image rendering
import { toast, ToastContainer } from "react-toastify"; // To display toasts
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs"; // For date manipulation

interface CartItem {
  product_id: string;
  product_SP: number;
  quantity: number;
  imageUrl?: string;
  product_name: string;
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

interface CartFinalCheckOutProps {
  userId: string;
}
interface DiscountMap {
  [key: string]: number; // Keys are strings, values are numbers
}
interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
const CartFinalCheckOut: React.FC<CartFinalCheckOutProps> = ({ userId }) => {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalSum, setTotalSum] = useState<number>(0);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [couponCode, setCouponCode] = useState<string>(""); // Capture coupon code input
  const [discountedTotal, setDiscountedTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false); // Track loading state
  const [couponApplied, setCouponApplied] = useState<boolean>(false); // Track if coupon has been applied
  const [isPincodeValid, setIsPincodeValid] = useState<boolean>(true); // To check pincode validation

  // Function to handle payment logic
  const handlePayment = async () => {
    if (!isPincodeValid) return; // Disable if pincode is not valid

    setLoading(true);

    try {
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: discountedTotal,
          currency: "INR",
        }),
      });

      const data = await response.json();

      if (!window.Razorpay) {
        toast.error("Payment gateway is not available. Please try again.");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        app_name: "Modern Computer",
        description: "Your Cart Items ", // Pass concatenated product names here
        image:
          "https://supabase.moderncomputer.in/storage/v1/object/public/product-image/About/Logo.gif",
        order_id: data.id,
        handler: async (response: RazorpayResponse) => {
          toast.success("Payment successful!");

          // Save order in the database and update product amount
          await saveOrder(
            response.razorpay_order_id,
            response.razorpay_payment_id
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
          color: "#6366F1",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch {
      toast.error("Payment failed!");
    } finally {
      setLoading(false);
    }
  };
  // Function to save order details in Supabase and update product amount
  const saveOrder = async (order_id: string, payment_id: string) => {
    const expectedDeliveryDate = dayjs().add(7, "day").format("YYYY-MM-DD"); // Calculate expected delivery date

    // Create an array of objects with product ID and quantity
    const orderedProducts = cart.map((product: CartItem) => ({
      product_id: product.product_id,
      quantity: product.quantity,
    }));

    // Save order in the database
    const { error } = await supabase.from("order_table").insert([
      {
        order_id: order_id,
        payment_id: payment_id,
        customer_id: userId,
        payment_amount: discountedTotal,
        ordered_products: orderedProducts, // Insert product_id and quantity
        order_address: `${customerDetails?.customer_house_no}, ${customerDetails?.customer_house_street}, ${customerDetails?.customer_house_city}, ${customerDetails?.customer_house_pincode}`,
        expected_delivery_date: expectedDeliveryDate,
        created_at: new Date(), // Set current timestamp
      },
    ]);

    if (error) {
      toast.error("Failed to save the order. Please try again.");
      return;
    } else {
      toast.success("Order saved successfully!");

      // Update product quantities after order is saved
      await updateProductQuantities();
    }
  };

  // Function to update product quantities in the products table
  const updateProductQuantities = async () => {
    for (const product of cart) {
      const { data: productData, error: fetchError } = await supabase
        .from("products")
        .select("product_amount, date_applicable")
        .eq("product_id", product.product_id)
        .single();

      if (fetchError) {
        toast.error("Error updating product quantities. Please try again.");
        return;
      }

      // Calculate new product amount after subtracting the quantity
      const newAmount = productData.product_amount - product.quantity;

      // Update the product_amount for the corresponding product_id
      const { error: updateError } = await supabase
        .from("products")
        .update({ product_amount: newAmount })
        .eq("product_id", product.product_id);

      if (updateError) {
        toast.error("Error updating product quantities. Please try again.");
      }
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cartData = params.get("cart");

    if (cartData) {
      const parsedCart = JSON.parse(decodeURIComponent(cartData));
      setCart(parsedCart);

      // Calculate total sum directly from the cart
      const total = parsedCart.reduce(
        (sum: number, product: CartItem) =>
          sum + product.product_SP * product.quantity,
        0
      );
      setTotalSum(total);
      setDiscountedTotal(total); // Initially set discounted total as total sum
    }
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

        setCustomerDetails(data);

        // Validate pincode range and update state
        const isValid =
          data.customer_house_pincode >= 700000 &&
          data.customer_house_pincode <= 740000;
        setIsPincodeValid(isValid);

        if (!isValid) {
          toast.error("Delivery not available to the entered pincode. We're Shipping within West Bengal, India. Please visit our store and try again later.");
        }

        // If necessary details are missing, redirect to the profile page
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
        }
      } catch (error) {
        console.error("Error fetching customer details:", error);
      }
    };

    if (userId) {
      fetchCustomerDetails();
    }
  }, [userId, router]);

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

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      toast.error("Please enter a coupon code.");
      return;
    }

    // Get product IDs from the cart
    const productIds = cart.map((item) => item.product_id);

    // Query Supabase for products that match the product IDs from the cart
    const { data: products, error } = await supabase
      .from("products")
      .select(
        "product_id, coupon_code, code_equiv_percent, product_SP, product_amount, date_applicable"
      )
      .in("product_id", productIds);

    if (error) {
      toast.error("Failed to validate coupon code.");
      return;
    }

    // Get the current date for comparison
    const currentDate = dayjs(); // Using dayjs for date manipulation

    // Find products with the entered coupon code and check date applicability
    const matchedProducts = products.filter((product) => {
      const productDate = dayjs(product.date_applicable);
      return (
        product.coupon_code === couponCode && currentDate.isBefore(productDate)
      );
    });

    if (matchedProducts.length === 0) {
      // If no products match the coupon or the date has passed
      toast.error(
        "Coupon code can't be applied because you've crossed the date or it's invalid."
      );
      setCouponCode(""); // Reset input field
      return;
    }

    // Create a map of product ID to its discount percentage
    const discountMap: DiscountMap = matchedProducts.reduce((acc, product) => {
      acc[product.product_id] = product.code_equiv_percent;
      return acc;
    }, {} as DiscountMap);

    // Simulate coupon application and calculate the total with discount
    const newTotal = cart.reduce((sum, product) => {
      const discountPercent = discountMap[product.product_id] || 0;
      const discountedPrice =
        product.product_SP * product.quantity * (1 - discountPercent / 100);
      return sum + discountedPrice;
    }, 0);

    setDiscountedTotal(newTotal);
    setCouponApplied(true); // Update state to reflect coupon application
    toast.success("Coupon applied!");
  };

  return (
    <>
      <div className="w-full flex justify-center items-center p-6 gap-2 flex-col md:flex-row">
        <div className="w-full md:w-1/2 flex flex-col overflow-y-auto gap-4">
          {cart.map((product: CartItem, index: number) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 border rounded-lg bg-slate-300 dark:bg-slate-800"
            >
              {/* Display the product image */}
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.product_name}
                  width={100}
                  height={100}
                  className="rounded-lg"
                />
              ) : (
                <p>No image available</p>
              )}

              {/* Display product details */}
              <div>
                <p className="font-bold text-sm">{product.product_name}</p>
                <p>Quantity: {product.quantity}</p>
                <p className="text-indigo-500 font-extrabold">
                  Total: &#x20B9;
                  {(product.product_SP * product.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
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
                &#x20B9;{totalSum.toFixed(2)}
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
                  <span>Loading...</span> // Placeholder while loading
                ) : (
                  <span>&#x20B9;{discountedTotal.toFixed(2)}</span>
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
                disabled={!isPincodeValid || loading} // Disable button if pincode is invalid or loading
              >
                {loading ? "Processing..." : "Pay Here"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default CartFinalCheckOut;
