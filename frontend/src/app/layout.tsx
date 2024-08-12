import type {Metadata} from "next";
import "./globals.css";
import React from "react";
import ManageUserComponent from "@/app/components/manage_user_icon";
import {AuthProvider} from "@/app/lib/auth";
import {ToastContainer} from "react-toastify";
import MainContentComponent from "@/app/components/main_content";


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
                <ManageUserComponent/>
                {children}
            </MainContentComponent>
        </AuthProvider>
        </body>
        </html>
    )
}