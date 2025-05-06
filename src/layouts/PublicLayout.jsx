// src/layouts/PublicLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import { useLocation } from "react-router-dom";

export default function PublicLayout() {
    const location = useLocation();
    const hideHeader = location.pathname === "/auth";

    return (
        <div>
            {!hideHeader && <Header />}
            <main>
                <Outlet />
            </main>
        </div>
    );
}
