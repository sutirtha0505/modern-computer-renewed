// components/LoadingScreen.tsx
import { BlinkBlur } from "react-loading-indicators";

export default function LoadingScreen() {
  return (
    <div className="flex flex-col gap-6 items-center justify-center min-h-screen w-full h-full bg-black">
      <BlinkBlur color="#8a31cc" size="medium" text="Loading..." textColor="#8a31cc" />
    </div>
  );
}
