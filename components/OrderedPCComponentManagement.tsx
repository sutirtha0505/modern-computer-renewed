import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import dayjs from "dayjs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Download, XCircle } from "lucide-react";
import { useQRCode } from "next-qrcode";
import Image from "next/image";

// Interfaces for types
interface OrderedProduct {
  product_id: string;
}

interface Product {
  product_id: string;
  product_name: string;
  product_image: { url: string }[];
}

interface Customer {
  id: string;
  email: string;
  name: string;
  phone_no: string;
  image: string;
}
interface Order {
  order_id: string;
  customer_id: string;
  payment_id: string;
  order_status: string;
  order_address: string;
  created_at: string;
  expected_delivery_date: string;
  ordered_products: OrderedProduct[]; // Add this line
  payment_amount: number; // Add this line
}

const OrderedPCComponentManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]); // State to hold filtered orders
  const [productsMap, setProductsMap] = useState<Map<string, Product>>(
    new Map()
  );
  const [customersMap, setCustomersMap] = useState<Map<string, Customer>>(
    new Map()
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>(""); // State to hold the search query
  const [sortOrder, setSortOrder] = useState<string>("Newest");
  const [qrCodes, setQrCodes] = useState<Map<string, string>>(new Map());
  const { Image:QRCodeImage } = useQRCode();
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  const getFirstImageUrl = (images: { url: string }[]): string | null => {
    const image = images.find((img) => img.url.includes("_first"));
    return image ? image.url : null;
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);

      try {
        // Fetch orders
        const { data: ordersData, error: ordersError } = await supabase
          .from("order_table")
          .select("*");

        if (ordersError) {
          console.error("Error fetching orders:", ordersError);
          return;
        }

        setOrders(ordersData || []);
        setFilteredOrders(ordersData || []); // Set filtered orders initially

        // Fetch unique product IDs
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

        // Fetch unique customer IDs
        const uniqueCustomerIds = new Set<string>();
        ordersData?.forEach((order) => {
          uniqueCustomerIds.add(order.customer_id);
        });

        // Fetch customer details from the profile table
        const { data: customersData, error: customersError } = await supabase
          .from("users")
          .select("id, email, name, phone_no, image")
          .in("id", Array.from(uniqueCustomerIds));

        if (customersError) {
          console.error("Error fetching customers:", customersError);
          return;
        }

        const customerMap = new Map<string, Customer>();
        customersData?.forEach((customer: Customer) => {
          customerMap.set(customer.id, customer);
        });

        setCustomersMap(customerMap);
      } catch (error) {
        console.error("Unexpected error fetching orders or products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);
  // Sorting logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortOrder === "Newest") {
      return dayjs(b.created_at).isAfter(dayjs(a.created_at)) ? 1 : -1;
    } else if (sortOrder === "Oldest") {
      return dayjs(a.created_at).isAfter(dayjs(b.created_at)) ? 1 : -1;
    }
    return 0;
  });

  // Function to handle filtering
  const handleFilter = () => {
    const query = searchQuery.toLowerCase();

    const filtered = orders.filter((order) => {
      const customer = customersMap.get(order.customer_id);
      return (
        order.order_id.toLowerCase().includes(query) ||
        order.payment_id.toLowerCase().includes(query) ||
        customer?.name?.toLowerCase().includes(query) ||
        customer?.email?.toLowerCase().includes(query) ||
        order.order_status.toLowerCase().includes(query) // Ensures 'Shipped' or any other status is filtered
      );
    });

    setFilteredOrders(filtered);
  };

  // Function to clear the filter
  const clearFilter = () => {
    setSearchQuery(""); // Reset search query
    setFilteredOrders(orders); // Reset filtered orders to original orders
  };

  // Generate QR codes when orders and customersMap are ready
  useEffect(() => {
    if (orders.length > 0 && customersMap.size > 0) {
      generateQRCodes(orders, customersMap);
    }
  }, [orders, customersMap]);

  // Function to generate QR codes automatically on load
  const generateQRCodes = (
    ordersData: Order[],
    customerMap: Map<string, Customer>
  ) => {
    const newQrCodes = new Map<string, string>();

    ordersData.forEach((order) => {
      const customer = customerMap.get(order.customer_id);
      if (customer) {
        const qrData = `
          Order ID: ${order.order_id}
          Customer Name: ${customer?.name || "Unknown Name"}
          Phone No: ${customer?.phone_no}
          E-Mail: ${customer?.email || "Unknown Email"}
          Address: ${order.order_address}
          Delivery Date: ${dayjs(order.expected_delivery_date).format(
          "MMM D, YYYY"
        )}
        `;

        newQrCodes.set(order.order_id, qrData);
      }
    });

    setQrCodes(newQrCodes); // Store the generated QR code data in state
  };
  const convertToCSV = () => {
    const selectedData = sortedOrders.filter((order) =>
      selectedOrders.has(order.order_id)
    );

    // Create CSV content
    const csvContent = [
      ["Order ID", "Customer Name", "Contact No.", "Email", "Address", "Order Status"], // Header
      ...selectedData.map((order) => [
        order.order_id,
        customersMap.get(order.customer_id)?.name || "Unknown Name",
        customersMap.get(order.customer_id)?.email,
        customersMap.get(order.customer_id)?.phone_no,
        order.order_address,
        order.order_status,
      ]),
    ]
      .map((e) => e.join(",")) // Join rows
      .join("\n"); // Join with newline

    // Create a Blob and download it
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "selected_orders.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full h-full justify-center items-center flex flex-col pt-8 mb-12    ">
      <h1 className="text-xl font-bold text-center">
        <span className="text-indigo-500">Ordered PC Component</span> Orders
      </h1>

      {/* Filter Section */}
      <div className="flex justify-center items-center w-full gap-6 py-4 px-8">
        <input
          type="text"
          placeholder="Search by order ID, payment ID, customer details, or order status"
          value={searchQuery} // Bind the input value to state
          onChange={(e) => setSearchQuery(e.target.value)} // Update the search query state
          className="w-full px-4 py-2 border rounded-md bg-transparent"
        />
        {/* Clear Filter Icon */}
        {searchQuery && ( // Show the clear button only if there's a search query
          <button
            className="text-red-500 hover:text-red-700"
            onClick={clearFilter}
            aria-label="Clear filter"
          >
            <XCircle size={24} />
          </button>
        )}
        <button
          className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md"
          onClick={handleFilter} // Call handleFilter on click
        >
          Filter
        </button>
      </div>
      <div className="flex justify-center items-center gap-4">
        {/* Newest to oldest or vice versa dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-order" className="text-sm font-semibold">
            Sort by:
          </label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="Newest">Newest</option>
            <option value="Oldest">Oldest</option>
          </select>
        </div>
        <button
          onClick={convertToCSV}
          className={`${selectedOrders.size === 0
            ? "bg-gray-400"
            : "bg-green-500 hover:bg-transparent hover:text-green-500 border-green-500 border-1"
            } font-bold py-2 px-4 rounded-md cursor-pointer text-xs flex gap-2 justify-center items-center`}
          disabled={selectedOrders.size === 0} // Disable if no rows are selected
        >
          <Download /> Convert to CSV
        </button>
      </div>


      {/* Table Section */}
      <div className="w-full flex items-center overflow-x-auto p-8 scrollbar-hide">
        <table className="min-w-full text-left table-auto border-collapse">
          <thead>
            <tr className="bg-gray-800 w-full">
              <th className="px-4 py-2 border text-center w-[5%]">Order ID</th>
              <th className="px-4 py-2 border text-center w-[5%]">
                Payment ID
              </th>
              <th className="px-4 py-2 border text-center w-[25%]">
                Customer Details
              </th>
              <th className="px-4 py-2 border text-center w-[5%]">
                Customer Address
              </th>
              <th className="px-4 py-2 border text-center w-[30%]">
                Ordered Products
              </th>
              <th className="px-4 py-2 border text-center w-[12%]">
                Order Status
              </th>
              <th className="px-4 py-2 border text-center w-[13%]">
                Expected Delivery Date
              </th>
              <th className="px-4 py-2 border text-center w-[5%]">
                Contact Customer
              </th>
              <th className="px-4 py-2 border text-center w-[5%]">Refund</th>
              <th className="px-4 py-2 border text-center w-[5%]">QR Code</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center px-4 py-2 border">
                  Loading...
                </td>
              </tr>
            ) : (
              sortedOrders.map((order) => {
                const customer = customersMap.get(order.customer_id);
                const isSelected = selectedOrders.has(order.order_id); // Check if the row is selected

                return (
                  <tr
                    key={order.order_id}
                    className={isSelected ? "bg-gray-800" : ""}
                  >
                    <td onClick={() => {
                      const newSelectedOrders = new Set(selectedOrders);
                      if (newSelectedOrders.has(order.order_id)) {
                        newSelectedOrders.delete(order.order_id);
                      } else {
                        newSelectedOrders.add(order.order_id);
                      }
                      setSelectedOrders(newSelectedOrders);
                    }}
                      className={`px-4 py-2 border w-[5%] break-all text-xs select-text ${isSelected ? "bg-gray-800" : ""
                        }`}
                    >
                      {order.order_id}
                    </td>
                    <td
                      className="px-4 py-2 break-all border w-[5%] text-xs select-text cursor-pointer hover:text-indigo-500"
                      onClick={() => {
                        window.open(
                          `https://dashboard.razorpay.com/app/payments/${order.payment_id}?init_page=Payments`
                        );
                      }}
                    >
                      {order.payment_id}
                    </td>
                    <td className="px-4 py-2 border w-[25%] text-xs">
                      <div className="flex flex-wrap items-center gap-2 justify-center mb-3">
                        {customer?.image && (
                          <Image
                            src={customer.image}
                            alt={customer.name}
                            className="w-8 h-8 rounded-full object-cover"
                            width={500}
                            height={500}
                          />
                        )}
                        <p className="text-center">
                          {customer?.name || "Unknown Name"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 justify-center items-center">
                        <div
                          className="flex gap-2 justify-center items-center cursor-pointer hover:text-indigo-500"
                          onClick={() => {
                            window.open(
                              `mailto:${customer?.email}`,
                              "Wishing you a heartily welcome from Modern Computer, Belgharia."
                            );
                          }}
                        >
                          <Image
                            src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/gmail.png"
                            alt=""
                            className="w-4 h-4"
                            width={200}
                            height={200}
                          />
                          <p className="break-all">
                            {customer?.email || "Unknown Email"}
                          </p>
                        </div>
                        <div
                          className="flex gap-2 justify-center items-center cursor-pointer hover:text-indigo-500"
                          onClick={() => {
                            window.open(`tel:${customer?.phone_no}`);
                          }}
                        >
                          <Image
                            src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/call.png"
                            alt=""
                            className="w-4 h-4"
                            width={200}
                            height={200}
                          />
                          <p>{customer?.phone_no}</p>
                        </div>
                      </div>
                    </td>
                    <td
                      className="px-4 py-2 border w-[5%] text-xs cursor-pointer hover:text-indigo-500"
                      onClick={() => {
                        const address = encodeURIComponent(order.order_address);
                        window.open(
                          `https://www.google.com/maps/search/?api=1&query=${address}`,
                          "_blank"
                        );
                      }}
                    >
                      {order.order_address}
                    </td>

                    <td className="px-4 py-2 border w-[30%]">
                      {order.ordered_products.map((product: OrderedProduct) => {
                        const productDetails = productsMap.get(
                          product.product_id
                        );
                        const firstImageUrl = productDetails
                          ? getFirstImageUrl(productDetails.product_image)
                          : null;

                        return (
                          <div
                            key={product.product_id}
                            className="flex flex-wrap justify-center items-center gap-2 cursor-pointer"
                            onClick={() => {
                              window.open(`/product/${product.product_id}`);
                            }}
                          >
                            {firstImageUrl && (
                              <Image
                                src={firstImageUrl}
                                alt={
                                  productDetails?.product_name ||
                                  "Product Image"
                                }
                                className="w-8 h-8 object-cover"
                                width={500}
                                height={500}
                              />
                            )}
                            <span className="text-xs hover:text-indigo-500">
                              {productDetails?.product_name
                                ? productDetails.product_name.length > 25
                                  ? `${productDetails.product_name.slice(
                                    0,
                                    25
                                  )}...`
                                  : productDetails.product_name
                                : "Unknown Product"}
                            </span>
                          </div>
                        );
                      })}
                    </td>
                    <td className="px-4 py-2 border w-[12%]">
                      <select
                        value={order.order_status} // Set the current order status as the default value
                        onChange={async (e) => {
                          const newStatus = e.target.value;

                          // Update the order status in Supabase
                          const { error } = await supabase
                            .from("order_table")
                            .update({ order_status: newStatus }) // Update the order status
                            .eq("order_id", order.order_id); // Where the order_id matches

                          if (error) {
                            console.error(
                              "Error updating order status:",
                              error
                            );
                            // Optionally, show an error toast notification if there's an error
                            toast.error(
                              "Failed to update order status. Please try again."
                            );
                          } else {
                            console.log("Order status updated successfully!");

                            // Update the order status in the state immediately
                            setOrders((prevOrders) =>
                              prevOrders.map((o) =>
                                o.order_id === order.order_id
                                  ? { ...o, order_status: newStatus }
                                  : o
                              )
                            );

                            // Show a success toast notification
                            toast.success("Order Status changed successfully");
                          }
                        }}
                        className="border rounded p-1 text-xs w-full"
                      >
                        {/* Show the current order status as an option */}
                        <option value={order.order_status}>
                          {order.order_status}
                        </option>

                        {/* Add the other options: Shipped, Cancelled, Delivered, Refunded */}
                        {order.order_status !== "Shipped" && (
                          <option value="Shipped">Shipped</option>
                        )}
                        {order.order_status !== "Cancelled" && (
                          <option value="Cancelled">Cancelled</option>
                        )}
                        {order.order_status !== "Delivered" && (
                          <option value="Delivered">Delivered</option>
                        )}
                        {order.order_status !== "Refunded" && (
                          <option value="Refunded">Refunded</option>
                        )}
                      </select>
                    </td>

                    <td className="px-4 py-2 border w-[13%]">
                      <div className="flex justify-center items-center text-xs">
                        {dayjs(order.expected_delivery_date).format(
                          "MMM D, YYYY"
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 border w-[5%]">
                      <button
                        className="bg-blue-500 border-1 hover:bg-transparent hover:text-blue-500 border-blue-500 text-white px-2 py-1 w-full rounded"
                        onClick={() => {
                          const message = `Hello, You've ordered something from Modern Computer. Here is your Order ID: ${order.order_id}. We've something to talk about the order.`;
                          const encodedMessage = encodeURIComponent(message);

                          window.open(
                            `https://web.whatsapp.com/send?phone=${customer?.phone_no}&text=${encodedMessage}`
                          );
                        }}
                      >
                        Contact
                      </button>
                    </td>
                    <td className="px-4 py-2 border w-[5%]">
                      <button
                        className={`${order.order_status === "Cancelled"
                          ? "bg-red-500 border-red-500 hover:bg-transparent hover:text-red-500 text-white"
                          : "bg-gray-300 border-gray-300 text-gray-600 cursor-not-allowed"
                          } border-1 px-2 py-1 w-full rounded`}
                        onClick={async () => {
                          if (order.order_status !== "Cancelled") {
                            toast.error(
                              `Why are you refunding the product having ${order.order_status}?`
                            );
                            return;
                          } // Prevent the function from running if not cancelled

                          const orderId = order.order_id; // Get order ID
                          const paymentId = order.payment_id; // Get payment ID
                          const amount = order.payment_amount * 100; // Get payment amount (ensure this is part of your order data)

                          try {
                            const response = await fetch("/api/refund", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                order_id: orderId,
                                payment_id: paymentId,
                                amount,
                              }),
                            });

                            const data = await response.json();

                            if (response.ok) {
                              toast.success("Refund processed successfully!");
                              // Optionally, refresh the orders list or update the state
                            } else {
                              toast.error(`Refund failed: ${data.error}`);
                            }
                          } catch (error) {
                            console.error("Error during refund:", error);
                            toast.error(
                              "An error occurred while processing the refund."
                            );
                          }
                        }}
                        disabled={order.order_status !== "Cancelled"} // Disable the button if not cancelled
                      >
                        Refund
                      </button>
                    </td>
                    <td className="px-4 py-2 border w-[5%]">
                      {qrCodes.has(order.order_id) ? (
                        <QRCodeImage
                          text={qrCodes.get(order.order_id) || ""}
                          options={{
                            type: "image/jpeg",
                            quality: 0.9,
                            errorCorrectionLevel: "M",
                            margin: 1,
                            scale: 8,
                            width: 200,
                            color: {
                              dark: "#000000",
                              light: "#FFFFFF",
                            },
                          }}
                        />
                      ) : (
                        "Loading..."
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <ToastContainer />
    </div>
  );
};

export default OrderedPCComponentManagement;
