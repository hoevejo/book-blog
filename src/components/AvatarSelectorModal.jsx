// AvatarSelectorModal.jsx
import { useState } from "react";
import { avatarCategories } from "../utils/avatarList";


export default function AvatarSelectorModal({ isOpen, onClose, onSave, displayName }) {
    const [selectedCategory, setSelectedCategory] = useState("Animals");
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [customUrl, setCustomUrl] = useState("");
    const [uploadPreview, setUploadPreview] = useState(null);

    if (!isOpen) return null;

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "bookblog_unsigned"); // replace with your Cloudinary unsigned preset

        try {
            const res = await fetch("https://api.cloudinary.com/v1_1/dz2ok0sei/image/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            setUploadPreview(data.secure_url);
            setCustomUrl("");
            setSelectedAvatar(null);
        } catch (err) {
            console.error("Cloudinary upload error:", err);
            alert("Upload failed");
        }
    };

    const handleSelect = () => {
        if (uploadPreview) {
            onSave(uploadPreview);
        } else if (customUrl.trim()) {
            onSave(customUrl.trim());
        } else if (selectedAvatar) {
            onSave(`/assets/avatars/${selectedCategory}/${selectedAvatar}`);
        } else {
            // Explicit default fallback
            onSave(`https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(displayName?.trim() || "User")}&chars=1&uppercase=true`);
        }

        onClose();
    };



    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4 text-center">Choose Avatar</h2>

                {/* DiceBear Default */}
                <div className="mb-6 text-center">
                    <p className="text-sm text-gray-600 mb-1">Default (Initials)</p>
                    <img
                        src={`https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(displayName || "User")}&chars=1`}
                        alt="Default Avatar"
                        onClick={() => {
                            setSelectedAvatar(null);
                            setUploadPreview(null);
                            setCustomUrl("");
                        }}
                        className="w-16 h-16 mx-auto rounded-full border cursor-pointer hover:opacity-80"
                    />
                </div>

                {/* Upload via Cloudinary */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Image (Cloudinary)
                    </label>

                    {/* Custom styled file input */}
                    <label className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-indigo-700 transition">
                        Choose File
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </label>

                    {uploadPreview && (
                        <img
                            src={uploadPreview}
                            alt="Uploaded preview"
                            className="w-16 h-16 rounded-full object-cover mx-auto mt-2"
                        />
                    )}
                </div>

                {/* Custom URL */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Or enter an image URL
                    </label>
                    <input
                        type="text"
                        placeholder="https://..."
                        value={customUrl}
                        onChange={(e) => {
                            setCustomUrl(e.target.value);
                            setUploadPreview(null);
                            setSelectedAvatar(null);
                        }}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>

                {/* Category Selector */}
                <div className="flex justify-center flex-wrap gap-3 mb-4">
                    {Object.keys(avatarCategories).map((category) => (
                        <button
                            key={category}
                            onClick={() => {
                                setSelectedCategory(category);
                                setSelectedAvatar(null);
                            }}
                            className={`px-3 py-1 rounded-md text-sm ${selectedCategory === category ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800"
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Avatar Grid */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                    {avatarCategories[selectedCategory].map((avatar) => {
                        const fullPath = `/assets/avatars/${selectedCategory}/${avatar}`;
                        return (
                            <img
                                key={avatar}
                                src={fullPath}
                                alt={avatar}
                                onClick={() => {
                                    setSelectedAvatar(avatar);
                                    setUploadPreview(null);
                                    setCustomUrl("");
                                }}
                                className={`cursor-pointer w-16 h-16 rounded-full border-2 ${selectedAvatar === avatar ? "border-indigo-600" : "border-transparent"
                                    } hover:opacity-80`}
                            />
                        );
                    })}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-md">
                        Cancel
                    </button>
                    <button
                        onClick={handleSelect}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                    >
                        Select
                    </button>
                </div>
            </div>
        </div>
    );
}
