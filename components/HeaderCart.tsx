import Link from "next/link";
import React from "react";
import Image from "next/image";
import { LockIcon } from "lucide-react";

const HeaderCart = () => {
  return (
    <div className="fixed w-full flex justify-between items-center bg-white/50 custom-backdrop-filter-checkout p-4 top-0 z-50">
      <Link href="/">
        <Image
          src="/logo.jpg"
          width={50}
          height={50}
          className="rounded-full cursor-pointer"
          alt="Logo"
        />
      </Link>
      <h1 className="font-extrabold bg-gradient-to-br from-pink-500 to-orange-400 text-center text-transparent inline-block text-3xl bg-clip-text">
        Checkout
      </h1>
      <LockIcon />
    </div>
  );
};

export default HeaderCart;
