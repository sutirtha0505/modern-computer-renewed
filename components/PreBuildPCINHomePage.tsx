"use client";
import React, { useEffect, useRef } from "react";
import SVGblob2 from "./SVGBlob2";
import VanillaTilt from "vanilla-tilt";
import SVGblob3 from "./SVGBlob3";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface VanillaTiltOptions {
  max: number;
  speed: number;
  glare: boolean;
  "max-glare": number;
}

const PreBuildPCINHomePage = () => {
  const intelRef = useRef<HTMLDivElement | null>(null);
  const amdRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (intelRef.current) {
      // Initialize VanillaTilt for the Intel div
      VanillaTilt.init(intelRef.current, {
        max: 3,
        speed: 400,
        glare: false,
        "max-glare": 0.3,
      } as VanillaTiltOptions);
    }
    if (amdRef.current) {
      // Initialize VanillaTilt for the AMD div
      VanillaTilt.init(amdRef.current, {
        max: 3,
        speed: 400,
        glare: false,
        "max-glare": 0.3,
      } as VanillaTiltOptions);
    }
  }, []);
  const router = useRouter();

  return (
    <div className="w-full flex gap-28 justify-center items-center flex-col mb-40" id="pbpc">
      <h1 className="text-4xl font-bold text-wrap">
         <span className="text-indigo-600">Pre-Build</span> PC
      </h1>
      <div className="flex justify-center flex-wrap items-center gap-20">
        <div onClick={()=>{
        router.push("/pbpc/pbpc-intel");
      }} className="w-[400px] h-[400px] md:w-[500px] md:h-[500px] flex flex-col p-4 justify-center items-center rounded-md gap-8 cursor-pointer">
          <div ref={intelRef} className="relative">
            <div className="w-full h-full absolute -z-10">
              <SVGblob2 />
            </div>
            <Image
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pbpc_intel/INTEL_Prebuild.png"
              className="hover:scale-105 duration-300 ease-in-out"
              alt=""
              width={500}
              height={500}
            />
            <h2 className="text-xl font-semibold text-center">
              Pre-Build <span className="text-red-500">Intel </span>PC
            </h2>
          </div>
        </div>
        <div onClick={()=>{
        router.push("/pbpc/pbpc-amd");
      }} className="w-[400px] h-[400px] md:w-[500px] md:h-[500px] flex flex-col p-4 justify-center items-center rounded-md gap-8 cursor-pointer">
          <div ref={amdRef} className="relative">
            <div className="w-full h-full absolute -z-10">
              <SVGblob3 />
            </div>
            <Image
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/pbpc_amd/AMD_Prebuild.png"
              className="hover:scale-105 duration-300 ease-in-out"
              alt=""
              width={500}
              height={500}
            />
            <h2 className="text-xl font-semibold text-center">
              Pre-Build <span className="text-cyan-500">AMD </span>PC
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreBuildPCINHomePage;
