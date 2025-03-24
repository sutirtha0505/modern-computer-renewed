import React, { useState } from 'react';
import { Component } from 'lucide-react';
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import ConstructionIcon from '@mui/icons-material/Construction';
import OrderedPCComponentManagement from './OrderedPCComponentManagement';
import OrderedPreBuildPCManagement from './OrderedPreBuildPCManagement';
import OrderedCustomBuildPCManagement from './OrderedCustomBuildPCManagement'; // Import the Custom Build component

const OrderManagement = () => {
  // Define the possible state values
  const [showComponent, setShowComponent] = useState<null | 'pcComponentOrders' | 'preBuildPCOrders' | 'customBuildPCOrders'>(null);

  // Handler to show PC Component Orders
  const handleComponentClick = () => {
    setShowComponent('pcComponentOrders');
  };

  // Handler to show Pre-Build PC Orders
  const handlePreBuildPCClick = () => {
    setShowComponent('preBuildPCOrders');
  };

  // Handler to show Custom Build PC Orders
  const handleCustomBuildPCClick = () => {
    setShowComponent('customBuildPCOrders');
  };

  return (
    <div className='w-full h-full flex flex-col justify-center items-center pt-8'>
      <h1 className='text-3xl font-bold text-center'>
        Manage Your <span className='text-indigo-500'>Orders</span>
      </h1>

      {/* Conditionally render based on selected option */}
      {showComponent === 'pcComponentOrders' ? (
        <OrderedPCComponentManagement />
      ) : showComponent === 'preBuildPCOrders' ? (
        <OrderedPreBuildPCManagement />
      ) : showComponent === 'customBuildPCOrders' ? (
        <OrderedCustomBuildPCManagement />
      ) : (
        // Default view with clickable divs
        <div className='w-full flex gap-8 p-8 justify-center items-center flex-wrap'>
          <div
            className="p-8 gap-4 rounded-sm bg-green-400 border-green-400 border-2 cursor-pointer flex flex-col hover:bg-transparent hover:text-green-400 justify-center items-center"
            onClick={handleComponentClick}
          >
            <Component />
            <p className="text-xs text-center">PC Component Orders</p>
          </div>
          <div
            className="p-8 gap-4 rounded-sm bg-violet-400 border-violet-400 border-2 cursor-pointer flex flex-col hover:bg-transparent hover:text-violet-400 justify-center items-center"
            onClick={handlePreBuildPCClick}
          >
            <ComputerOutlinedIcon />
            <p className="text-xs text-center">Pre-Build PC Orders</p>
          </div>
          <div
            className="p-8 gap-4 rounded-sm bg-orange-400 border-orange-400 border-2 cursor-pointer flex flex-col hover:bg-transparent hover:text-orange-400 justify-center items-center"
            onClick={handleCustomBuildPCClick}
          >
            <ConstructionIcon />
            <p className="text-xs text-center">Custom PC Orders</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
