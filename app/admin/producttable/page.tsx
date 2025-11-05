"use client";
import ProductTable from "@/components/ProductTable";
import React, { useState, useEffect } from "react";
import { BlinkBlur } from "react-loading-indicators";

const ProductTablePage = () => {
  const [loading, setLoading] = useState(true);
  const [loadingTime, setLoadingTime] = useState<number | null>(null);

  useEffect(() => {
    const startTime = performance.now();
    // Simulate loading work (for example, fetching admin data)
    // Replace the setTimeout with your actual data fetching if needed
    setTimeout(() => {
      const endTime = performance.now();
      setLoadingTime(endTime - startTime);
      setLoading(false);
    }, 8000); // simulate a 1 second loading delay
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen">
        <BlinkBlur
          color="#8a31cc"
          size="medium"
          text="Loading..."
          textColor="#8a31cc"
        />
        {loadingTime && (
          <p className="mt-4">Loading time: {loadingTime.toFixed(2)} ms</p>
        )}
      </div>
    );
  }

  return (
    <div className="pt-16 w-full min-h-screen px-4 flex flex-col items-stretch">
      <ProductTable />
    </div>
  );
};

export default ProductTablePage;
