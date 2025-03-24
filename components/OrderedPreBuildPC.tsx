import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import dayjs from "dayjs";
import { CircleX } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

interface Order {
  order_id: string;
  ordered_products: string[]; // Array of product IDs
  expected_delivery_date: string | null;
  order_status: string;
}

interface Product {
  id: string;
  build_name: string;
  build_type: string;
  image_urls: { url: string }[];
}

interface OrderedPreBuildPCProps {
  userId: string;
}

const OrderedPreBuildPC: React.FC<OrderedPreBuildPCProps> = ({ userId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [productsMap, setProductsMap] = useState<Map<string, Product>>(
    new Map()
  );

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);

      try {
        // Fetch orders for the user
        const { data: ordersData, error: ordersError } = await supabase
          .from("order_table_pre_build")
          .select(
            "order_id, ordered_products, expected_delivery_date, order_status"
          )
          .eq("customer_id", userId);

        if (ordersError) {
          console.error("Error fetching orders:", ordersError);
          return;
        }

        setOrders(ordersData || []);

        // Extract unique product IDs
        const uniqueProductIds = new Set<string>();
        ordersData?.forEach((order) => {
          if (order.ordered_products && order.ordered_products.length > 0) {
            order.ordered_products.forEach((productId: string) => {
              if (productId) {
                uniqueProductIds.add(productId);
              }
            });
          }
        });

        if (uniqueProductIds.size === 0) {
          console.log("No product IDs found in orders.");
          return;
        }

        // Fetch product details from pre_build table using the product IDs
        const { data: productsData, error: productsError } = await supabase
          .from("pre_build")
          .select("id, build_name, image_urls, build_type")
          .in("id", Array.from(uniqueProductIds));

        if (productsError) {
          console.error("Error fetching products:", productsError);
          return;
        }

        const productMap = new Map<string, Product>();
        productsData?.forEach((product: Product) => {
          productMap.set(product.id, product);
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

  const handleCancelOrder = async (orderId: string, orderStatus: string) => {
    if (orderStatus === "Shipped") {
      toast.error("Item is shipped. Order can't be cancelled.");
      return;
    }

    try {
      const { error } = await supabase
        .from("order_table_pre_build")
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
      <div className="flex gap-4 justify-center items-center h-full">
        <Image
          src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/Prebuild-Not%20ordered-Photoroom.png"
          alt=""
          loading="lazy"
          className="w-28 h-28"
          width={500}
          height={500}
        />
        <p className="text-center font-bold">
          No <span className="text-indigo-500">Pre-Build PC</span> orders found.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <h1 className="text-lg font-bold">
        Your <span className="text-indigo-600">Ordered Pre-Build PC</span>
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
            if (
              order.expected_delivery_date &&
              dayjs().isAfter(dayjs(order.expected_delivery_date), "day")
            ) {
              return null; // Skip rendering this div
            }
            return (
              <div
                key={order.order_id}
                className="flex flex-col border p-4 rounded-md bg-slate-300 dark:bg-slate-700 custom-backdrop-filter gap-4"
              >
                <h2 className="font-extrabold text-center">
                  Order :{" "}
                  <span className="text-indigo-600">{order.order_id}</span>
                </h2>

                <div className="w-full flex flex-wrap items-center justify-between gap-10">
                  <ol className="w-auto list-decimal">
                    {order.ordered_products.map((productId, idx) => {
                      const productDetails = productsMap.get(productId);
                      const firstImageUrl =
                        productDetails &&
                        getFirstImageUrl(productDetails.image_urls);

                      return (
                        <li key={idx} className="flex gap-4 items-center">
                          <div className="flex items-center justify-between gap-6 cursor-pointer">
                            {firstImageUrl && (
                              <Image
                                src={firstImageUrl}
                                alt="Product Image"
                                className="w-16 h-16 object-cover"
                                width={500}
                                height={500}
                              />
                            )}
                            <p className="text-sm font-semibold hover:text-indigo-600">
                              {truncateString(
                                productDetails?.build_name || "Unknown Product",
                                30
                              )}{" "}
                              - {productDetails?.build_type}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                  <div className="w-auto flex flex-col justify-center items-center gap-2">
                    <div className="flex gap-2 justify-center items-center">
                      <Image
                        src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/order.png"
                        alt=""
                        className="w-8 h-8"
                        width={500}
                        height={500}
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
                      } // Disable if shipped or cancelled
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
                        height={500}
                        width={500}
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
      <ToastContainer />
    </div>
  );
};

export default OrderedPreBuildPC;
