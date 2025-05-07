import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import BottomTabs from "../components/BottomTabs";
import { useUser } from "../hooks/useUsers";

export default function PublicLayout() {
    const location = useLocation();
    const { userProfile } = useUser();

    const hideExtras = location.pathname === "/auth";
    const isLoggedIn = !!userProfile;

    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen flex flex-col">
            {/* Fixed Header */}
            {!hideExtras && (
                <div className="fixed top-0 left-0 right-0 z-50">
                    <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
                </div>
            )}

            <div className="flex flex-1 pt-[64px]"> {/* push content below header */}
                {/* Fixed Sidebar */}
                {isLoggedIn && !hideExtras && sidebarOpen && (
                    <aside className="hidden md:block fixed top-[64px] left-0 w-64 h-[calc(100vh-64px)] bg-white shadow z-40">
                        <Sidebar />
                    </aside>
                )}

                {/* Main scrollable content */}
                <div
                    className={`
                        flex-1 w-full
                        ${isLoggedIn && !hideExtras && sidebarOpen ? "md:ml-64" : ""}
                        pb-16 md:pb-0 overflow-y-auto
                    `}
                >
                    <main className="min-h-[calc(100vh-64px-56px)] p-4">
                        <Outlet />
                    </main>
                </div>
            </div>

            {/* Fixed BottomTabs for mobile */}
            {isLoggedIn && !hideExtras && (
                <div className="block md:hidden fixed bottom-0 left-0 right-0 z-50">
                    <BottomTabs onAddBookClick={() => console.log("Add Book")} />
                </div>
            )}
        </div>
    );
}
