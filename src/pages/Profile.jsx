// Profile.jsx
import { useEffect, useState } from "react";
import {
    doc,
    getDoc,
    updateDoc,
    collection,
    getDocs,
} from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { useUser } from "../hooks/useUsers";
import Modal from "../components/Modal";
import AddBookForm from "../components/AddBookForm";
import AvatarSelectorModal from "../components/AvatarSelectorModal";

export default function Profile() {
    const { userProfile, fetchUserProfile } = useUser();
    const [showModal, setShowModal] = useState(false);
    const [avatarModalOpen, setAvatarModalOpen] = useState(false);

    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);

    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [favoriteBookId, setFavoriteBookId] = useState("");
    const [tempAvatarUrl, setTempAvatarUrl] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!userProfile) return;

        const fetchProfileData = async () => {
            const booksRef = collection(db, "users", userProfile.uid, "books");
            const booksSnap = await getDocs(booksRef);
            const userBooks = booksSnap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setBooks(userBooks);

            const userDocRef = doc(db, "users", userProfile.uid);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
                const data = userSnap.data();
                setBio(data.bio || "");
                setFavoriteBookId(data.favoriteBookId || "");
                setDisplayName(data.displayName || "");
                setTempAvatarUrl(data.profilePicture || "");
            }

            setLoading(false);
        };

        fetchProfileData();
    }, [userProfile]);

    const handleSave = async () => {
        if (!userProfile) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, "users", userProfile.uid), {
                displayName,
                bio,
                favoriteBookId,
                profilePicture: tempAvatarUrl,
            });
            await fetchUserProfile(userProfile.uid);
            setEditMode(false);
        } catch (err) {
            console.error("Error saving profile:", err);
            alert("Failed to save profile.");
        }
        setSaving(false);
    };

    const favoriteBook = books.find((book) => book.id === favoriteBookId);

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-10 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    >
                        ➕ Add Book
                    </button>
                </div>

                {loading ? (
                    <p className="text-center text-gray-500">Loading profile...</p>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <img
                                src={`${tempAvatarUrl}?t=${Date.now()}`}
                                alt="Profile"
                                onClick={() => editMode && setAvatarModalOpen(true)}
                                className={`w-16 h-16 rounded-full object-cover border cursor-${editMode ? "pointer" : "default"} hover:opacity-80 transition`}
                                title={editMode ? "Click to change avatar" : ""}
                            />
                            {!editMode ? (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">{displayName}</h3>
                                </div>
                            ) : (
                                <input
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring focus:ring-indigo-300"
                                />
                            )}
                        </div>

                        {!editMode ? (
                            <>
                                <div>
                                    <h4 className="text-gray-700 font-medium mb-1">Bio</h4>
                                    {bio ? (
                                        <p className="text-gray-700 whitespace-pre-line">{bio}</p>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">
                                            No bio yet. Click "Edit Profile" to add one.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-gray-700 font-medium mb-1">Favorite Book</h4>
                                    {favoriteBook ? (
                                        <div className="flex items-center gap-3 bg-amber-50 border rounded p-2">
                                            <img
                                                src={favoriteBook.cover}
                                                alt={favoriteBook.title}
                                                className="w-12 h-16 object-cover rounded"
                                            />
                                            <div>
                                                <p className="font-semibold">{favoriteBook.title}</p>
                                                <p className="text-sm text-gray-600">by {favoriteBook.author}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">
                                            No favorite book selected. Add one from your collection.
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block font-medium mb-1 text-gray-700">
                                        Bio <span className="text-sm text-gray-400">({bio.length}/300)</span>
                                    </label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 300) setBio(e.target.value);
                                        }}
                                        rows={3}
                                        className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-300"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium mb-1 text-gray-700">Favorite Book</label>
                                    {books.length === 0 ? (
                                        <p className="text-sm text-gray-500">You haven't added any books yet.</p>
                                    ) : (
                                        <select
                                            value={favoriteBookId}
                                            onChange={(e) => setFavoriteBookId(e.target.value)}
                                            className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-300"
                                        >
                                            <option value="">Select a book...</option>
                                            {books.map((book) => (
                                                <option key={book.id} value={book.id}>
                                                    {book.title} — {book.author}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </>
                        )}

                        <div className="flex justify-end">
                            {editMode ? (
                                <>
                                    <button
                                        onClick={() => setEditMode(false)}
                                        className="mr-3 text-gray-600 hover:text-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md transition disabled:opacity-50"
                                    >
                                        {saving ? "Saving..." : "Save Profile"}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                <AddBookForm />
            </Modal>

            <AvatarSelectorModal
                isOpen={avatarModalOpen}
                onClose={() => setAvatarModalOpen(false)}
                onSave={(url) => setTempAvatarUrl(url)}
                displayName={displayName.trim()}
            />
        </div>
    );
}
