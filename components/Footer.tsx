"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaFacebook, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import Image from "next/image";
import { Mail, Phone, Store} from "lucide-react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

const Footer = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { error } = await supabase
          .from("profile")
          .select("role, profile_photo, customer_name")
          .eq("id", user.id)
          .single();
        if (error) {
          console.error("Error fetching profile:", error); // Log the error
        }
        // if (profile) {
        //   setRole(profile.role);
        //   setProfilePhoto(profile.profile_photo);
        //   setCustomerName(profile.customer_name);
        // }
      }
    };
    getUserData();
  }, []);
  return (
    <div className="w-full pt-5 mb-16 md:mb-0 flex flex-col gap-4 justify-center bg-slate-300 dark:bg-slate-900">
      <div className="flex sm:justify-between sm:gap-0 gap-8 justify-center sm:items-start items-center px-7 flex-wrap">
        <div className="flex flex-col gap-4 justify-center items-center sm:items-start">
          <div className="flex gap-4 items-center justify-center">
            <Image
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/About/Logo.gif"
              alt="About"
              className="mx-auto w-10 h-10 rounded-full"
              width={10}
              height={10}
              unoptimized
            />
            <p className="text-center uppercase text-xl font-bold tracking-tighter select-none text-red-600">
              Modern
              <span className="text-cyan-400"> Computer</span>
            </p>
          </div>
          <div
            className="flex gap-3 justify-center items-center cursor-pointer"
            onClick={() => {
              router.push("https://maps.app.goo.gl/TBXKCVU79knCRpJ46");
            }}
          >
            <Store className="w-6 h-6 text-indigo-600" />
            <p className="text-center text-sm tracking-tighter select-none">
              45/F,Prabartak Pally, Belgharia, Kolkata-700056, West Bengal,
              India
            </p>
          </div>
          <div
            className="flex gap-3 justify-center items-center cursor-pointer"
            onClick={() => {
              window.location.href = "tel:+917686873088";
            }}
          >
            <Phone className="w-6 h-6 text-green-600" />
            <p className="text-center text-sm tracking-tighter select-none">
              +91 76868 73088
            </p>
          </div>
          <div
            className="flex gap-3 justify-center items-center cursor-pointer"
            onClick={() => {
              window.location.href = "mailto:moderncomputer1997@gmail.com";
            }}
          >
            <Mail className="w-6 h-6 text-blue-600" />
            <p className="text-center text-sm tracking-tighter select-none">
              moderncomputer1997@gmail.com
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 justify-center items-start">
          <h1 className="font-bold text-xl">Shop Categories</h1>
          <div className="flex gap-2 justify-center items-center cursor-pointer">
            <PlayArrowIcon className="w-3 h-3 text-indigo-600" />
            <Link href="/#productbycategoriesslider" className="text-center text-sm tracking-tighter select-none hover:text-indigo-600">
              PC Components
            </Link>
          </div>
          <div className="flex gap-2 justify-center items-center cursor-pointer">
            <PlayArrowIcon className="w-3 h-3 text-indigo-600" />
            <Link href="/#pbpc" className="text-center text-sm tracking-tighter select-none hover:text-indigo-600">
              Pre-Build PC
            </Link>
          </div>
          <div className="flex gap-2 justify-center items-center cursor-pointer">
            <PlayArrowIcon className="w-3 h-3 text-indigo-600" />
            <Link href="/#cbpc" className="text-center text-sm tracking-tighter select-none hover:text-indigo-600">
              Custom-Build PC
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-4 justify-center items-start">
          <h1 className="font-bold text-xl">Account</h1>
          <div className="flex gap-2 justify-center items-center cursor-pointer"
           onClick={() => {
             if (!user) {
               router.push("/SignIn");
             } else {
               router.push(`/profile/${user.id}`);
             }
           }}
          >
            <PlayArrowIcon className="w-3 h-3 text-indigo-600" />
            <p className="text-center text-sm tracking-tighter select-none hover:text-indigo-600">
              My Account
            </p>
          </div>
          <div className="flex gap-2 justify-center items-center cursor-pointer"
            onClick={() => {
              router.push("/orders")
            }}
          >
            <PlayArrowIcon className="w-3 h-3 text-indigo-600" />
            <p className="text-center text-sm tracking-tighter select-none hover:text-indigo-600">
              Your Orders
            </p>
          </div>
          <div className="flex gap-2 justify-center items-center cursor-pointer"
            onClick={() => {
              router.push("/cart")
            }}
          >
            <PlayArrowIcon className="w-3 h-3 text-indigo-600" />
            <p className="text-center text-sm tracking-tighter select-none hover:text-indigo-600">
              Your Cart
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 justify-center items-start">
          <h1 className="font-bold text-xl">Policy</h1>
          <div className="flex gap-2 justify-center items-center cursor-pointer"
            onClick={() => {
              router.push("/privacy-policies#privacyPolicy");
            }}
          >
            <PlayArrowIcon className="w-3 h-3 text-indigo-600" />
            <p className="text-center text-sm tracking-tighter select-none hover:text-indigo-600">
              Privacy policy
            </p>
          </div>
          <div className="flex gap-2 justify-center items-center cursor-pointer"
            onClick={() => {
              router.push("/privacy-policies#refundPolicy");
            }}
          >
            <PlayArrowIcon className="w-3 h-3 text-indigo-600" />
            <p className="text-center text-sm tracking-tighter select-none hover:text-indigo-600">
              Refund Policy
            </p>
          </div>
          <div className="flex gap-2 justify-center items-center cursor-pointer"
            onClick={() => {
              router.push("/privacy-policies#shippingPolicy");
            }}
          >
            <PlayArrowIcon className="w-3 h-3 text-indigo-600" />
            <p className="text-center text-sm tracking-tighter select-none hover:text-indigo-600">
              Shipping Policy
            </p>
          </div>
          <div className="flex gap-2 justify-center items-center cursor-pointer"
            onClick={() => {
              router.push("/privacy-policies#termsAndConditions");
            }}
          >
            <PlayArrowIcon className="w-3 h-3 text-indigo-600" />
            <p className="text-center text-sm tracking-tighter select-none hover:text-indigo-600">
              Terms & Conditions
            </p>
          </div>
        </div>
      </div>
      <div className="flex w-full sm:justify-between justify-center items-center p-7 flex-wrap bg-slate-600 dark:bg-slate-700">
        <h1 className="text-sm md:text-lg font-bold text-center">
          All Rights Reseved by{" "}
          <span className="text-indigo-400">&copy;Modern Computer</span>, 2024
        </h1>
        <div className="flex gap-3 justify-center items-center">
          <Image src="/Visa.png" width={50} height={50} alt="Visa" />
          <Image
            src="/MasterCard.png"
            width={50}
            height={50}
            alt="MasterCard"
          />
          <Image src="/GPay.png" width={50} height={50} alt="GooglePay" />
          <Image src="/Paytm.png" width={50} height={50} alt="Paytm" />
          <Image src="/Rupay.png" width={50} height={50} alt="Rupay" />
        </div>
        <div className=" justify-center items-center flex gap-4">
          <div
            className="w-12 h-12 rounded-full bg-white cursor-pointer flex justify-center items-center border-2 border-green-500 hover:bg-transparent"
            onClick={() => {
              router.push(
                "https://wa.me/917686873088?text=Hi%20Modern%20computer%0AI've%20just%20visited%20the%20website%20and%20want%20to%20talk%20about%20some%20queries."
              );
            }}
          >
            <FaWhatsapp className="text-green-500 w-6 h-6" />
          </div>
          <div
            className="w-12 h-12 rounded-full bg-white hover:bg-transparent border-2 border-pink-500 cursor-pointer flex justify-center items-center"
            onClick={() => {
              router.push("https://www.instagram.com/moderncomputer1999/");
            }}
          >
            {/* <FaInstagram className="gradient-icon icons" /> */}
            <Image
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/Instagram-Logo.png"
              alt=""
              width={50}
              height={50}
            />
          </div>
          <div
            className="w-12 h-12 rounded-full bg-white hover:bg-transparent cursor-pointer flex justify-center items-center border-2 border-red-500"
            onClick={() => {
              router.push("https://www.youtube.com/@moderncomputerkolkata");
            }}
          >
            <FaYoutube className="text-red-600 w-6 h-6" />
          </div>
          <div
            className="w-12 h-12 rounded-full bg-white cursor-pointer flex justify-center items-center hover:bg-transparent border-2 border-green-600"
            onClick={() => {
              window.location.href = "tel:+917686873088";
            }}
          >
            <IoCall className="text-green-600 w-6 h-6" />
          </div>
          <div
            className="w-12 h-12 rounded-full bg-white cursor-pointer flex justify-center items-center hover:bg-transparent border-2 border-blue-600"
            onClick={() => {
              router.push(
                "https://www.facebook.com/people/Modern-Computer/100093078390711/?mibextid=ZbWKwL"
              );
            }}
          >
            <FaFacebook className="text-blue-600 w-6 h-6" />
          </div>
          <div
            className="w-12 h-12 rounded-full bg-white cursor-pointer flex justify-center items-center hover:bg-transparent border-2 border-yellow-400"
            onClick={() => {
              window.location.href = "mailto:moderncomputer1997@gmail.com";
            }}
          >
            <Image
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/gmail.png"
              alt=""
              width={25}
              height={25}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
