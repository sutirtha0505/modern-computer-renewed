"use client";
import { useEffect, useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";

export default function HydrationContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // This runs only on the client after mounting
    setHydrated(true);
  }, []);

  if (!hydrated) {
    // Keep showing the LoadingScreen until hydration completes
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
