"use client"
import React, { useEffect, useState } from 'react'
import OrdersForU from '@/components/OrdersForU';
import { useSession } from 'next-auth/react';
import LoadingScreen from '@/components/LoadingScreen';
const OrdersPage = () => {
  const { data: session } = useSession()
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
      // Simulate loading work (for example, fetching admin data)
      // Replace the setTimeout with your actual data fetching if needed
      setTimeout(() => {
        setLoading(false);
      }, 8000); // simulate a 1 second loading delay
    }, []);
    
      if (loading) {
        return <div><LoadingScreen /></div>;
      }
    
    
  return (
    <div className='w-full h-full flex flex-col justify-center items-center gap-6'>
      <div className='w-full pt-20'>
        <h1 className='text-3xl font-bold text-center'>
          Check Your <span className='text-indigo-500'>Ordered Products</span>
        </h1>
        {session?.user?.id && <OrdersForU userId={session.user.id} />} {/* Pass user.id to CustomerDetails */}
      </div>
    </div>
  )
}

export default OrdersPage