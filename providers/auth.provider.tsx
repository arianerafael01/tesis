'use client'
import { SessionProvider } from "next-auth/react"
import React from 'react'

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <SessionProvider basePath="/api/auth">
            {children}
        </SessionProvider>
    )
}

export default AuthProvider