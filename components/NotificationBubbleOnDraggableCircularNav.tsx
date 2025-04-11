"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import Image from "next/image";

interface ProductData {
  product_id: string;
  product_name: string;
  product_image?: { url: string }[];
  created_at?: string;
}

interface OrderData {
  customer_id: string | null;
  products: ProductData[];
  customer_house_city?: string;
  created_at: string;
}

// Helper function to truncate text to a given word count.
const truncateText = (text: string, wordLimit: number): string => {
  const words = text.split(" ");
  return words.length > wordLimit
    ? words.slice(0, wordLimit).join(" ") + "..."
    : text;
};

const NotificationBubbleOnDraggableCircularNav = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [recentProducts, setRecentProducts] = useState<ProductData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [recentIndex, setRecentIndex] = useState(0);
  const [recentVisible, setRecentVisible] = useState(true);
  const [showContainer, setShowContainer] = useState(true);

  const fadeDuration = 500; // Duration in ms for fade transition
  const displayInterval = 5000; // Total time each item is displayed

  const renderRelativeTime = (created_at: string) => {
    const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const localDate = toZonedTime(new Date(created_at), localTimeZone);
    return formatDistanceToNow(localDate, { addSuffix: true });
  };

  // Fetch orders, related user details, and product details for orders
  useEffect(() => {
    const fetchOrdersAndDetails = async () => {
      // Fetch orders data
      const { data: ordersData, error: orderError } = await supabase
        .from("order_table")
        .select("ordered_products, customer_id, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      if (orderError) {
        console.error("Error fetching orders:", orderError);
        return;
      }

      // Format orders with a temporary productIds field
      const formattedOrders = ordersData.map((order: any) => ({
        customer_id: order.customer_id,
        productIds: order.ordered_products?.map((prod: any) => prod.product_id) || [],
        created_at: order.created_at,
      }));

      // Fetch user details
      const customerIds = Array.from(
        new Set(formattedOrders.map((order: any) => order.customer_id).filter(Boolean))
      );
      if (customerIds.length > 0) {
        const { data: usersData, error: userError } = await supabase
          .from("users")
          .select("id, customer_house_city")
          .in("id", customerIds);
        if (userError) {
          console.error("Error fetching user details:", userError);
        } else if (usersData) {
          const userMap = usersData.reduce((acc: any, user: any) => {
            acc[user.id] = user.customer_house_city;
            return acc;
          }, {});
          formattedOrders.forEach((order: any) => {
            if (order.customer_id && userMap[order.customer_id]) {
              order.customer_house_city = userMap[order.customer_id];
            }
          });
        }
      }

      // Extract unique product IDs from orders
      const allProductIds = Array.from(
        new Set(formattedOrders.flatMap((order: any) => order.productIds))
      );

      // Fetch products details for these orders
      let productMap: Record<string, ProductData> = {};
      if (allProductIds.length > 0) {
        const { data: productsData, error: productError } = await supabase
          .from("products")
          .select("product_id, product_name, product_image")
          .in("product_id", allProductIds);
        if (productError) {
          console.error("Error fetching product details:", productError);
        } else if (productsData) {
          // Map product_id to its details
          productMap = productsData.reduce((acc: any, product: any) => {
            acc[product.product_id] = product;
            return acc;
          }, {});
        }
      }

      // Map each order's productIds to actual product details
      const ordersWithProducts: OrderData[] = formattedOrders.map((order: any) => ({
        customer_id: order.customer_id,
        customer_house_city: order.customer_house_city,
        created_at: order.created_at,
        products: order.productIds
          .map((pid: string) => productMap[pid])
          .filter(Boolean),
      }));

      setOrders(ordersWithProducts);
    };

    fetchOrdersAndDetails();
  }, []);

  // Fetch the last three products based on latest created_at
  useEffect(() => {
    const fetchRecentProducts = async () => {
      const { data: productsData, error } = await supabase
        .from("products")
        .select("product_id, product_name, product_image, created_at")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) {
        console.error("Error fetching recent products:", error);
      } else if (productsData) {
        setRecentProducts(productsData);
      }
    };
    fetchRecentProducts();
  }, []);

  // Cycle through orders periodically with fade transitions
  useEffect(() => {
    if (orders.length === 0) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % orders.length);
        setVisible(true);
      }, fadeDuration);
    }, displayInterval);
    return () => clearInterval(interval);
  }, [orders]);

  // Cycle through recent products one by one periodically with fade transitions
  useEffect(() => {
    if (recentProducts.length === 0) return;
    const interval = setInterval(() => {
      setRecentVisible(false);
      setTimeout(() => {
        setRecentIndex((prev) => (prev + 1) % recentProducts.length);
        setRecentVisible(true);
      }, fadeDuration);
    }, displayInterval);
    return () => clearInterval(interval);
  }, [recentProducts]);

  // Function to handle closing/hiding the container
  const handleClose = () => {
    setShowContainer(false);
    // Re-show the container after 90 seconds
    setTimeout(() => {
      setShowContainer(true);
    }, 90000);
  };

  if (!showContainer) {
    return null;
  }

  // Display current order (recently ordered products)
  const currentOrder = orders[currentIndex];

  return (
    <div className="flex flex-col space-y-4">
      {/* Recently Ordered Products */}
      <div className="relative w-96 h-36 flex justify-center items-center bg-white/50 backdrop-blur-sm rounded-md p-2">
        {currentOrder ? (
          <div
            style={{
              transition: `opacity ${fadeDuration}ms ease-in-out`,
              opacity: visible ? 1 : 0,
            }}
            className="text-center"
          >
            <div className="flex items-center justify-center">
              {currentOrder.products.length > 0 ? (
                currentOrder.products.map((product) => {
                  // Use custom logic to select product image:
                  const productImage =
                    product.product_image?.find((img) =>
                      img.url.includes("_first")
                    ) || product.product_image?.[0];
                  return (
                    <div
                      key={product.product_id}
                      className="flex items-center"
                    >
                      {productImage && (
                        <Image
                          src={productImage.url}
                          alt={product.product_name}
                          className="w-32 h-32 object-cover"
                          width={128}
                          height={128}
                        />
                      )}
                      {currentOrder.customer_house_city && (
                        <p className="text-black text-sm font-bold">
                          Someone from {currentOrder.customer_house_city} ordered{" "}
                          {truncateText(product.product_name, 4)}{" "}
                          {renderRelativeTime(currentOrder.created_at)}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-black text-xs">None</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-black text-xs">Loading recent orders...</p>
        )}
        {/* Close (cross) button */}
        <button
          onClick={handleClose}
          className="text-3xl absolute -top-5 -right-4 font-bold p-2 text-red-500 cursor-pointer bg-gray-400 rounded-full h-8 w-8 flex justify-center items-center hover:bg-gray-700"
          aria-label="Close"
        >
          <Trash2 className="text-red-500" />
        </button>
      </div>

      {/* Recently Added Products (Cycling One-by-One) */}
      <div className="relative w-96 flex flex-col justify-between items-center bg-white/50 backdrop-blur-sm rounded-md p-2">
        <h1 className="text-black font-bold mb-2">Recent Products</h1>
        {recentProducts.length > 0 ? (
          <div
            style={{
              transition: `opacity ${fadeDuration}ms ease-in-out`,
              opacity: recentVisible ? 1 : 0,
            }}
            className="flex flex-col items-center"
          >
            {(() => {
              const product = recentProducts[recentIndex];
              // Use custom logic to select the product image:
              const productImage =
                product.product_image?.find((img) =>
                  img.url.includes("_first")
                ) || product.product_image?.[0];
              return (
                <div key={product.product_id} className="flex flex-col items-center">
                  {productImage && (
                    <Image
                      src={productImage.url}
                      alt={product.product_name}
                      className="w-32 h-32 object-cover"
                      width={128}
                      height={128}
                    />
                  )}
                  <p className="text-black text-sm font-bold">
                    {truncateText(product.product_name, 6)}
                  </p>
                </div>
              );
            })()}
          </div>
        ) : (
          <p className="text-black text-xs">Fetching recent products...</p>
        )}
      </div>
    </div>
  );
};

export default NotificationBubbleOnDraggableCircularNav;
