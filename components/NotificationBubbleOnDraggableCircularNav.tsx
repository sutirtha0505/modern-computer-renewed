"use client";
import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Existing types for order_table orders.
interface ProductData {
  product_id: string;
  product_name: string;
  product_image?: { url: string }[];
  created_at?: string;
}

interface OrderData {
  customer_id: string;
  products: ProductData[];
  customer_house_city?: string;
  created_at: string;
}

// Original type for raw pre-build orders (ordered_products is an array of IDs).
interface PreBuildOrderData {
  customer_id: string | null;
  ordered_products: string[];
  created_at: string;
  customer_house_city?: string;
}

// New type for enriched pre-build orders.
interface EnrichedPreBuildProduct {
  product_id: string;
  build_type: string;
  build_name: string;
  image_urls: string[];
}

interface EnrichedPreBuildOrderData {
  customer_id: string | null;
  ordered_products: EnrichedPreBuildProduct[];
  created_at: string;
  customer_house_city?: string;
}

// Additional interfaces.
interface UserData {
  id: string;
  customer_house_city: string;
}

interface ProductMapType {
  [key: string]: ProductData;
}

interface CustomerMapType {
  [key: string]: string;
}

interface PreBuildProduct {
  id: string;
  build_type: string;
  build_name: string;
  image_urls: string[];
}

interface PreBuildProductMap {
  [key: string]: {
    build_type: string;
    build_name: string;
    image_urls: string[];
  };
}

// Local interface for formatted orders.
interface FormattedOrder {
  customer_id: string;
  productIds: string[];
  created_at: string;
}

const truncateText = (text: string, wordLimit: number): string => {
  const words = text.split(" ");
  return words.length > wordLimit
    ? words.slice(0, wordLimit).join(" ") + "..."
    : text;
};

const NotificationBubbleOnDraggableCircularNav = () => {
  const router = useRouter();

  // State for orders from order_table (with user and product details)
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [currentOrdersIndex, setCurrentOrdersIndex] = useState(0);
  const [ordersVisible, setOrdersVisible] = useState(true);

  // State for enriched pre-build orders from order_table_pre_build.
  const [preBuildOrders, setPreBuildOrders] = useState<EnrichedPreBuildOrderData[]>([]);
  const [currentPreBuildIndex, setCurrentPreBuildIndex] = useState(0);
  const [preBuildVisible, setPreBuildVisible] = useState(true);

  // State for recent products (unchanged)
  const [recentProducts, setRecentProducts] = useState<ProductData[]>([]);
  const [currentRecentIndex, setCurrentRecentIndex] = useState(0);
  const [recentVisible, setRecentVisible] = useState(true);

  // New state to control which section is displayed.
  type Section = "orders" | "preBuild" | "recent";
  // Memoize the sections array to avoid dependency issues in useEffect.
  const sections = useMemo<Section[]>(() => ["orders", "preBuild", "recent"], []);
  const [currentSection, setCurrentSection] = useState<Section>("orders");
  // For fade transitions for the overall section.
  const [sectionVisible, setSectionVisible] = useState(true);

  const [showContainer, setShowContainer] = useState(true);

  const fadeDuration = 500; // duration in ms for fade transition
  const displayInterval = 5000; // total time each item is displayed

  const renderRelativeTime = (created_at: string) => {
    const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const localDate = toZonedTime(new Date(created_at), localTimeZone);
    return formatDistanceToNow(localDate, { addSuffix: true });
  };

  /*** Fetch orders from order_table ***/
  useEffect(() => {
    const fetchOrders = async () => {
      const { data: ordersData, error: orderError } = await supabase
        .from("order_table")
        .select("ordered_products, customer_id, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      if (orderError) {
        console.error("Error fetching orders:", orderError);
        return;
      }

      // Format orders – extract product IDs.
      const formattedOrders: FormattedOrder[] = ordersData.map(
        (order: { customer_id: string; ordered_products: { product_id: string }[]; created_at: string }) => ({
          customer_id: order.customer_id,
          productIds: order.ordered_products?.map(
            (prod: { product_id: string }) => prod.product_id
          ) || [],
          created_at: order.created_at,
        })
      );

      // Get customer details.
      const customerIds = Array.from(
        new Set(formattedOrders.map((order) => order.customer_id).filter(Boolean))
      );
      let customerMap: CustomerMapType = {};
      if (customerIds.length > 0) {
        const { data: usersData, error: userError } = await supabase
          .from("users")
          .select("id, customer_house_city")
          .in("id", customerIds);
        if (userError) {
          console.error("Error fetching user details:", userError);
        } else if (usersData) {
          customerMap = usersData.reduce((acc: CustomerMapType, user: UserData) => {
            acc[user.id] = user.customer_house_city;
            return acc;
          }, {});
        }
      }

      // Fetch product details.
      const allProductIds = Array.from(
        new Set(formattedOrders.flatMap((order) => order.productIds))
      );
      let productMap: ProductMapType = {};
      if (allProductIds.length > 0) {
        const { data: productsData, error: productError } = await supabase
          .from("products")
          .select("product_id, product_name, product_image")
          .in("product_id", allProductIds);
        if (productError) {
          console.error("Error fetching product details:", productError);
        } else if (productsData) {
          productMap = productsData.reduce((acc: ProductMapType, product: ProductData) => {
            acc[product.product_id] = product;
            return acc;
          }, {});
        }
      }

      const ordersWithProducts: OrderData[] = formattedOrders.map((order) => ({
        customer_id: order.customer_id,
        customer_house_city: order.customer_id ? customerMap[order.customer_id] : undefined,
        created_at: order.created_at,
        products: order.productIds
          .map((pid: string) => productMap[pid])
          .filter((prod): prod is ProductData => Boolean(prod)),
      }));

      setOrders(ordersWithProducts);
    };

    fetchOrders();
  }, []);

  /*** Fetch orders from order_table_pre_build and enrich them ***/
  useEffect(() => {
    const fetchPreBuildOrders = async () => {
      const { data: preBuildData, error: preBuildError } = await supabase
        .from("order_table_pre_build")
        .select("customer_id, ordered_products, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      if (preBuildError) {
        console.error("Error fetching pre-build orders:", preBuildError);
        return;
      }

      const ordersWithUser: PreBuildOrderData[] = preBuildData.map(
        (order: PreBuildOrderData) => ({
          ...order,
          customer_house_city: order.customer_id ? order.customer_house_city : "Unknown",
        })
      );

      // Get unique customer IDs and fetch user details.
      const uniqueCustomerIds = Array.from(
        new Set(ordersWithUser.map((order) => order.customer_id).filter((id): id is string => Boolean(id)))
      );
      let customerMap: CustomerMapType = {};
      if (uniqueCustomerIds.length > 0) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, customer_house_city")
          .in("id", uniqueCustomerIds);
        if (userError) {
          console.error("Error fetching user details:", userError);
        } else if (userData) {
          customerMap = userData.reduce((acc: CustomerMapType, user: UserData) => {
            acc[user.id] = user.customer_house_city;
            return acc;
          }, {});
        }
      }

      // Re-map orders to include customer_house_city.
      const ordersWithCustomer: PreBuildOrderData[] = ordersWithUser.map((order) => ({
        ...order,
        customer_house_city: order.customer_id ? customerMap[order.customer_id] : "Unknown",
      }));

      // Collect all product IDs.
      const allProductIds: string[] = [];
      ordersWithCustomer.forEach((order) => {
        if (Array.isArray(order.ordered_products)) {
          allProductIds.push(...order.ordered_products);
        }
      });
      const uniqueProductIds = Array.from(new Set(allProductIds));

      let preBuildProductMap: PreBuildProductMap = {};
      if (uniqueProductIds.length > 0) {
        const { data: preBuildProductsData, error: preBuildProductsError } =
          await supabase
            .from("pre_build")
            .select("id, build_type, build_name, image_urls")
            .in("id", uniqueProductIds);
        if (preBuildProductsError) {
          console.error("Error fetching pre-build product details:", preBuildProductsError);
        } else if (preBuildProductsData) {
          preBuildProductMap = preBuildProductsData.reduce(
            (acc: PreBuildProductMap, product: PreBuildProduct) => {
              acc[product.id] = {
                build_type: product.build_type,
                build_name: product.build_name,
                image_urls: product.image_urls,
              };
              return acc;
            },
            {}
          );
        }
      }

      const enrichedOrders: EnrichedPreBuildOrderData[] = ordersWithCustomer.map(
        (order) => ({
          ...order,
          ordered_products: order.ordered_products.map((prodId: string) => {
            const details = preBuildProductMap[prodId] || {
              build_type: "",
              build_name: "",
              image_urls: [],
            };
            return {
              product_id: prodId,
              build_type: details.build_type,
              build_name: details.build_name,
              image_urls: details.image_urls,
            };
          }),
        })
      );

      setPreBuildOrders(enrichedOrders);
    };

    fetchPreBuildOrders();
  }, []);

  /*** Fetch recent products from products table ***/
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

  // Cycle through the individual items within each section.
  useEffect(() => {
    if (orders.length > 0) {
      const interval = setInterval(() => {
        setOrdersVisible(false);
        setTimeout(() => {
          setCurrentOrdersIndex((prev) => (prev + 1) % orders.length);
          setOrdersVisible(true);
        }, fadeDuration);
      }, displayInterval);
      return () => clearInterval(interval);
    }
  }, [orders]);

  useEffect(() => {
    if (preBuildOrders.length > 0) {
      const interval = setInterval(() => {
        setPreBuildVisible(false);
        setTimeout(() => {
          setCurrentPreBuildIndex((prev) => (prev + 1) % preBuildOrders.length);
          setPreBuildVisible(true);
        }, fadeDuration);
      }, displayInterval);
      return () => clearInterval(interval);
    }
  }, [preBuildOrders]);

  useEffect(() => {
    if (recentProducts.length > 0) {
      const interval = setInterval(() => {
        setRecentVisible(false);
        setTimeout(() => {
          setCurrentRecentIndex((prev) => (prev + 1) % recentProducts.length);
          setRecentVisible(true);
        }, fadeDuration);
      }, displayInterval);
      return () => clearInterval(interval);
    }
  }, [recentProducts]);

  // Cycle through the three sections randomly.
  useEffect(() => {
    const sectionInterval = setInterval(() => {
      setSectionVisible(false);
      setTimeout(() => {
        // Randomly pick a new section different from the current.
        const available = sections.filter((sec) => sec !== currentSection);
        const newSection =
          available[Math.floor(Math.random() * available.length)];
        setCurrentSection(newSection);
        setSectionVisible(true);
      }, fadeDuration);
    }, displayInterval);
    return () => clearInterval(sectionInterval);
  }, [currentSection, sections]);

  // Handle container visibility (close/hide).
  const handleClose = () => {
    setShowContainer(false);
    setTimeout(() => {
      setShowContainer(true);
    }, 90000);
  };

  if (!showContainer) {
    return null;
  }

  // Helper functions for rendering each section.
  const renderOrdersSection = () => {
    if (!orders[currentOrdersIndex]) {
      return <p className="text-black text-xs">Loading recent orders...</p>;
    }
    const currentOrder = orders[currentOrdersIndex];
    return (
      <div
        style={{
          transition: `opacity ${fadeDuration}ms ease-in-out`,
          opacity: ordersVisible ? 1 : 0,
        }}
        className="text-center relative w-96 h-36 flex justify-center items-center bg-white/50 backdrop-blur-sm rounded-md p-2"
      >
        {currentOrder.products.length > 0 ? (
          currentOrder.products.map((product) => {
            const productImage =
              product.product_image?.find((img: { url: string }) =>
                img.url.includes("_first")
              ) || product.product_image?.[0];
            return (
              <div
                key={product.product_id}
                className="flex items-center space-x-2"
              >
                {productImage && productImage.url && (
                  <Image
                    src={productImage.url}
                    alt={product.product_name}
                    className="w-20 h-20 object-cover"
                    width={64}
                    height={64}
                  />
                )}
                <div className="text-left">
                  {currentOrder.customer_house_city && (
                    <p className="text-black text-sm font-bold">
                      Someone from {currentOrder.customer_house_city}
                    </p>
                  )}
                  <p className="text-black text-xs">
                    ordered {truncateText(product.product_name, 4)}{" "}
                    {renderRelativeTime(currentOrder.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-black text-xs">No products found</p>
        )}
        <button
          onClick={handleClose}
          className="text-3xl absolute -top-5 -right-4 font-bold p-2 text-red-500 cursor-pointer bg-gray-400 rounded-full h-8 w-8 flex justify-center items-center hover:bg-gray-700"
          aria-label="Close"
        >
          <Trash2 className="text-red-500" />
        </button>
      </div>
    );
  };

  const renderPreBuildSection = () => {
    if (!preBuildOrders[currentPreBuildIndex]) {
      return <p className="text-black text-xs">Loading pre build orders...</p>;
    }
    const currentPreBuildOrder = preBuildOrders[currentPreBuildIndex];
    return (
      <div
        style={{
          transition: `opacity ${fadeDuration}ms ease-in-out`,
          opacity: preBuildVisible ? 1 : 0,
        }}
        className="text-center relative w-96 h-36 flex justify-center items-center bg-white/50 backdrop-blur-sm rounded-md p-2"
      >
        {currentPreBuildOrder.ordered_products && currentPreBuildOrder.ordered_products.length > 0 ? (
          currentPreBuildOrder.ordered_products.map((prod, idx: number) => (
            <div key={idx} className="mt-1 flex items-center space-x-2">
              {prod.image_urls &&
               prod.image_urls.length > 0 &&
               prod.image_urls[0] && ( // Check that image_urls[0] is truthy
                <Image
                  src={prod.image_urls[0]}
                  alt={prod.build_name || "Pre Build Product"}
                  className="w-16 h-16 object-cover"
                  width={64}
                  height={64}
                />
              )}
              <div className="flex flex-col">
                <p className="text-sm text-black font-bold">
                  Someone from{" "}
                  {currentPreBuildOrder.customer_house_city || "Unknown"}
                </p>
                <p className="text-xs text-black">
                  ordered {prod.build_name || "Pre Build Product"}{" "}
                  {prod.build_type && `(${prod.build_type})`}{" "}
                  {renderRelativeTime(currentPreBuildOrder.created_at)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <span>No ordered products</span>
        )}
        <button
          onClick={handleClose}
          className="text-3xl absolute -top-5 -right-4 font-bold p-2 text-red-500 cursor-pointer bg-gray-400 rounded-full h-8 w-8 flex justify-center items-center hover:bg-gray-700"
          aria-label="Close"
        >
          <Trash2 className="text-red-500" />
        </button>
      </div>
    );
  };

  const renderRecentSection = () => {
    if (!recentProducts[currentRecentIndex]) {
      return <p className="text-black text-xs">Fetching recent products...</p>;
    }
    const product = recentProducts[currentRecentIndex];
    const productImage =
      product.product_image?.find((img: { url: string }) => img.url.includes("_first")) ||
      product.product_image?.[0];
    return (
      <div
        style={{
          transition: `opacity ${fadeDuration}ms ease-in-out`,
          opacity: recentVisible ? 1 : 0,
        }}
        className="flex flex-col justify-between items-center relative w-96 bg-white/50 backdrop-blur-sm rounded-md p-2"
      >
        <div
          className="flex flex-col items-center"
          onClick={() => {
            router.push(`/products/${product.product_id}`);
          }}
        >
          <h1 className="text-black font-bold mb-2">Newly Arrived</h1>
          {productImage && productImage.url && (
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
        <button
          onClick={handleClose}
          className="text-3xl absolute -top-5 -right-4 font-bold p-2 text-red-500 cursor-pointer bg-gray-400 rounded-full h-8 w-8 flex justify-center items-center hover:bg-gray-700"
          aria-label="Close"
        >
          <Trash2 className="text-red-500" />
        </button>
      </div>
    );
  };

  // Render the section according to currentSection.
  const renderCurrentSection = () => {
    switch (currentSection) {
      case "preBuild":
        return renderPreBuildSection();
      case "orders":
        return renderOrdersSection();
      case "recent":
        return renderRecentSection();
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        transition: `opacity ${fadeDuration}ms ease-in-out`,
        opacity: sectionVisible ? 1 : 0,
      }}
      className="flex justify-center items-center"
    >
      {renderCurrentSection()}
    </div>
  );
};

export default NotificationBubbleOnDraggableCircularNav;
