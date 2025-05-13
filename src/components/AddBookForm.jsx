import { useState, useEffect } from "react";
import { db, auth } from "../utils/firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Rating from "react-rating";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";

export default function AddBookForm() {
    const [query, setQuery] = useState("");
    const [searchType, setSearchType] = useState("title");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [status, setStatus] = useState("to-read");
    const [rating, setRating] = useState(0);
    const [isPublic, setIsPublic] = useState(true);
    const [resultLimit, setResultLimit] = useState(5);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setResultLimit(5);
    }, [query, searchType]);

    const getAuthorNames = async (authors) => {
        const names = await Promise.all(
            authors.map(async (author) => {
                try {
                    const res = await fetch(`https://openlibrary.org${author.key}.json`);
                    const data = await res.json();
                    return data.name;
                } catch {
                    return "Unknown Author";
                }
            })
        );
        return names.join(", ");
    };

    const searchBooks = async (limit = resultLimit) => {
        setSearchResults([]);
        setLoading(true);

        if (searchType === "isbn") {
            const isbn = query.replace(/-/g, "");
            try {
                const res = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
                const data = await res.json();

                let description = "No summary available.";
                const workKey = data.works?.[0]?.key;

                if (workKey) {
                    try {
                        const workRes = await fetch(`https://openlibrary.org${workKey}.json`);
                        const workData = await workRes.json();
                        description =
                            typeof workData.description === "string"
                                ? workData.description
                                : workData.description?.value || description;
                    } catch { /* empty */ }
                }

                const book = {
                    id: workKey?.replace("/works/", "") || data.key.replace("/books/", ""),
                    title: data.title,
                    author: data.authors ? await getAuthorNames(data.authors) : "Unknown Author",
                    cover: data.covers?.[0]
                        ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`
                        : null,
                    summary: description
                };

                setSearchResults([book]);
            } catch {
                toast.error("No book found for that ISBN.");
            }
        } else {
            const field = searchType === "author" ? "author" : "title";
            const res = await fetch(
                `https://openlibrary.org/search.json?${field}=${encodeURIComponent(query)}`
            );
            const data = await res.json();

            const limitedBooks = data.docs.slice(0, limit);

            const books = await Promise.all(
                limitedBooks.map(async (b) => {
                    const workKey = b.key;
                    let description = "No summary available.";

                    try {
                        const workRes = await fetch(`https://openlibrary.org${workKey}.json`);
                        const workData = await workRes.json();

                        if (workData?.type?.key === "/type/redirect" && workData.location) {
                            const redirectedRes = await fetch(`https://openlibrary.org${workData.location}.json`);
                            const redirectedData = await redirectedRes.json();
                            description =
                                typeof redirectedData.description === "string"
                                    ? redirectedData.description
                                    : redirectedData.description?.value || description;
                        } else {
                            description =
                                typeof workData.description === "string"
                                    ? workData.description
                                    : workData.description?.value || description;
                        }
                    } catch { /* empty */ }

                    return {
                        id: b.key.replace("/works/", ""),
                        title: b.title,
                        author: b.author_name?.join(", ") || "Unknown Author",
                        cover: b.cover_i
                            ? `https://covers.openlibrary.org/b/id/${b.cover_i}-L.jpg`
                            : null,
                        summary: description,
                        year: b.first_publish_year || null
                    };
                })
            );

            setSearchResults(books);
        }

        setLoading(false);
    };

    const handleViewMore = async () => {
        const newLimit = resultLimit + 20;
        setResultLimit(newLimit);
        await searchBooks(newLimit);
        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        }, 200);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedBook) return;
        const user = auth.currentUser;
        if (!user) {
            Swal.fire({
                title: "Sign In Required",
                text: "You need to be signed in to add a book.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Go to Login",
                cancelButtonText: "Cancel",
                confirmButtonColor: "#6366f1",
            }).then((result) => {
                if (result.isConfirmed) navigate("/auth");
            });
            return;
        }

        try {
            const bookRef = doc(db, `users/${user.uid}/books/${selectedBook.id}`);
            await setDoc(bookRef, {
                ...selectedBook,
                status,
                rating,
                isPublic,
                addedAt: serverTimestamp(),
            });

            toast.success("Book added to your profile!");
            setSelectedBook(null);
            setQuery("");
            setSearchResults([]);
            setRating(0);
            setIsPublic(true);
            setStatus("to-read");
        } catch (error) {
            console.error("Add book failed:", error);
            toast.error("Failed to add book. Please try again.");
        }
    };

    const ratingLabels = ["Terrible", "Poor", "Okay", "Good", "Excellent"];

    return (
        <div className="w-full max-w-xl mx-auto px-4 py-6 bg-white rounded-lg shadow">
            {!selectedBook ? (
                <>
                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="w-full border px-3 py-2 rounded mb-2"
                    >
                        <option value="title">Title</option>
                        <option value="author">Author</option>
                        <option value="isbn">ISBN</option>
                    </select>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={`Search by ${searchType}...`}
                        className="w-full border px-3 py-2 rounded mb-2"
                    />
                    <button
                        onClick={() => searchBooks()}
                        disabled={loading}
                        className={`w-full py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"}`}
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
                                {book.year && <span className="ml-1 text-xs text-gray-500">({book.year})</span>}
                                <div className="text-sm text-gray-600">by {book.author}</div>
                            </div>
                        ))}
                    </div>
                    {searchResults.length >= resultLimit && (
                        <button
                            onClick={handleViewMore}
                            className="mt-4 w-full text-indigo-600 hover:underline text-sm"
                        >
                            View More Results
                        </button>
                    )}
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

                    <p className="text-sm text-gray-700">{selectedBook.summary}</p>

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
                            <label className="block font-medium mb-1">Rating</label>
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

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isPublic"
                            checked={isPublic}
                            onChange={() => setIsPublic(!isPublic)}
                        />
                        <label htmlFor="isPublic" className="text-sm">Make this public</label>
                    </div>

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
                            Save to Profile
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
