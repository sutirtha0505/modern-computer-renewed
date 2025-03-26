import PreventAdminAccess from '@/components/PreventAdminAccess'
import React from 'react'

const RestrictProfileAccess = () => {
  return (
    <div>
        <PreventAdminAccess />
    </div>
  )
}

export default RestrictProfileAccess