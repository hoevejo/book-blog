import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { auth } from "../utils/firebaseConfig";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import BottomTabs from "../components/BottomTabs";

export default function ProtectedLayout() {
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsub = auth.onAuthStateChanged((user) => {
            if (!user) {
                navigate("/auth");
            }
            setCheckingAuth(false);
        });
        return () => unsub();
    }, [navigate]);

    if (checkingAuth) {
        return (
            <div className="flex items-center justify-center h-screen text-gray-600">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
                <span className="ml-2">Checking authentication...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Fixed Header */}
            <div className="fixed top-0 left-0 right-0 z-50">
                <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
            </div>

            <div className="flex flex-1 pt-[64px]">
                {/* Fixed Sidebar under header */}
                {sidebarOpen && (
                    <aside className="hidden md:block fixed top-[64px] left-0 w-64 h-[calc(100vh-64px)] bg-white shadow z-40">
                        <Sidebar />
                    </aside>
                )}

                {/* Main content area */}
                <div
                    className={`flex-1 flex flex-col overflow-y-auto w-full ${sidebarOpen ? "md:ml-64" : ""
                        }`}
                >
                    <main className="min-h-[calc(100vh-64px-56px)] p-4">
                        <Outlet />
                    </main>

                    {/* BottomTabs for mobile */}
                    <div className="block md:hidden fixed bottom-0 left-0 right-0 z-50">
                        <BottomTabs onAddBookClick={() => console.log("Add Book")} />
                    </div>
                </div>
            </div>
        </div>
    );
}
