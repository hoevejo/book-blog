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
            bookIds: [],
        });
        setCategories((prev) => ({
            ...prev,
            [newId]: { id: newId, name: newCategoryName, bookIds: [] },
        }));
        setNewCategoryName("");
        setAddingCategory(false);
    };

    const handleDropToCategory = async (targetCategoryId) => {
        const book = books.find((b) => b.id === draggedBookId);
        if (!book || !userProfile) return;

        const updatedCategories = Array.from(new Set([...(book.categories || []), targetCategoryId]));

        await updateDoc(doc(db, "users", userProfile.uid, "books", book.id), {
            categories: updatedCategories,
        });

        setDraggedBookId(null);
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

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-10 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">📚 My Library</h1>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowAddBookModal(true)}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                        >
                            <FaPlus /> Add Book
                        </button>
                        <button
                            onClick={() => setAddingCategory(true)}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                        >
                            <FaPlus /> Add Category
                        </button>
                    </div>
                </div>

                {addingCategory && (
                    <div className="flex gap-2 mb-6">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="New category name"
                            className="border px-3 py-2 rounded-md w-full"
                        />
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
                )}

                {defaultStatuses.map((status) => (
                    <PrivateLibraryShelf
                        key={status}
                        title={status.replace("-", " ").toUpperCase()}
                        books={booksByStatus(status)}
                        onBookClick={setActiveBook}
                        onDragStart={setDraggedBookId}
                        onDropCategory={() => handleDropToCategory(status)}
                        isOpen={openSections[status]}
                        onToggleOpen={() => toggleSection(status)}
                        onViewAll={() => navigate(`/library/category/${status}`)}
                        onRemoveBook={handleRemoveFromCategory}
                    />
                ))}

                <PrivateLibraryShelf
                    title="Unassigned Books"
                    books={unassignedBooks}
                    onBookClick={setActiveBook}
                    onDragStart={setDraggedBookId}
                    onDropCategory={handleDropToCategory}
                    isOpen={openSections["unassigned"]}
                    onToggleOpen={() => toggleSection("unassigned")}
                    onViewAll={() => navigate("/library/category/unassigned")}
                    onRemoveBook={(bookId) => handleRemoveFromCategory(bookId, null)}
                />

                {Object.entries(categories).map(([id, cat]) => (
                    <PrivateLibraryShelf
                        key={id}
                        title={cat.name}
                        books={booksByCategory(id)}
                        onBookClick={setActiveBook}
                        categoryId={id}
                        onDragStart={setDraggedBookId}
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

                <BookEditModal
                    isOpen={!!activeBook}
                    onClose={() => setActiveBook(null)}
                    book={activeBook}
                    userId={userProfile?.uid}
                    onSave={() => fetchLibraryData()}
                />

                <Modal isOpen={showAddBookModal} onClose={() => setShowAddBookModal(false)}>
                    <AddBookForm
                        onBookAdded={() => {
                            setShowAddBookModal(false);
                            fetchLibraryData();
                        }}
                    />
                </Modal>

                {draggedBookId && (
                    <div
                        className="fixed right-0 top-0 bottom-0 w-12 bg-gray-200 flex items-center justify-center z-50 text-sm text-red-700 font-semibold shadow-inner"
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
                            setRemovalInProgress(false);
                        }}
                    >
                        ❌<br />Remove
                    </div>
                )}
            </div>
        </div>
    );
}
