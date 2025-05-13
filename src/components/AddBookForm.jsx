import { useState, useEffect } from "react";
import { db, auth } from "../utils/firebaseConfig";
import {
    doc,
    setDoc,
    serverTimestamp,
    getDocs,
    collection,
    setDoc as addCategoryDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Rating from "react-rating";
import toast from "react-hot-toast";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import Select from "react-select";

export default function AddBookForm() {
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [status, setStatus] = useState("to-read");
    const [rating, setRating] = useState(0);
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const user = auth.currentUser;
        if (!user) return;
        const snap = await getDocs(collection(db, "users", user.uid, "categories"));
        const catList = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCategories(catList);
    };

    const handleAddCategory = async () => {
        const user = auth.currentUser;
        const id = newCategory.toLowerCase().replace(/\s+/g, "-");
        await addCategoryDoc(doc(db, "users", user.uid, "categories", id), {
            name: newCategory,
        });
        setCategories((prev) => [...prev, { id, name: newCategory }]);
        setSelectedCategories((prev) => [...prev, id]);
        setNewCategory("");
    };

    const searchGoogleBooks = async () => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(
                `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`
            );
            const data = await res.json();
            const books = data.items.map((item) => {
                const info = item.volumeInfo;
                return {
                    id: item.id,
                    title: info.title,
                    author: info.authors?.join(", ") || "Unknown Author",
                    cover: info.imageLinks?.thumbnail || null,
                    summary: info.description || "No summary available.",
                    year: info.publishedDate ? info.publishedDate.split("-")[0] : null,
                };
            });
            setSearchResults(books);
            // eslint-disable-next-line no-unused-vars
        } catch (err) {
            toast.error("Failed to fetch books.");
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedBook) return;
        const user = auth.currentUser;
        if (!user) {
            toast.error("Sign in required.");
            return navigate("/auth");
        }

        try {
            const bookRef = doc(db, `users/${user.uid}/books/${selectedBook.id}`);
            await setDoc(bookRef, {
                ...selectedBook,
                status,
                rating,
                categories: selectedCategories,
                addedAt: serverTimestamp(),
            });
            toast.success("Book saved!");
            setSelectedBook(null);
            setQuery("");
            setSearchResults([]);
            setStatus("to-read");
            setRating(0);
            setSelectedCategories([]);
        } catch (err) {
            console.error("Save failed", err);
            toast.error("Failed to save book.");
        }
    };

    const ratingLabels = ["Terrible", "Poor", "Okay", "Good", "Excellent"];

    return (
        <div className="w-full max-w-xl mx-auto px-4 py-6 bg-white rounded-lg shadow max-h-[90vh] overflow-y-auto">
            {!selectedBook ? (
                <>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for a book..."
                        className="w-full border px-3 py-2 rounded mb-2"
                    />
                    <button
                        onClick={searchGoogleBooks}
                        disabled={loading}
                        className="w-full py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {loading ? "Searching..." : "Search"}
                    </button>
                    <div className="mt-4 max-h-96 overflow-y-auto space-y-2">
                        {searchResults.map((book) => (
                            <div
                                key={book.id}
                                onClick={() => setSelectedBook(book)}
                                className="border p-2 rounded cursor-pointer hover:bg-gray-100"
                            >
                                <strong>{book.title}</strong>
                                {book.year && (
                                    <span className="ml-1 text-xs text-gray-500">
                                        ({book.year})
                                    </span>
                                )}
                                <div className="text-sm text-gray-600">by {book.author}</div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {selectedBook.cover && (
                            <img
                                src={selectedBook.cover}
                                alt={selectedBook.title}
                                className="w-24 h-36 object-cover rounded self-center"
                            />
                        )}
                        <div>
                            <h2 className="text-lg font-bold">{selectedBook.title}</h2>
                            <p className="text-sm text-gray-600">by {selectedBook.author}</p>
                        </div>
                    </div>

                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedBook.summary}
                    </p>

                    <div>
                        <label className="block font-medium mb-1">Categories</label>
                        <Select
                            isMulti
                            options={categories.map((cat) => ({
                                value: cat.id,
                                label: cat.name,
                            }))}
                            value={categories
                                .filter((cat) => selectedCategories.includes(cat.id))
                                .map((cat) => ({ value: cat.id, label: cat.name }))}
                            onChange={(selectedOptions) =>
                                setSelectedCategories(selectedOptions.map((opt) => opt.value))
                            }
                            className="react-select-container"
                            classNamePrefix="react-select"
                            placeholder="Select categories..."
                        />
                    </div>


                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="Add new category"
                            className="border px-2 py-1 rounded text-sm"
                        />
                        <button
                            type="button"
                            onClick={handleAddCategory}
                            className="text-sm bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                        >
                            Add
                        </button>
                    </div>

                    <div>
                        <label className="block font-medium">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full border px-3 py-2 rounded"
                        >
                            <option value="to-read">To Read</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    {status === "completed" && (
                        <div>
                            <label className="block font-medium">Rating</label>
                            <div className="flex items-center gap-2">
                                <Rating
                                    fractions={2}
                                    initialRating={rating}
                                    onChange={(value) => setRating(value)}
                                    emptySymbol={<FaRegStar className="text-2xl text-gray-300" />}
                                    fullSymbol={<FaStar className="text-2xl text-yellow-500" />}
                                    placeholderSymbol={<FaStarHalfAlt className="text-2xl text-yellow-400" />}
                                />
                                <span className="text-sm text-gray-600">{rating}/5</span>
                            </div>
                            {rating > 0 && (
                                <p className="text-xs text-gray-500 italic mt-1">
                                    {ratingLabels[Math.floor(rating) - 1] || ""}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={() => setSelectedBook(null)}
                            className="text-sm text-gray-600 hover:underline"
                        >
                            ← Search again
                        </button>
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                        >
                            Save to Library
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
