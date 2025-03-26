"use client";
import React, { useEffect, useState } from "react";
import HeaderCart from "./HeaderCart";
import CustomerDetails from "./CustomerDetails";
import { useRouter } from "next/navigation";
import CartSingleProductFinalCheckOut from "./CartSingleProductFinalCheckOut";
import { User } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";

const CheckOutSingleProduct = () => {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const getUserData = async () => {
      try {
        if (!session) {
          router.push("/login");
        } else {
          setUser(session.user as User);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, [router, session]);


  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-6">
      <HeaderCart />
      <div className="w-full pt-16">
        <h1 className="text-2xl font-bold text-center">
          Checkout for{" "}
          <span className="text-indigo-500">Your Selected Product</span>
        </h1>
        {/* Pass user.id to CustomerDetails and CartSingleProductFinalCheckOut */}
        {user && <CustomerDetails userId={user.id} />}
        {user && <CartSingleProductFinalCheckOut userId={user.id} />} {/* Pass user.id */}
      </div>
    </div>
  );
};

export default CheckOutSingleProduct;
