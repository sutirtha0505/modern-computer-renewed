"use client";
import { useState } from "react";
import { FaFacebook, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import { useRouter } from "next/navigation";
import Image from "next/image";

const DraggableCircularNav: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  const onDrag = (e: MouseEvent) => {
    const nav = document.querySelector("nav");
    if (nav) {
      const navStyle = window.getComputedStyle(nav),
        navTop = parseInt(navStyle.top),
        navHeight = parseInt(navStyle.height),
        windHeight = window.innerHeight;

      nav.style.top = navTop > 0 ? `${navTop + e.movementY}px` : "1px";
      if (navTop > windHeight - navHeight) {
        nav.style.top = `${windHeight - navHeight}px`;
      }
    }
  };

  const addDragListeners = () => {
    const nav = document.querySelector("nav");
    if (window.innerWidth > 768) {
      nav?.addEventListener("mousemove", onDrag);
    }
  };

  const removeDragListeners = () => {
    const nav = document.querySelector("nav");
    nav?.removeEventListener("mousemove", onDrag);
  };

  return (
    <nav
      className={`nav ${isOpen ? "open" : ""} fixed top-5 right-2`}
      onMouseDown={addDragListeners}
      onMouseUp={removeDragListeners}
      onMouseLeave={removeDragListeners}
    >
      <div className="nav-content">
        <div
          className="toggle-btn"
          onMouseEnter={toggleNav}
          onClick={toggleNav}
        >
          <Image
            src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/customer-service.png"
            alt="customer service"
            height={30}
            width={30}
            className="customer-care"
          />
        </div>
        <span style={{ "--i": 1 } as React.CSSProperties}>
          <div
            className="planets first-planet"
            onClick={() => {
              router.push(
                "https://wa.me/917686873088?text=Hi%20Modern%20computer%0AI've%20just%20visited%20the%20website%20and%20want%20to%20talk%20about%20some%20queries."
              );
            }}
          >
            <FaWhatsapp className="text-green-500 icons" />
          </div>
        </span>
        <span style={{ "--i": 2 } as React.CSSProperties}>
          <div
            className="planets second-planet"
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
              className="insta"
            />
          </div>
        </span>
        <span style={{ "--i": 3 } as React.CSSProperties}>
          <div
            className="planets third-planet"
            onClick={() => {
              router.push("https://www.youtube.com/@moderncomputerkolkata");
            }}
          >
            <FaYoutube className="text-red-600 icons" />
          </div>
        </span>
        <span style={{ "--i": 4 } as React.CSSProperties}>
          <div
            className="planets forth-planet"
            onClick={() => {
              window.location.href = "tel:+917686873088";
            }}
          >
            <IoCall className="text-green-600 icons" />
          </div>
        </span>
        <span style={{ "--i": 5 } as React.CSSProperties}>
          <div
            className="planets fifth-planet"
            onClick={() => {
              router.push(
                "https://www.facebook.com/people/Modern-Computer/100093078390711/?mibextid=ZbWKwL"
              );
            }}
          >
            <FaFacebook className="text-blue-600 icons" />
          </div>
        </span>
        <span style={{ "--i": 6 } as React.CSSProperties}>
          <div
            className="planets sixth-planet"
            onClick={() => {
              window.location.href = "mailto:moderncomputer1997@gmail.com";
            }}
          >
            <Image
              src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/gmail.png"
              className="gmail"
              alt=""
              width={30}
              height={30}
            />
          </div>
        </span>
      </div>
    </nav>
  );
};

export default DraggableCircularNav;
