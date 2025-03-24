"use client";
import Image from "next/image";
import { BadgeCheck, CircleX } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { getCart, removeFromTheCart, updateQuantity } from "@/redux/cartSlice";
import { useRouter } from "next/navigation";

// Define the product type
interface Product {
  product_id: string;
  product_name: string;
  product_SP: number;
  product_MRP: number;
  product_discount: number;
  product_image: { url: string }[];
  quantity: number;
}

const ShoppingCart = () => {
  const router = useRouter();
  const cart = useAppSelector(getCart) as Product[];
  const dispatch = useAppDispatch();

  const handleQuantityChange = (productId: string, quantity: string) => {
    dispatch(updateQuantity({ productId, quantity: Number(quantity) }));
  };

  // Calculate the total sum
  const totalSum = cart
    .reduce((sum, product) => sum + product.product_SP * product.quantity, 0)
    .toFixed(2);

  // Calculate the sum of all MRPs
  const totalMRP = cart
    .reduce((sum, product) => sum + product.product_MRP * product.quantity, 0)
    .toFixed(2);

  // Calculate the total savings
  const totalSavings = (parseFloat(totalMRP) - parseFloat(totalSum)).toFixed(2);

  const handleProceedToCheckout = () => {
    const updatedCart = cart.map((product) => {
      const imageUrl = product.product_image?.find((img) =>
        img.url.includes("_first")
      )?.url;

      return { ...product, imageUrl };
    });

    const cartString = encodeURIComponent(JSON.stringify(updatedCart));
    router.push(`/checkout-cart?cart=${cartString}`);
  };

  return (
    <div className="flex flex-col gap-6 mt-7 h-full min-h-screen">
      <h1 className="font-extrabold text-3xl text-center text-indigo-600">Shopping Cart</h1>
      {cart.length === 0 ? (
        <div className="w-full h-full justify-center items-center">
          <p className="text-center">No items in cart</p>
        </div>
        
      ) : (
        cart.map((product) => {
          const imageUrl = product.product_image?.find((img) =>
            img.url.includes("_first")
          )?.url;

          return (
            <div
              className="flex flex-col md:flex-row scale-85 md:scale-100 bg-white/50 custom-backdrop-filter rounded-lg p-2"
              key={product.product_id}
            >
              <div className="md:w-[10%] flex justify-center items-center">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.product_name}
                    width={200}
                    height={500}
                  />
                ) : (
                  <p>No image available</p>
                )}
              </div>
              <div className="md:w-[50%] flex flex-col gap-4 p-4">
                <p className="text-sm font-extrabold">{product.product_name}</p>
                <div className="flex gap-6 items-center flex-wrap justify-center">
                  <p className="text-md font-extrabold">
                    &#x20B9;{product.product_SP}
                  </p>
                  <div className="flex gap-2 ">
                    <p className="text-sm font-bold text-green-300">
                      ({product.product_discount}% off)
                    </p>
                    <p className="line-through text-[#b8b4b4] text-sm">
                      &#x20B9;{product.product_MRP}
                    </p>
                  </div>
                  <button
                    onClick={() => dispatch(removeFromTheCart(product.product_id))}
                    className="flex gap-2 border-2 font-extrabold text-xs border-red-500 bg-red-500 p-2 rounded-lg items-center hover:text-red-500 hover:bg-transparent"
                  >
                    <CircleX />
                    Remove Item
                  </button>
                </div>
              </div>
              <div className="md:w-[20%] flex flex-col justify-center items-center">
                <p>Qty</p>
                <select
                  className="border border-gray-300 text-black rounded-md p-1"
                  value={product.quantity}
                  onChange={(e) =>
                    handleQuantityChange(product.product_id, e.target.value)
                  }
                >
                  {Array.from({ length: 10 }, (_, num) => (
                    <option key={num + 1} value={num + 1}>
                      {num + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:w-[20%] flex items-center justify-center gap-2">
                <p className="font-extrabold text-sm">Total:</p>
                <p className="font-extrabold text-md text-indigo-500">
                  &#x20B9;{(product.product_SP * product.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          );
        })
      )}
      {cart.length > 0 && (
        <div className="flex justify-center p-4 mt-4 border-t border-gray-300">
          <div className="dark:bg-slate-700 bg-slate-300 custom-backdrop-filter min-w-fit w-[30%] rounded-md p-4 flex flex-col gap-4">
            <div className="flex justify-between">
              <p className="font-extrabold text-xs">Item(s) Total : </p>
              <p className="text-xs font-extrabold">&#x20B9;{totalSum}</p>
            </div>
            <div className="flex justify-between border-b">
              <p className="font-extrabold text-xs">Delivery Charges :</p>
              <p className="text-xs font-extrabold">Free</p>
            </div>
            <div className="flex justify-between border-b border-dashed p-2 items-center">
              <div className="flex flex-col">
                <p className="font-extrabold text-md">Amount Payable : </p>
                <p className="text-xs font-extrabold uppercase">
                  (including all taxes)
                </p>
              </div>
              <p className="text-md font-extrabold">&#x20B9;{totalSum}</p>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <BadgeCheck className="text-green-800 dark:text-green-400" />
              <p className="text-md text-green-700 dark:text-green-400">
                You have saved &#x20B9;{totalSavings} successfully
              </p>
            </div>
            <div className="flex justify-center">
              <button
                className="bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 h-10 w-36 rounded-md text-l hover:text-l hover:font-bold duration-200"
                onClick={handleProceedToCheckout}
              >
                Proceed to Buy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;
