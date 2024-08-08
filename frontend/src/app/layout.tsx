import type {Metadata} from "next";
import "./globals.css";
import React from "react";
import NavbarComponent from "@/app/components/navbar";
import {AuthProvider} from "@/app/lib/auth";
import {ToastContainer} from "react-toastify";


export const metadata: Metadata = {
    title: "SneakSyncHub",
    description: "Easily gather sneakers info",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className="bg-sneakers-second relative">
        <AuthProvider>
            <ToastContainer/>
            <NavbarComponent/>
            {children}
        </AuthProvider>
        </body>
        </html>
    )
}