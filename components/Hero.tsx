"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import BannerSection from "./BannerSection";
import RecentProductsShow from "./RecentProductsShow";
import { User } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";


function Hero() {
  const [user, setUser] = useState<User | null>(null);
  const [customerName, setCustomerName] = useState<string | null>(null);

  const { data: session } = useSession();

  useEffect(() => {
    const getUserData = async () => {
      if (session) {
        setUser(session.user as User);
      }

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("name")
          .eq("id", user.id)
          .single();

        if (profile) {
          setCustomerName(profile.name); // Set customer name if it exists
        }
        // else if (error) {
        //   console.error("Error fetching profile:", error);
        // }
      }
    };
    getUserData();
  }, [session, user]);

  return (
    <>
        {session ? (
        <p className="text-4xl md:text-6xl font-extrabold text-center pt-20 pb-0 w-full">
          Welcome,{" "}
          <span className="text-indigo-500">
            {customerName // Render customer_name if it exists
              ? customerName
              : session.user?.name // Otherwise, render user_metadata.name if it exists
                ? session.user.name
              : session.user?.email}{" "}
            {/* Finally, fall back to user.email */}
          </span>
        </p>
      ) : (
        <p className="text-4xl md:text-6xl font-extrabold text-center pt-20 pb-0">
          Welcome, <span className="text-indigo-500">Viewer</span>
        </p>
      )}
      <div className="w-full h-full justify-center items-center flex flex-wrap">
          <div className="w-full lg:w-[70%]">
            <BannerSection />
          </div>
          <div className="w-full lg:w-[30%]">
            <RecentProductsShow />
          </div>
        </div>
      {/* <div
        className="w-full flex justify-center items-center flex-wrap responsive-flex"
        id="hero"
      >
        <div className="flex justify-center items-center h-[800px] rounded-md responsive-width w-full md:w-1/2">
          <div className="w-[400px] h-[400px] md:w-[600px] flex items-center justify-center backdrop-blur-sm rounded-3xl md:h-[600px]">
            <div ref={tiltRef} className="relative">
              <div className="w-full h-full absolute -z-10">
                <SVGblob />
              </div>
              {heroImage && (
                <Image
                  width={500}
                  height={500}
                  src={heroImage}
                  alt="Hero Image"
                  className="z-20 w-auto h-auto"
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center px-20 gap-[30px] text-wrap responsive-width w-full md:w-1/2">
          <h1 className="text-center uppercase text-5xl tracking-tighter select-none">
            Fulfil Your Dream <br /> with
          </h1>
          <p className="text-center uppercase text-5xl font-bold tracking-tighter select-none text-red-600">
            Modern
            <span className="text-cyan-400"> Computer</span>
          </p>
          <p className="text-wrap text-center text-xl select-none">
            {heroParagraph}
          </p>

          <ul className="text-xm flex flex-col items-center justify-between">
            <li className="flex gap-5 w-full">
              <IoArrowRedoOutline className="text-red-500" />{" "}
              <p>
                Affordable Pricing for{" "}
                <span className="text-cyan-400 font-semibold">Students</span>
              </p>
            </li>
            <li className="flex gap-5 w-full">
              <IoArrowRedoOutline className="text-red-500" />
              <p>
                <span className="text-cyan-400 font-semibold">
                  Student Discount{" "}
                </span>
                will be applied
              </p>
            </li>
            <li className="flex gap-5 w-full">
              <IoArrowRedoOutline className="text-red-500" />
              <p>
                <span className="text-cyan-400 font-semibold">
                  High Performance
                </span>{" "}
                Personal Computer
              </p>
            </li>
            <li className="flex gap-5 w-full">
              <IoArrowRedoOutline className="text-red-500" />
              <p>
                <span className="text-cyan-400 font-semibold">
                  Confirm gifts
                </span>{" "}
                for students
              </p>
            </li>
          </ul>
          <button
            className="bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 h-10 w-28 rounded-md text-l hover:text-l hover:font-bold duration-200"
            onClick={() => {
              router.push(heroButtonLink);
            }}
          >
            Check out
          </button>
        </div>
      </div> */}
    </>
  );
}

export default Hero;
