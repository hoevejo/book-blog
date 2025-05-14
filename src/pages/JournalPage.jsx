import { useEffect, useState } from "react";
import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    query,
    orderBy,
} from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { useUser } from "../hooks/useUsers";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";

export default function JournalPage() {
    const { userProfile } = useUser();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newEntry, setNewEntry] = useState({ title: "", content: "" });
    const [editingId, setEditingId] = useState(null);
    const [editingContent, setEditingContent] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("");

    const fetchEntries = async () => {
        if (!userProfile) return;
        const q = query(
            collection(db, "journals", userProfile.uid, "entries"),
            orderBy("timestamp", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        setEntries(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchEntries();
    }, [userProfile]);

    const handleAddEntry = async (e) => {
        e.preventDefault();
        if (!newEntry.title || !newEntry.content || !userProfile) return;

        await addDoc(collection(db, "journals", userProfile.uid, "entries"), {
            ...newEntry,
            timestamp: serverTimestamp(),
        });

        setNewEntry({ title: "", content: "" });
        setShowModal(false);
        fetchEntries();
    };

    const handleEditEntry = async (id) => {
        const entryRef = doc(db, "journals", userProfile.uid, "entries", id);
        await updateDoc(entryRef, {
            ...editingContent,
            updatedAt: serverTimestamp(),
        });
        setEditingId(null);
        setEditingContent({});
        fetchEntries();
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete Entry?",
            text: "Are you sure you want to delete this journal entry?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            confirmButtonColor: "#e3342f",
        });

        if (result.isConfirmed) {
            await deleteDoc(doc(db, "journals", userProfile.uid, "entries", id));
            fetchEntries();
        }
    };

    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    }, [showModal]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-10 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">📝 My Journal</h1>

                {entries.length > 0 && (
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                        <input
                            type="text"
                            placeholder="Search journal..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-1/2 px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-300"
                        />
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-300"
                        />
                    </div>
                )}

                {loading ? (
                    <p className="text-center text-gray-500">Loading your journal entries...</p>
                ) : entries.length === 0 ? (
                    <p className="text-center text-gray-500">No entries yet. Start writing!</p>
                ) : (
                    <ul className="space-y-6">
                        {entries
                            .filter((entry) => {
                                const matchSearch =
                                    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    entry.content.toLowerCase().includes(searchTerm.toLowerCase());
                                const matchDate =
                                    !filterDate ||
                                    new Date(entry.timestamp.seconds * 1000).toISOString().slice(0, 10) ===
                                    filterDate;
                                return matchSearch && matchDate;
                            })
                            .map((entry) =>
                                editingId === entry.id ? (
                                    <li key={entry.id} className="bg-amber-50 border rounded-md p-4 shadow-sm">
                                        <input
                                            className="w-full mb-2 px-3 py-2 border rounded-md"
                                            value={editingContent.title}
                                            onChange={(e) =>
                                                setEditingContent((prev) => ({
                                                    ...prev,
                                                    title: e.target.value,
                                                }))
                                            }
                                        />
                                        <textarea
                                            className="w-full h-24 px-3 py-2 border rounded-md"
                                            value={editingContent.content}
                                            onChange={(e) =>
                                                setEditingContent((prev) => ({
                                                    ...prev,
                                                    content: e.target.value,
                                                }))
                                            }
                                        />
                                        <div className="flex justify-end mt-2 gap-2">
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleEditEntry(entry.id)}
                                                className="px-4 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </li>
                                ) : (
                                    <li key={entry.id} className="bg-amber-50 border rounded-md p-4 shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h2 className="text-lg font-semibold text-gray-800">{entry.title}</h2>
                                                <p className="text-sm text-gray-500 mb-2">
                                                    {new Date(entry.timestamp?.seconds * 1000).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingId(entry.id);
                                                        setEditingContent({
                                                            title: entry.title,
                                                            content: entry.content,
                                                        });
                                                    }}
                                                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(entry.id)}
                                                    className="text-red-500 hover:text-red-700 text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-gray-700 mt-2 whitespace-pre-line">{entry.content}</p>
                                    </li>
                                )
                            )}
                    </ul>
                )}
            </div>

            {/* Floating Add Button */}
            <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-24 sm:bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg z-50"
                title="Add Journal Entry"
            >
                <FaPlus />
            </button>



            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-auto">
                        <h2 className="text-xl font-bold mb-4 text-center">New Journal Entry</h2>
                        <form onSubmit={handleAddEntry} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Title"
                                value={newEntry.title}
                                onChange={(e) =>
                                    setNewEntry({ ...newEntry, title: e.target.value })
                                }
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-300"
                                autoFocus
                            />
                            <textarea
                                placeholder="Write your thoughts..."
                                value={newEntry.content}
                                onChange={(e) =>
                                    setNewEntry({ ...newEntry, content: e.target.value })
                                }
                                className="w-full h-32 px-4 py-2 border rounded-md resize-none focus:outline-none focus:ring focus:ring-indigo-300"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setNewEntry({ title: "", content: "" });
                                    }}
                                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
