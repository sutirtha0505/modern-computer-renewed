import React from 'react'
import Image from 'next/image'

const WhyUs = () => {
  return (
    <div className="flex flex-col gap-3 justify-center items-center w-full h-auto">
        <h1 className="text-2xl font-bold">
          Why <span className="text-indigo-500">Modern Computer?</span>
        </h1>
        <div className="flex justify-center items-center gap-4 flex-wrap">
          <div className="flex flex-col justify-center items-center gap-2">
            <Image
              width={250}
              height={250}
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/free-delivery.png"
              alt=""
              className="w-24 h-24"
            />
            <p className="text-lg font-extrabold">Free Delivery</p>
          </div>
          <div className="flex flex-col justify-center items-center gap-2">
            <Image
              width={250}
              height={250}
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/technical-support.png"
              alt=""
              className="w-24 h-24"
            />
            <p className="text-lg font-extrabold">365 Days Servicing </p>
          </div>
          <div className="flex flex-col justify-center items-center gap-2">
            <Image
              width={250}
              height={250}
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/opinion.png"
              alt=""
              className="w-24 h-24"
            />
            <p className="text-lg font-extrabold">Proper Suggestion</p>
          </div>
          <div className="flex flex-col justify-center items-center gap-2">
            <Image
              width={250}
              height={250}
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/best-price.png"
              alt=""
              className="w-24 h-24"
            />
            <p className="text-lg font-extrabold">Best Price</p>
          </div>
          <div className="flex flex-col justify-center items-center gap-2">
            <Image
              width={250}
              height={250}
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/free-delivery%20truck.png"
              alt=""
              className="w-24 h-24"
            />
            <p className="text-lg font-extrabold">Free Shipping</p>
          </div>
          <div className="flex flex-col justify-center items-center gap-2">
            <Image
              width={250}
              height={250}
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/warranty.png"
              alt=""
              className="w-24 h-24"
            />
            <p className="text-lg font-extrabold">Safe Delivery</p>
          </div>
        </div>
      </div>
  )
}

export default WhyUs