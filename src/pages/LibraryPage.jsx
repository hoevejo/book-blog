import { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    setDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../utils/firebaseConfig";
import { useUser } from "../hooks/useUsers";
import PrivateLibraryShelf from "../components/PrivateLibraryShelf";
import BookEditModal from "../components/BookEditModal";
import AddBookForm from "../components/AddBookForm";
import Modal from "../components/Modal";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";

export default function PrivateLibraryPage() {
    const { userProfile } = useUser();
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState({});
    const [activeBook, setActiveBook] = useState(null);
    const [draggedBookId, setDraggedBookId] = useState(null);
    const [draggedFromCategoryId, setDraggedFromCategoryId] = useState(null);
    const [showAddBookModal, setShowAddBookModal] = useState(false);
    const [addingCategory, setAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [openSections, setOpenSections] = useState(() => {
        const saved = localStorage.getItem("libraryOpenSections");
        return saved ? JSON.parse(saved) : {};
    });
    const [removalInProgress, setRemovalInProgress] = useState(false);

    const navigate = useNavigate();
    const defaultStatuses = ["to-read", "in-progress", "completed"];

    useEffect(() => {
        if (!userProfile) return;
        fetchLibraryData();
    }, [userProfile]);

    const fetchLibraryData = async () => {
        const booksSnap = await getDocs(
            collection(db, "users", userProfile.uid, "books")
        );
        const booksList = booksSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        setBooks(booksList);

        const catSnap = await getDocs(
            collection(db, "users", userProfile.uid, "categories")
        );
        const catMap = {};
        catSnap.forEach((doc) => {
            catMap[doc.id] = { id: doc.id, ...doc.data() };
        });
        setCategories(catMap);

        const allKeys = ["unassigned", ...defaultStatuses, ...Object.keys(catMap)];
        setOpenSections((prev) => {
            const updated = { ...prev };
            allKeys.forEach((key) => {
                if (!(key in updated)) updated[key] = false;
            });
            return updated;
        });
    };

    useEffect(() => {
        localStorage.setItem("libraryOpenSections", JSON.stringify(openSections));
    }, [openSections]);

    const toggleSection = (key) => {
        setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const unassignedBooks = books.filter(
        (book) => !book.categories || book.categories.length === 0
    );

    const booksByStatus = (status) => books.filter((b) => b.status === status);
    const booksByCategory = (categoryId) =>
        books.filter((b) => b.categories?.includes(categoryId));

    const handleRenameCategory = async (categoryId, newName) => {
        await updateDoc(doc(db, "users", userProfile.uid, "categories", categoryId), {
            name: newName,
        });
        setCategories((prev) => ({
            ...prev,
            [categoryId]: { ...prev[categoryId], name: newName },
        }));
    };

    const handleDeleteCategory = async (categoryId) => {
        const confirm = await Swal.fire({
            title: "Delete category?",
            text: "This will remove the category but not delete any books.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it",
        });

        if (confirm.isConfirmed) {
            await deleteDoc(doc(db, "users", userProfile.uid, "categories", categoryId));

            const updatedBooks = books.map((book) => {
                if (book.categories?.includes(categoryId)) {
                    return {
                        ...book,
                        categories: book.categories.filter((catId) => catId !== categoryId),
                    };
                }
                return book;
            });

            setBooks(updatedBooks);
            setCategories((prev) => {
                const newCats = { ...prev };
                delete newCats[categoryId];
                return newCats;
            });
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        const newId = newCategoryName.toLowerCase().replace(/\s+/g, "-");
        await setDoc(doc(db, "users", userProfile.uid, "categories", newId), {
            name: newCategoryName,
        });
        setCategories((prev) => ({
            ...prev,
            [newId]: { id: newId, name: newCategoryName },
        }));
        setNewCategoryName("");
        setAddingCategory(false);
    };

    const handleDropToCategory = async (targetId) => {
        const book = books.find((b) => b.id === draggedBookId);
        if (!book || !userProfile) return;

        if (defaultStatuses.includes(targetId)) {
            if (book.status !== targetId) {
                await updateDoc(doc(db, "users", userProfile.uid, "books", book.id), {
                    status: targetId,
                });
            }
            setDraggedBookId(null);
            setDraggedFromCategoryId(null);
            fetchLibraryData();
            return;
        }

        const updatedCategories = Array.from(
            new Set([...(book.categories || []), targetId])
        );

        await updateDoc(doc(db, "users", userProfile.uid, "books", book.id), {
            categories: updatedCategories,
        });

        setDraggedBookId(null);
        setDraggedFromCategoryId(null);
        fetchLibraryData();
    };

    const handleRemoveFromCategory = async (bookId, categoryId) => {
        if (removalInProgress) return;
        setRemovalInProgress(true);

        const book = books.find((b) => b.id === bookId);
        if (!book || !userProfile) {
            setRemovalInProgress(false);
            return;
        }

        const confirm = await Swal.fire({
            title: categoryId ? "Remove from this category?" : "Remove from all categories?",
            text: categoryId
                ? "This will remove the book from this category."
                : "This will remove the book from all categories.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, remove it",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc2626",
        });

        if (confirm.isConfirmed) {
            const updatedCategories = categoryId
                ? (book.categories || []).filter((c) => c !== categoryId)
                : [];

            await updateDoc(doc(db, "users", userProfile.uid, "books", bookId), {
                categories: updatedCategories,
            });

            fetchLibraryData();
        }

        setRemovalInProgress(false);
    };

    useEffect(() => {
        const handleDragEnd = () => {
            setDraggedBookId(null);
            setDraggedFromCategoryId(null);
        };
        window.addEventListener("book-drag-end", handleDragEnd);
        return () => window.removeEventListener("book-drag-end", handleDragEnd);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-8 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h1 className="text-3xl font-bold text-gray-800">📚 My Library</h1>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <button
                            onClick={() => setShowAddBookModal(true)}
                            className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 w-full sm:w-auto"
                        >
                            <FaPlus /> Add Book
                        </button>
                        <button
                            onClick={() => setAddingCategory(true)}
                            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 w-full sm:w-auto"
                        >
                            <FaPlus /> Add Category
                        </button>
                    </div>
                </div>

                {addingCategory && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="New category name"
                            className="border px-3 py-2 rounded-md w-full sm:w-auto flex-grow"
                        />
                        <div className="flex gap-2 mt-2 sm:mt-0">
                            <button
                                onClick={handleAddCategory}
                                className="bg-green-600 text-white px-4 py-2 rounded-md"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setAddingCategory(false)}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Default Status Shelves */}
                {defaultStatuses.map((status) => (
                    <PrivateLibraryShelf
                        key={status}
                        title={status.replace("-", " ").toUpperCase()}
                        books={booksByStatus(status)}
                        onBookClick={setActiveBook}
                        onDragStart={(bookId) => {
                            setDraggedBookId(bookId);
                            setDraggedFromCategoryId(null);
                        }}
                        onDropCategory={() => handleDropToCategory(status)}
                        isOpen={openSections[status]}
                        onToggleOpen={() => toggleSection(status)}
                        onViewAll={() => navigate(`/library/category/${status}`)}
                        onRemoveBook={handleRemoveFromCategory}
                    />
                ))}

                {/* Unassigned */}
                <PrivateLibraryShelf
                    title="Unassigned Books"
                    books={unassignedBooks}
                    onBookClick={setActiveBook}
                    onDragStart={(bookId) => {
                        setDraggedBookId(bookId);
                        setDraggedFromCategoryId(null);
                    }}
                    onDropCategory={handleDropToCategory}
                    isOpen={openSections["unassigned"]}
                    onToggleOpen={() => toggleSection("unassigned")}
                    onViewAll={() => navigate("/library/category/unassigned")}
                    onRemoveBook={(bookId) => handleRemoveFromCategory(bookId, null)}
                />

                {/* Custom Categories */}
                {Object.entries(categories).map(([id, cat]) => (
                    <PrivateLibraryShelf
                        key={id}
                        title={cat.name}
                        books={booksByCategory(id)}
                        onBookClick={setActiveBook}
                        categoryId={id}
                        onDragStart={(bookId) => {
                            setDraggedBookId(bookId);
                            setDraggedFromCategoryId(id);
                        }}
                        onDropCategory={() => handleDropToCategory(id)}
                        isCustom
                        onRenameCategory={handleRenameCategory}
                        onDeleteCategory={handleDeleteCategory}
                        isOpen={openSections[id]}
                        onToggleOpen={() => toggleSection(id)}
                        onViewAll={() => navigate(`/library/category/${id}`)}
                        onRemoveBook={(bookId) => handleRemoveFromCategory(bookId, id)}
                    />
                ))}

                {/* Modals */}
                <BookEditModal
                    isOpen={!!activeBook}
                    onClose={() => setActiveBook(null)}
                    book={activeBook}
                    userId={userProfile?.uid}
                    onSave={() => fetchLibraryData()}
                    categories={categories}
                />

                <Modal isOpen={showAddBookModal} onClose={() => setShowAddBookModal(false)}>
                    <AddBookForm
                        onBookAdded={() => {
                            setShowAddBookModal(false);
                            fetchLibraryData();
                        }}
                    />
                </Modal>

                {/* Drop Zones */}
                {draggedBookId && draggedFromCategoryId && (
                    <div
                        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-yellow-100 border border-yellow-500 text-yellow-800 px-6 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={async () => {
                            if (removalInProgress) return;
                            setRemovalInProgress(true);

                            const book = books.find((b) => b.id === draggedBookId);
                            if (!book || !userProfile) {
                                setRemovalInProgress(false);
                                return;
                            }

                            const confirm = await Swal.fire({
                                title: "Remove from this category?",
                                text: "This will remove the book only from the category it was dragged from.",
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonText: "Yes, remove it",
                                confirmButtonColor: "#f59e0b",
                            });

                            if (confirm.isConfirmed) {
                                const updatedCategories = (book.categories || []).filter(
                                    (c) => c !== draggedFromCategoryId
                                );

                                await updateDoc(doc(db, "users", userProfile.uid, "books", book.id), {
                                    categories: updatedCategories,
                                });

                                fetchLibraryData();
                            }

                            setDraggedBookId(null);
                            setDraggedFromCategoryId(null);
                            setRemovalInProgress(false);
                        }}
                    >
                        <span className="text-lg">➖</span>
                        Remove from dragged category
                    </div>
                )}

                {draggedBookId && (
                    <div
                        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-red-100 border border-red-500 text-red-700 px-6 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={async () => {
                            if (removalInProgress) return;
                            setRemovalInProgress(true);

                            const book = books.find((b) => b.id === draggedBookId);
                            if (!book || !book.categories?.length || !userProfile) {
                                setRemovalInProgress(false);
                                return;
                            }

                            const confirm = await Swal.fire({
                                title: "Remove from all categories?",
                                text: "This will move the book to Unassigned.",
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonText: "Yes, remove",
                                cancelButtonText: "Cancel",
                                confirmButtonColor: "#dc2626",
                            });

                            if (confirm.isConfirmed) {
                                await updateDoc(doc(db, "users", userProfile.uid, "books", book.id), {
                                    categories: [],
                                });
                                fetchLibraryData();
                            }

                            setDraggedBookId(null);
                            setDraggedFromCategoryId(null);
                            setRemovalInProgress(false);
                        }}
                    >
                        <span className="text-lg">🗑️</span>
                        Remove from all categories
                    </div>
                )}
            </div>
        </div>
    );
}
