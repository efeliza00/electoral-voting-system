import React from 'react'

const AccountDetailsLayout  = ({children}:{children:React.ReactNode}) => {
  return (
         <div className="h-screen w-full flex flex-col gap-4">
            <div className="border-b pb-1">
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                    Account Details
                </h3>
            <p className="leading-7 text-muted-foreground">
                   Manage your account information and email verification status
                </p>
            </div>
            {children}
        </div>
  )
}

export default AccountDetailsLayout