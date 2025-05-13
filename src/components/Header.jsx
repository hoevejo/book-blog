import React, { useEffect, useRef, useState } from "react";
import { useUser } from "../hooks/useUsers";
import { auth } from "../utils/firebaseConfig";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Header({ onToggleSidebar }) {
    const { userProfile } = useUser();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(auth);
        localStorage.removeItem("bookblog_user");
        navigate("/"); // redirect to landing
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="w-full bg-white shadow-md px-4 py-3 flex items-center justify-between relative z-50">
            {/* Left side: Sidebar toggle + Logo */}
            <div className="flex items-center gap-3">
                {/* Sidebar toggle (visible on md and up) */}
                <button
                    className="hidden md:inline-block text-gray-600 hover:text-indigo-600"
                    onClick={onToggleSidebar}
                    title="Toggle sidebar"
                >
                    ☰
                </button>

                {/* Logo + Site Name */}
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => navigate("/")}
                >
                    <img
                        src="/favicon.png"
                        alt="Book Blog Logo"
                        className="w-8 h-8"
                    />
                    <h1 className="text-xl font-bold text-gray-800">Bookaholic Anonymous</h1>
                </div>
            </div>

            {/* Right side: User profile or Sign In */}
            {userProfile ? (
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen((prev) => !prev)}
                        className="flex items-center gap-2 focus:outline-none"
                    >
                        <span className="text-sm font-medium text-gray-700">
                            {userProfile.displayName}
                        </span>
                        <img
                            src={userProfile.profilePicture}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover border border-gray-300"
                        />
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-md z-50">
                            <ul className="text-sm text-gray-700">
                                <li
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        navigate("/profile");
                                    }}
                                >
                                    Settings
                                </li>
                                <li
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            ) : (
                <button
                    onClick={() => navigate("/auth")}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                >
                    Sign In
                </button>
            )}
        </header>
    );
}
