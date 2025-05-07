import { NavLink } from "react-router-dom";
import { FaBookOpen, FaCompass, FaFolderOpen, FaPenFancy, FaHome } from "react-icons/fa";

export default function Sidebar() {
    return (
        <div className="p-4 space-y-4">
            <SidebarLink to="/home" label="Home" icon={<FaHome />} />
            <SidebarLink to="/feed" label="Feed" icon={<FaBookOpen />} />
            <SidebarLink to="/discover" label="Discover" icon={<FaCompass />} />
            <SidebarLink to="/library" label="Library" icon={<FaFolderOpen />} />
            <SidebarLink to="/journal" label="Journal" icon={<FaPenFancy />} />
        </div>
    );
}

function SidebarLink({ to, icon, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 ${isActive ? "text-indigo-600 font-semibold" : "text-gray-700"
                }`
            }
        >
            {icon}
            {label}
        </NavLink>
    );
}
