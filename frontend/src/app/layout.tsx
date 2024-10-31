import type {Metadata} from "next";
import "./globals.css";
import React from "react";
import {AuthProvider} from "@/app/lib/auth";
import {ToastContainer} from "react-toastify";
import MainContentComponent from "@/app/components/main_content";
import 'react-tooltip/dist/react-tooltip.css'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


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
        <body className="bg-sneakers-second h-full w-full fixed">
        <AuthProvider>
            <MainContentComponent>
                <ToastContainer
                    position="bottom-right"
                    theme="dark"
                />
                {children}
            </MainContentComponent>
        </AuthProvider>
        </body>
        </html>
    )
}