import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../utils/firebaseConfig";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { useUser } from "../hooks/useUsers";
import BookCard from "../components/PrivateBookCard";
import BookEditModal from "../components/BookEditModal";
import Swal from "sweetalert2";

export default function ViewCategoryPage() {
    const { userProfile } = useUser();
    const { categoryId } = useParams();
    const navigate = useNavigate();

    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    const [activeBook, setActiveBook] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const refreshBooks = async () => {
        const booksSnap = await getDocs(collection(db, "users", userProfile.uid, "books"));
        const bookList = booksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        let filtered = [];

        if (categoryId === "unassigned") {
            filtered = bookList.filter((b) => !b.categories || b.categories.length === 0);
        } else if (["to-read", "in-progress", "completed"].includes(categoryId)) {
            filtered = bookList.filter((b) => b.status === categoryId);
        } else {
            filtered = bookList.filter((b) => b.categories?.includes(categoryId));
        }

        setBooks(filtered);
        applySearch(filtered, searchTerm);
    };

    const applySearch = (bookList, term) => {
        if (!term.trim()) {
            setFilteredBooks(bookList);
        } else {
            const lower = term.toLowerCase();
            setFilteredBooks(
                bookList.filter(
                    (b) =>
                        b.title?.toLowerCase().includes(lower) ||
                        b.author?.toLowerCase().includes(lower)
                )
            );
        }
    };

    const handleRemoveBook = async (bookId) => {
        const book = books.find((b) => b.id === bookId);
        if (!book || !userProfile) return;

        const confirm = await Swal.fire({
            title: categoryId === "unassigned" ? "Remove from all categories?" : "Remove from this category?",
            text: categoryId === "unassigned"
                ? "This will remove the book from all categories."
                : "This will remove the book from this category only.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, remove it",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc2626",
        });

        if (!confirm.isConfirmed) return;

        const updatedCategories = categoryId === "unassigned"
            ? []
            : (book.categories || []).filter((c) => c !== categoryId);

        await updateDoc(doc(db, "users", userProfile.uid, "books", bookId), {
            categories: updatedCategories,
        });

        refreshBooks();
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!userProfile) return;

            const booksSnap = await getDocs(collection(db, "users", userProfile.uid, "books"));
            const bookList = booksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

            let filtered = [];

            if (categoryId === "unassigned") {
                setCategoryName("Unassigned Books");
                filtered = bookList.filter((b) => !b.categories || b.categories.length === 0);
            } else if (["to-read", "in-progress", "completed"].includes(categoryId)) {
                setCategoryName(categoryId.replace("-", " ").toUpperCase());
                filtered = bookList.filter((b) => b.status === categoryId);
            } else {
                const catSnap = await getDocs(collection(db, "users", userProfile.uid, "categories"));
                const cat = catSnap.docs.find((d) => d.id === categoryId);
                if (cat) {
                    setCategoryName(cat.data().name);
                    filtered = bookList.filter((b) => b.categories?.includes(categoryId));
                } else {
                    setCategoryName("Unknown Category");
                }
            }

            setBooks(filtered);
            applySearch(filtered, searchTerm);
        };

        fetchData();
    }, [userProfile, categoryId]);

    useEffect(() => {
        applySearch(books, searchTerm);
    }, [searchTerm]);

    return (
        <div className="min-h-screen bg-amber-50 px-6 py-10">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-800">📚 {categoryName}</h1>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-indigo-600 hover:underline"
                    >
                        ← Back
                    </button>
                </div>

                <div className="relative w-full mb-6">
                    <input
                        type="text"
                        placeholder="Search by title or author..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border px-4 py-2 rounded-md pr-10"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            aria-label="Clear search"
                        >
                            ×
                        </button>
                    )}
                </div>

                {filteredBooks.length === 0 ? (
                    <p className="text-gray-500 italic">No books found.</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        {filteredBooks.map((book) => (
                            <BookCard
                                key={book.id}
                                book={book}
                                onClick={() => setActiveBook(book)}
                                onRemove={() => handleRemoveBook(book.id)}
                                currentCategoryId={categoryId === "unassigned" ? null : categoryId}
                            />
                        ))}
                    </div>
                )}

                <BookEditModal
                    isOpen={!!activeBook}
                    onClose={() => setActiveBook(null)}
                    book={activeBook}
                    userId={userProfile?.uid}
                    onSave={refreshBooks}
                />
            </div>
        </div>
    );
}
