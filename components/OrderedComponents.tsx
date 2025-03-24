import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import dayjs from "dayjs";
import { CircleX } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

interface OrderedComponentsProps {
  userId: string;
}

interface OrderedProduct {
  product_id: string;
  quantity: number;
}

interface Order {
  order_id: number;
  ordered_products: OrderedProduct[];
  expected_delivery_date: string | null;
  order_status: string;
}

interface Product {
  product_id: string;
  product_name: string;
  product_image: { url: string }[];
}

const OrderedComponents: React.FC<OrderedComponentsProps> = ({ userId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [productsMap, setProductsMap] = useState<Map<string, Product>>(
    new Map()
  );

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);

      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from("order_table")
          .select(
            "order_id, ordered_products, expected_delivery_date, order_status"
          )
          .eq("customer_id", userId);

        if (ordersError) {
          console.error("Error fetching orders:", ordersError);
          return;
        }

        setOrders(ordersData || []);

        const uniqueProductIds = new Set<string>();
        ordersData?.forEach((order) => {
          order.ordered_products.forEach((product: OrderedProduct) =>
            uniqueProductIds.add(product.product_id)
          );
        });

        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("product_id, product_name, product_image")
          .in("product_id", Array.from(uniqueProductIds));

        if (productsError) {
          console.error("Error fetching products:", productsError);
          return;
        }

        const productMap = new Map<string, Product>();
        productsData?.forEach((product: Product) => {
          productMap.set(product.product_id, product);
        });

        setProductsMap(productMap);
      } catch (error) {
        console.error("Unexpected error fetching orders or products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const handleCancelOrder = async (orderId: number, orderStatus: string) => {
    if (orderStatus === "Shipped") {
      toast.error("Item is shipped. Order can't be cancelled.");
      return;
    }

    try {
      const { error } = await supabase
        .from("order_table")
        .update({
          order_status: "Cancelled",
          expected_delivery_date: null, // Set expected_delivery_date to null
        })
        .eq("order_id", orderId);

      if (error) {
        throw new Error("Error canceling order");
      }

      toast.success("Your order is cancelled. You'll be refunded soon.");
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === orderId
            ? {
                ...order,
                order_status: "Cancelled",
                expected_delivery_date: null,
              }
            : order
        )
      );
    } catch {
      toast.error("Error canceling the order.");
    }
  };

  const getFirstImageUrl = (images: { url: string }[]): string | null => {
    const image = images.find((img) => img.url.includes("_first"));
    return image ? image.url : null;
  };

  const truncateString = (str: string, maxLength: number) => {
    if (str.length > maxLength) {
      return str.slice(0, maxLength) + "...";
    }
    return str;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="flex gap-4 justify-center items-center h-full pt-12">
        <Image
          src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/components-Not%20ordered-Photoroom.png"
          alt=""
          loading="lazy"
          className="w-20 h-20"
          width={500}
          height={500}
        />
        <p className="text-center font-bold">
          No <span className="text-indigo-500">PC component</span> orders found.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <ToastContainer />
      <h1 className="text-xl font-bold">
        Your <span className="text-indigo-600">Ordered PC Components</span>
      </h1>
      <div className="flex flex-col justify-center items-center w-full p-16 gap-5">
        {orders
          .sort((a, b) => {
            const dateA = a.expected_delivery_date
              ? dayjs(a.expected_delivery_date).valueOf()
              : Infinity; // Set infinity for null dates to push them to the end
            const dateB = b.expected_delivery_date
              ? dayjs(b.expected_delivery_date).valueOf()
              : Infinity;
            return dateA - dateB;
          })
          .map((order) => {
            // Check if today's date is one day after or more than expected_delivery_date
            if (
              order.expected_delivery_date &&
              dayjs().isAfter(dayjs(order.expected_delivery_date), "day")
            ) {
              return null; // Skip rendering this div
            }

            return (
              <div
                key={order.order_id}
                className="flex flex-col border p-4 rounded-md bg-slate-300 dark:bg-slate-700 custom-backdrop-filter gap-4 justify-center items-center"
              >
                <h2 className="font-extrabold text-center">
                  Order :{" "}
                  <span className="text-indigo-600">{order.order_id}</span>
                </h2>

                <div className="w-full flex flex-wrap items-center justify-between gap-10">
                  <ol className="w-auto list-decimal">
                    {order.ordered_products.map(
                      (product: OrderedProduct, idx) => {
                        const productDetails = productsMap.get(
                          product.product_id
                        );
                        const firstImageUrl =
                          productDetails &&
                          getFirstImageUrl(productDetails.product_image);

                        return (
                          <li key={idx} className="flex gap-4 items-center">
                            <div className="flex items-center justify-between gap-6 cursor-pointer">
                              {firstImageUrl && (
                                <Image
                                  src={firstImageUrl}
                                  alt="Product Image"
                                  className="w-16 h-16 object-cover"
                                  height={500}
                                  width={500}
                                />
                              )}
                              <p className="text-sm font-semibold hover:text-indigo-600">
                                {truncateString(
                                  productDetails?.product_name ||
                                    "Unknown Product",
                                  30
                                )}
                              </p>
                              <p className="text-sm font-semibold text-indigo-600">
                                X {product.quantity}
                              </p>
                            </div>
                          </li>
                        );
                      }
                    )}
                  </ol>
                  <div className="w-auto flex flex-col justify-center items-center gap-2">
                    <div className="flex gap-2 justify-center items-center">
                      <Image
                        src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/order.png"
                        alt=""
                        className="w-8 h-8"
                        width={200}
                        height={200}
                      />
                      <p className="text-sm font-semibold text-indigo-600">
                        Order Status:
                      </p>
                    </div>
                    <p
                      className={`text-sm font-semibold capitalize ${
                        order.order_status === "Delivered"
                          ? "text-green-600"
                          : "text-yellow-500"
                      }`}
                    >
                      {order.order_status}
                    </p>
                  </div>
                  <div className="w-auto">
                    <button
                      onClick={() =>
                        handleCancelOrder(order.order_id, order.order_status)
                      }
                      className={`p-4 flex flex-row md:flex-col justify-center items-center gap-2 border-2 text-xs rounded-md font-bold ${
                        order.order_status === "ordered"
                          ? "border-red-600 bg-red-600 hover:bg-transparent hover:text-red-600"
                          : "border-gray-400 bg-gray-400 cursor-not-allowed"
                      }`}
                      disabled={
                        order.order_status === "Shipped" ||
                        order.order_status === "Cancelled" ||
                        order.order_status === "Delivered" ||
                        order.order_status === "Refunded"
                      }
                    >
                      <CircleX />
                      Cancel Order
                    </button>
                  </div>

                  <div className="w-auto flex flex-col justify-center items-center gap-4">
                    <div className="flex gap-2 justify-center items-center">
                      <Image
                        src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/delivery-truck.png"
                        alt=""
                        className="w-8 h-8"
                        height={200}
                        width={200}
                      />
                      <p className="text-sm font-semibold text-indigo-600">
                        Expected Delivery Date:
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      {dayjs(order.expected_delivery_date).format(
                        "dddd, MMMM D, YYYY"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default OrderedComponents;
