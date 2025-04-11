"use client";
import { useState, useEffect, useRef } from "react";
import { FaFacebook, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import { useRouter } from "next/navigation";
import Image from "next/image";
import NotificationBubbleOnDraggableCircularNav from "./NotificationBubbleOnDraggableCircularNav";

const DraggableCircularNav: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Toggle mobile nav.
  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  // Drag handler.
  const onDrag = (e: MouseEvent) => {
    const nav = navRef.current;
    if (nav) {
      const navStyle = window.getComputedStyle(nav);
      const navTop = parseInt(navStyle.top, 10);
      const navHeight = parseInt(navStyle.height, 10);
      const windHeight = window.innerHeight;

      // Adjust the top according to mouse movement.
      let newTop = navTop + e.movementY;
      newTop = newTop < 0 ? 1 : newTop; // don't let it go above the viewport.
      // keep within the bottom bound.
      if (newTop > windHeight - navHeight) {
        newTop = windHeight - navHeight;
      }
      nav.style.top = `${newTop}px`;
    }
  };

  // Add drag listener (applied only on desktop).
  const addDragListeners = () => {
    const nav = navRef.current;
    if (window.innerWidth > 768 && nav) {
      nav.addEventListener("mousemove", onDrag);
    }
  };

  // Remove drag listener.
  const removeDragListeners = () => {
    const nav = navRef.current;
    if (nav) {
      nav.removeEventListener("mousemove", onDrag);
    }
  };

  // Set the initial nav position to vertical center regardless of device.
  useEffect(() => {
    const setInitialPosition = () => {
      if (navRef.current) {
        const navHeight = navRef.current.offsetHeight;
        const initialTop = window.innerHeight / 2 - navHeight / 2;
        navRef.current.style.top = `${initialTop}px`;
      }
    };

    // Set on mount.
    setInitialPosition();
    // Recalculate on resize.
    window.addEventListener("resize", setInitialPosition);
    return () => window.removeEventListener("resize", setInitialPosition);
  }, []);

  return (
    <nav
      ref={navRef}
      className={`nav ${isOpen ? "open" : ""} fixed flex flex-col items-center justify-center`}
      onMouseDown={addDragListeners}
      onMouseUp={removeDragListeners}
      onMouseLeave={removeDragListeners}
    >
      <div className="relative w-full h-full">
        <div className="absolute -top-32 sm:-left-96 -left-[260px] z-40">
          <NotificationBubbleOnDraggableCircularNav />
        </div>
        <div className="nav-content relative">
          <div className="toggle-btn relative" onClick={toggleNav}>
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
              <Image
                src="https://supabase.moderncomputer.in/storage/v1/object/public/product-image/Logo_Social/Instagram-Logo.png"
                alt="instagram"
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
                alt="gmail"
                width={30}
                height={30}
              />
            </div>
          </span>
        </div>
      </div>
    </nav>
  );
};

export default DraggableCircularNav;
