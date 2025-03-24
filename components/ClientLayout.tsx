"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import LoadingScreen from "@/components/LoadingScreen";
import Footer from "./Footer";

// Dynamically import the components
const ReduxProvider = dynamic(() => import("@/components/ReduxProvider"), { ssr: false });
const Header = dynamic(() => import("@/components/Header"), { ssr: false });
const DraggableCircularNav = dynamic(() => import("@/components/DraggableCircularNav"), { ssr: false });
const Menu = dynamic(() => import("@/components/Menu"), { ssr: false });

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDuration, setLoadingDuration] = useState<number | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Track the first paint and first contentful paint
        const [fcpEntry] = performance.getEntriesByName("first-contentful-paint");

        if (fcpEntry) {
          console.log(`First Contentful Paint: ${fcpEntry.startTime} ms`);
          setLoadingDuration(fcpEntry.startTime); // Set the loading duration to FCP
        }

        // Track component imports and other asynchronous tasks
        const prepareTasks = [
          import("@/components/ReduxProvider"),
          import("@/components/Header"),
          import("@/components/DraggableCircularNav"),
          import("@/components/Menu"),
          new Promise<void>((resolve) => {
            // Wait for window.onload to ensure all resources are fully loaded
            if (document.readyState === "complete") {
              resolve();
            } else {
              window.onload = () => resolve();
            }
          }),
          new Promise<void>((resolve) => {
            // Simulate device-specific preparation (e.g., media queries or configurations)
            const isMobile = window.matchMedia("(max-width: 768px)").matches;
            console.log(`Device is ${isMobile ? "mobile" : "desktop"}`);
            resolve();
          }),
        ];

        await Promise.all(prepareTasks);
      } catch (error) {
        console.error("Error during initialization:", error);
      } finally {
        if (loadingDuration !== null) {
          // Delay hiding the loading screen until the FCP duration has elapsed
          setTimeout(() => setIsLoading(false), loadingDuration);
        } else {
          setIsLoading(false);
        }
      }
    };

    initializeApp();
  }, [loadingDuration]);

  return (
    <>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <ReduxProvider>
          <Header />
          {children}
          <DraggableCircularNav />
          <Menu />
          <Footer />
        </ReduxProvider>
      )}
    </>
  );
} 