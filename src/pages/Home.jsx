// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { useUser } from "../hooks/useUsers";
import { db } from "../utils/firebaseConfig";
import {
    collection,
    getDocs,
    query,
    orderBy,
    limit
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import AddBookForm from "../components/AddBookForm";
import BookCard from "../components/PrivateBookCard";



export default function Home() {
    const { userProfile } = useUser();
    const [books, setBooks] = useState([]);
    const [journalEntry, setJournalEntry] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (!userProfile) return;

        const fetchBooks = async () => {
            const booksRef = collection(db, "users", userProfile.uid, "books");
            const bookSnap = await getDocs(booksRef);
            const allBooks = bookSnap.docs.map(doc => doc.data());
            setBooks(allBooks);
        };

        const fetchLatestJournal = async () => {
            const journalRef = collection(db, "journals", userProfile.uid, "entries");
            const q = query(journalRef, orderBy("timestamp", "desc"), limit(1));
            const journalSnap = await getDocs(q);
            if (!journalSnap.empty) {
                setJournalEntry(journalSnap.docs[0].data());
            }
        };

        fetchBooks();
        fetchLatestJournal();
    }, [userProfile]);

    const countByStatus = (status) =>
        books.filter((book) => book.status === status).length;

    const totalBooks = books.length;
    const toRead = countByStatus("to-read");
    const inProgress = countByStatus("in-progress");
    const completed = countByStatus("completed");

    const recentBooks = [...books]
        .sort((a, b) => b.addedAt?.seconds - a.addedAt?.seconds)
        .slice(0, 5);

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-10 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-gray-800">Welcome Back, {userProfile?.displayName}!</h2>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
                    >
                        ➕ Add Book
                    </button>
                </div>

                {/* Stats */}
                <section className="bg-white rounded-lg shadow p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div>
                        <h3 className="text-xl font-bold text-indigo-600">{toRead}</h3>
                        <p className="text-sm text-gray-600">To Read</p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-indigo-600">{inProgress}</h3>
                        <p className="text-sm text-gray-600">In Progress</p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-indigo-600">{completed}</h3>
                        <p className="text-sm text-gray-600">Completed</p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-indigo-600">{totalBooks}</h3>
                        <p className="text-sm text-gray-600">Total Books</p>
                    </div>
                </section>

                {/* Reading Challenge */}
                <section className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">📚 Reading Challenge</h2>
                    <p className="text-sm text-gray-600">Coming soon! Track your yearly goals and progress here.</p>
                </section>

                {/* Recent Books */}
                <section className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">📖 Recent Books</h2>
                        <button
                            onClick={() => navigate("/library")}
                            className="text-indigo-600 hover:underline text-sm"
                        >
                            View Library
                        </button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {recentBooks.map((book, idx) => (
                            <div key={idx} className="flex-shrink-0">
                                <BookCard book={book} onClick={() => navigate(`/library`)} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Journal Preview */}
                <section className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">📝 Latest Journal Entry</h2>
                        <button
                            onClick={() => navigate("/journal")}
                            className="text-indigo-600 hover:underline text-sm"
                        >
                            View Journal
                        </button>
                    </div>

                    {journalEntry ? (
                        <div className="bg-amber-50 border border-amber-100 rounded-md p-4 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">{journalEntry.title}</h3>
                                    <p className="text-sm text-gray-500 mb-2">
                                        {new Date(journalEntry.timestamp?.seconds * 1000).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <p className="text-gray-700 mt-2 whitespace-pre-line line-clamp-6">
                                {journalEntry.content}
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">No journal entries yet.</p>
                    )}
                </section>
            </div>
            <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                <AddBookForm />
            </Modal>
        </div>
    );
}
