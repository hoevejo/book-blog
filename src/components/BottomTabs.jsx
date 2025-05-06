// BottomTabs.jsx
import { NavLink } from "react-router-dom";
import { FaBookOpen, FaCompass, FaFolderOpen, FaPenFancy, FaPlusCircle } from "react-icons/fa";

export default function BottomTabs({ onAddBookClick }) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-sm z-50 flex justify-around items-center py-2">
            <TabLink to="/feed" icon={<FaBookOpen />} label="Feed" />
            <TabLink to="/discover" icon={<FaCompass />} label="Discover" />
            <TabLink to="/collections" icon={<FaFolderOpen />} label="Collections" />
            <TabLink to="/journal" icon={<FaPenFancy />} label="Journal" />
            <button
                onClick={onAddBookClick}
                className="flex flex-col items-center text-indigo-600 hover:text-indigo-700"
            >
                <FaPlusCircle className="text-xl" />
                <span className="text-xs">Add</span>
            </button>
        </nav>
    );
}

function TabLink({ to, icon, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex flex-col items-center ${isActive ? "text-indigo-600" : "text-gray-500 hover:text-indigo-500"}`
            }
        >
            <div className="text-xl">{icon}</div>
            <span className="text-xs">{label}</span>
        </NavLink>
    );
}
