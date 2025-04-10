"use client";

import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AutoFullScreen() {
  const [open, setOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Basic mobile detection using navigator.userAgent.
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    setIsMobile(mobileRegex.test(navigator.userAgent));
  }, []);

  // If not a mobile device, render nothing.
  if (!isMobile) {
    return null;
  }

  const handleEnterFullscreen = async () => {
    try {
      // Trigger the fullscreen API on the root document element.
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.error("Failed to enter fullscreen:", err);
    }
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogTitle>Enter Fullscreen Mode</AlertDialogTitle>
        <AlertDialogDescription>
          Would you like to enter fullscreen mode for a better experience?
        </AlertDialogDescription>
        <div className="flex gap-2 justify-end mt-4">
          <AlertDialogCancel onClick={() => setOpen(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleEnterFullscreen}>
            Enter Fullscreen
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
