import UserProfile from '@/components/UserProfile';
import React from 'react'

const profilePage = () => {
  return (
    <div className=" absolute z-20 w-full py-12 bg-black h-screen flex justify-center items-center">
    <UserProfile />
    </div>
  )
}

export default profilePage