// components/LoadingScreen.tsx
import { BlinkBlur } from "react-loading-indicators";

export default function LoadingScreen() {
  return (
    <div className="flex flex-col gap-6 items-center justify-center min-h-screen bg-[#DFE4E4] dark:bg-black">
      <BlinkBlur color="#8a31cc" size="medium" text="Loading..." textColor="#8a31cc" />
      {/* <Image src="/logo.jpg" width="400" height="400" alt= "Logo" /> */}
      {/* <h1>Loading...</h1> */}
    </div>
  );
}
