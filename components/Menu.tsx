import Image from "next/image";
import Link from "next/link";
import React from "react";
const Menu = () => {
  return (
    <div className="md:hidden flex items-center backdrop-blur-3xl bg-white/50 w-full h-16 fixed justify-between px-4 z-10 custom-backdrop-filter bottom-0">
      <div className="flex gap-10 w-full justify-between ">
        <Link href="/#productbycategoriesslider" className="relative text-center items-center flex flex-col group text-xs font-extrabold">
          {/* <AiOutlineProduct className="text-indigo-500 text-xl" /> */}
          <Image src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/menu-icons/products.png" alt="products" className="w-6 h-6" width={200} height={200} />
          Products
          <span className="block h-0.5 w-0 bg-white absolute bottom-0 left-0 group-hover:w-full transition-all duration-500"></span>
        </Link>
        <Link
          href="/#pbpc"
          className="relative text-center items-center flex flex-col group text-xs font-extrabold"
        >
          <Image src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/menu-icons/pc.png" alt="products" className="w-6 h-6" width={200} height={200} />
          Pre-Build PC
          <span className="block h-0.5 w-0 bg-white absolute bottom-0 left-0 group-hover:w-full transition-all duration-500"></span>
        </Link>
        <Link
          href="/#cbpc"
          className="relative text-center items-center flex flex-col group text-xs font-extrabold"
        >
          <Image src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/menu-icons/settings.png" alt="products" className="w-6 h-6" width={200} height={200} />
          Custom-Build PC
          <span className="block h-0.5 w-0  bg-white absolute bottom-0 left-0 group-hover:w-full transition-all duration-500"></span>
        </Link>
        <Link href="/#about" className="relative text-center items-center flex flex-col group text-xs font-extrabold">
        <Image src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/menu-icons/about%20me.png" alt="products" className="w-6 h-6" width={200} height={200} />
          About
          <span className="block h-0.5 w-0 bg-white absolute bottom-0 left-0 group-hover:w-full transition-all duration-500"></span>
        </Link>
      </div>
    </div>
  );
};

export default Menu;
