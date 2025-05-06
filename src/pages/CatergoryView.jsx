// CategoryView.jsx
import BookDetailModal from "../components/BookDetailModal";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../utils/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import BookCard from "../components/BookCard";


export default function CategoryView() {
    const { uid, name } = useParams();
    const [books, setBooks] = useState([]);
    const [activeBook, setActiveBook] = useState(null);

    useEffect(() => {
        const fetchBooks = async () => {
            const booksQuery = query(
                collection(db, `users/${uid}/books`),
                where("isPublic", "==", true)
            );
            const bookSnap = await getDocs(booksQuery);
            const filtered = bookSnap.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(book => (book.categories || ["Uncategorized"]).includes(name));

            setBooks(filtered);
        };

        fetchBooks();
    }, [uid, name]);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">{decodeURIComponent(name)} ({books.length})</h1>

            {books.length === 0 ? (
                <p className="text-gray-500">No books found in this category.</p>
            ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {books.map((book) => (
                        <BookCard key={book.id} book={book} onClick={() => setActiveBook(book)} />
                    ))}
                </div>
            )}
            <BookDetailModal
                isOpen={!!activeBook}
                book={activeBook}
                onClose={() => setActiveBook(null)}
            />
        </div>
    );
}
