import React from "react";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { auth } from "../utils/firebaseConfig";
import Header from "../components/Header";

export default function ProtectedLayout() {
    const [checkingAuth, setCheckingAuth] = useState(true);
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
        <div>
            <Header />
            <main>
                <Outlet />
            </main>
        </div>
    );
}
