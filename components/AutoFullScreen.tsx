"use client";

import { useState } from "react";
// Import shadcn's alert dialog components. Adjust the import path based on your project setup.
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
