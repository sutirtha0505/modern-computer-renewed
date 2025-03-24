import React from "react";
// import { PiDetectiveLight } from "react-icons/pi";
import { SiCaddy } from "react-icons/si";

const PreventAdminAccess = () => {
  return (
    <div className="pt-16 w-full h-screen justify-center gap-2 text-center flex flex-col items-center cursor-not-allowed">
      <SiCaddy className="text-red-500" size={100} />
      <h1 className=" text-2xl font-bold select-none">Do not you think you have been watched?</h1>
    </div>
  );
};

export default PreventAdminAccess;
