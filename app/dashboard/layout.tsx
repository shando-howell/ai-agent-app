'use client'

import { Authenticated } from "convex/react";

import { NavigationProvider } from "@/lib/NavigationProvider";
import Header from "@/components/Header";
import SideBar from "@/components/SideBar";

export default function DashboardLayout({
    children,
} : {
    children: React.ReactNode;
}) {
    return (
        <NavigationProvider>
            <div className="flex h-screen">
                <Authenticated>
                    <SideBar />
                </Authenticated>

                <div className="flex-1">
                    <Header />
                    <main>{children}</main>
                </div>
            </div>
        </NavigationProvider>
    );
}