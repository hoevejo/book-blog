// LibraryShelf.jsx
import { Link } from "react-router-dom";
import BookCard from "./BookCard";

export default function LibraryShelf({ uid, category, books = [], onBookClick }) {
    if (!books.length) return null;

    return (
        <section className="mb-8">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">
                    {category} <span className="text-gray-500">({books.length})</span>
                </h3>
                <Link
                    to={`/library/${uid}/category/${encodeURIComponent(category)}`}
                    className="text-sm text-indigo-600 hover:underline"
                >
                    See All
                </Link>
            </div>

            <div className="overflow-x-auto">
                <div className="flex gap-4">
                    {books.map((book) => (
                        <BookCard
                            key={book.id}
                            book={book}
                            onClick={() => onBookClick(book)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
