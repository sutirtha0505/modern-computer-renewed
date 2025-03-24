import React from "react";
import OrderedComponents from "./OrderedComponents";
import OrderedPreBuildPC from "./OrderedPreBuildPC";
import OrderedCustomBuildPC from "./OrderedCustomBuildPC";

interface OrdersForUProps {
  userId: string;
}

const OrdersForU: React.FC<OrdersForUProps> = ({ userId }) => {
  return (
    <div className="flex flex-col gap-5 justify-center items-center w-full h-full">
      <div className="flex flex-col justify-center items-center gap-4">
        {/* Pass userId as prop */}
        <OrderedComponents userId={userId} />
      </div>
      <div className="flex flex-col justify-center items-center gap-4">
        {/* Pass userId as prop */}
        <OrderedPreBuildPC userId={userId} />
      </div>
      <div className="flex flex-col justify-center items-center gap-4">
        {/* Pass userId as prop */}
        <OrderedCustomBuildPC userId={userId} />
      </div>
    </div>
  );
};

export default OrdersForU;
