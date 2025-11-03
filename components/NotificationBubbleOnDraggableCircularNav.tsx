"use client";
import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { formatDistanceToNow } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

// Define a type for our image URL item.
export type ImageUrl = string | { url: string };

// Existing types for order_table orders.
interface ProductData {
  product_id: string;
  product_name: string;
  product_image?: ImageUrl[];
  created_at?: string;
}

interface OrderData {
  customer_id: string;
  products: ProductData[];
  customer_house_city?: string;
  created_at: string;
}

// Original type for raw pre-build orders.
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
  image_urls: ImageUrl[];
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

// Helper function to safely extract a URL from an ImageUrl.
const getImgUrl = (img: ImageUrl): string => {
  if (typeof img === "string") return img;
  if (img && typeof img === "object" && typeof img.url === "string") return img.url;
  return "";
};

const truncateText = (text: string, wordLimit: number): string => {
  const words = text.split(" ");
  return words.length > wordLimit
    ? words.slice(0, wordLimit).join(" ") + "..."
    : text;
};

const NotificationBubbleOnDraggableCircularNav = () => {
  // Router for navigation when clicking toast content.
  const router = useRouter();

  // State for orders from order_table (with user and product details)
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [currentOrdersIndex, setCurrentOrdersIndex] = useState(0);

  // State for enriched pre-build orders from order_table_pre_build.
  const [preBuildOrders, setPreBuildOrders] = useState<EnrichedPreBuildOrderData[]>([]);
  const [currentPreBuildIndex, setCurrentPreBuildIndex] = useState(0);

  // State for recent products.
  const [recentProducts, setRecentProducts] = useState<ProductData[]>([]);
  const [currentRecentIndex, setCurrentRecentIndex] = useState(0);

  // Section control.
  type Section = "orders" | "preBuild" | "recent";
  const sections = useMemo<Section[]>(() => ["orders", "preBuild", "recent"], []);
  const [currentSection, setCurrentSection] = useState<Section>("orders");

  // We'll show a toast and update it periodically. Make this less frequent.
  const displayInterval = 30000; // 30s per item (was 5000)

  // (no persistent toast id required for transient toasts)

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

      const formattedOrders: FormattedOrder[] = ordersData.map(
        (order: {
          customer_id: string;
          ordered_products: { product_id: string }[];
          created_at: string;
        }) => ({
          customer_id: order.customer_id,
          productIds: order.ordered_products?.map(
            (prod: { product_id: string }) => prod.product_id
          ) || [],
          created_at: order.created_at,
        })
      );

      // Get customer details.
      const customerIds = Array.from(
        new Set(formattedOrders.map(order => order.customer_id).filter(Boolean))
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
        new Set(formattedOrders.flatMap(order => order.productIds))
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

      const ordersWithProducts: OrderData[] = formattedOrders.map(order => ({
        customer_id: order.customer_id,
        customer_house_city: order.customer_id ? customerMap[order.customer_id] : undefined,
        created_at: order.created_at,
        products: order.productIds
          .map(pid => productMap[pid])
          .filter((prod): prod is ProductData => Boolean(prod)),
      }));

      setOrders(ordersWithProducts);
    };

    fetchOrders();
  }, []);

  /*** Fetch and enrich pre-build orders ***/
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

      // Get unique customer IDs.
      const uniqueCustomerIds = Array.from(
        new Set(ordersWithUser.map(order => order.customer_id).filter((id): id is string => Boolean(id)))
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

      const ordersWithCustomer: PreBuildOrderData[] = ordersWithUser.map(order => ({
        ...order,
        customer_house_city: order.customer_id ? customerMap[order.customer_id] : "Unknown",
      }));

      // Collect all product IDs.
      const allProductIds: string[] = [];
      ordersWithCustomer.forEach(order => {
        if (Array.isArray(order.ordered_products)) {
          allProductIds.push(...order.ordered_products);
        }
      });
      const uniqueProductIds = Array.from(new Set(allProductIds));

      let preBuildProductMap: PreBuildProductMap = {};
      if (uniqueProductIds.length > 0) {
        const { data: preBuildProductsData, error: preBuildProductsError } = await supabase
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

      // Enrich pre-build orders.
      const enrichedOrders: EnrichedPreBuildOrderData[] = ordersWithCustomer.map(order => ({
        ...order,
        ordered_products: order.ordered_products.map(prodId => {
          const details = preBuildProductMap[prodId] || { build_type: "", build_name: "", image_urls: [] };
          return {
            product_id: prodId,
            build_type: details.build_type,
            build_name: details.build_name,
            image_urls: details.image_urls.map(url =>
              typeof url === "string" ? { url } : url
            ),
          };
        }),
      }));

      setPreBuildOrders(enrichedOrders);
    };

    fetchPreBuildOrders();
  }, []);

  /*** Fetch recent products ***/
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

  // Build the toast content component for different sections
  const ToastContent: React.FC<{ section: Section; index: number; onInnerClick?: (navigateTo?: string) => void }> = ({ section, index, onInnerClick }) => {
    if (section === "orders") {
      const currentOrder = orders[index];
      if (!currentOrder) return <div>Loading recent orders...</div>;
      const product = currentOrder.products[0];
      const imgItem: ImageUrl | undefined =
        product?.product_image?.find(img => getImgUrl(img).includes("_first")) || product?.product_image?.[0];
      const imageUrl: string = imgItem ? getImgUrl(imgItem) : "";
      return (
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => {
            if (product && onInnerClick) {
              onInnerClick(`/product/${product.product_id}`);
            }
          }}
        >
          {imageUrl && (
            <Image src={imageUrl} alt={product.product_name} width={64} height={64} className="object-cover" />
          )}
          <div>
            <div className="font-bold text-sm">Someone from {currentOrder.customer_house_city}</div>
            <div className="text-xs">ordered {truncateText(product.product_name, 4)} • {renderRelativeTime(currentOrder.created_at)}</div>
          </div>
        </div>
      );
    }

    if (section === "preBuild") {
      const order = preBuildOrders[index];
      if (!order) return <div>Loading pre-build orders...</div>;
      const prod = order.ordered_products[0];
      const imgItem: ImageUrl | undefined = prod?.image_urls?.find(img => getImgUrl(img).includes("_first")) || prod?.image_urls?.[0];
      const imageUrl: string = imgItem ? getImgUrl(imgItem) : "";
      return (
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => {
            if (prod && onInnerClick) {
              onInnerClick(`/pre-build-pc/${prod.product_id}`);
            }
          }}
        >
          {imageUrl && (
            <Image src={imageUrl} alt={prod.build_name || "Pre Build"} width={64} height={64} className="object-cover" />
          )}
          <div>
            <div className="font-bold text-sm">Someone from {order.customer_house_city || "Unknown"}</div>
            <div className="text-xs">ordered {prod.build_name || "Pre Build"} {prod.build_type && `(${prod.build_type})`} • {renderRelativeTime(order.created_at)}</div>
          </div>
        </div>
      );
    }

    // recent
    const product = recentProducts[index];
    if (!product) return <div>Fetching recent products...</div>;
    const imgItem: ImageUrl | undefined = product.product_image?.find(img => getImgUrl(img).includes("_first")) || product.product_image?.[0];
    const imageUrl: string = imgItem ? getImgUrl(imgItem) : "";
    return (
      <div
        className="flex items-center space-x-3 cursor-pointer"
        onClick={() => {
          if (onInnerClick) onInnerClick(`/product/${product.product_id}`);
        }}
      >
        {imageUrl && (
          <Image src={imageUrl} alt={product.product_name} width={64} height={64} className="object-cover" />
        )}
        <div>
          <div className="font-bold text-sm">Newly Arrived</div>
          <div className="text-xs">{truncateText(product.product_name, 6)}</div>
        </div>
      </div>
    );
  };

  // Show a transient toast for the provided section/index. Toast will auto-close.
  const showTransientToast = (section: Section, idx: number) => {
    // Create a toast id that will be available to the click handler via closure.
    let transientId: string | number | null = null;

    // Handler passed into the content to allow navigation and dismissal.
    const onInnerClick = (navigateTo?: string) => {
      if (transientId !== null) toast.dismiss(transientId);
      if (navigateTo) router.push(navigateTo);
    };

    const content = <ToastContent section={section} index={idx} onInnerClick={onInnerClick} />;

    transientId = toast(content, {
      position: "bottom-left",
      autoClose: 8000, // 8s visible
      closeOnClick: true,
      closeButton: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  // Cycle indices and sections periodically, updating the toast instead of rendering in place
  useEffect(() => {
    // Only show toasts when there is data available for the active section.
    const maybeShow = () => {
      if (currentSection === "orders" && orders.length > 0) {
        showTransientToast("orders", currentOrdersIndex);
      } else if (currentSection === "preBuild" && preBuildOrders.length > 0) {
        showTransientToast("preBuild", currentPreBuildIndex);
      } else if (currentSection === "recent" && recentProducts.length > 0) {
        showTransientToast("recent", currentRecentIndex);
      }
    };

    // initial show after a short delay to allow fetches to populate
    const initialTimeout = setTimeout(maybeShow, 2000);

    const sectionInterval = setInterval(() => {
      // move to next section
      const available = sections.filter(sec => sec !== currentSection);
      const newSection = available[Math.floor(Math.random() * available.length)];
      setCurrentSection(newSection);
      // show toast for the new section once switched
      // small delay to let index changes settle
      setTimeout(maybeShow, 500);
    }, displayInterval);

    return () => {
      clearInterval(sectionInterval);
      clearTimeout(initialTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSection, orders.length, preBuildOrders.length, recentProducts.length, currentOrdersIndex, currentPreBuildIndex, currentRecentIndex]);

  // No persistent toast to sync; toasts are transient and created by the main interval/effects.

  // Individual cycling for orders / prebuild / recent (slower rate)
  useEffect(() => {
    if (orders.length === 0) return;
    const interval = setInterval(() => {
      setCurrentOrdersIndex(prev => (prev + 1) % orders.length);
    }, displayInterval * 2); // show each order for 60s
    return () => clearInterval(interval);
  }, [orders]);

  useEffect(() => {
    if (preBuildOrders.length === 0) return;
    const interval = setInterval(() => {
      setCurrentPreBuildIndex(prev => (prev + 1) % preBuildOrders.length);
    }, displayInterval * 2);
    return () => clearInterval(interval);
  }, [preBuildOrders]);

  useEffect(() => {
    if (recentProducts.length === 0) return;
    const interval = setInterval(() => {
      setCurrentRecentIndex(prev => (prev + 1) % recentProducts.length);
    }, displayInterval * 2);
    return () => clearInterval(interval);
  }, [recentProducts]);

  // clicking toast should navigate if user clicks the content area
  // react-toastify doesn't provide direct onClick for custom render, but closeButton is present.

  return null; // this component only manages toasts
};

export default NotificationBubbleOnDraggableCircularNav;
