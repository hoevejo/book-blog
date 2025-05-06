// PublicLibrary.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import LibraryShelf from "../components/LibraryShelf";
import BookDetailModal from "../components/BookDetailModal";
import BookCard from "../components/BookCard"; // for modal fallback if needed


export default function PublicLibrary() {
    const { uid } = useParams();
    const [userInfo, setUserInfo] = useState(null);
    const [grouped, setGrouped] = useState({});
    const [activeBook, setActiveBook] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) setUserInfo(userDoc.data());

            const booksQuery = query(
                collection(db, `users/${uid}/books`),
                where("isPublic", "==", true)
            );
            const bookSnap = await getDocs(booksQuery);
            const bookList = bookSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const groupedByCategory = {};
            bookList.forEach(book => {
                (book.categories || ["Uncategorized"]).forEach(cat => {
                    if (!groupedByCategory[cat]) groupedByCategory[cat] = [];
                    groupedByCategory[cat].push(book);
                });
            });
            setGrouped(groupedByCategory);
        };

        fetchData();
    }, [uid]);

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {userInfo && (
                <h1 className="text-2xl font-bold mb-6">{userInfo.displayName}'s Public Library</h1>
            )}

            {Object.keys(grouped).length === 0 ? (
                <p className="text-gray-500">No public books found.</p>
            ) : (
                Object.entries(grouped).map(([category, books]) => (
                    <LibraryShelf
                        key={category}
                        uid={uid}
                        category={category}
                        books={books}
                        onBookClick={setActiveBook}
                    />
                ))
            )}
            <BookDetailModal
                isOpen={!!activeBook}
                onClose={() => setActiveBook(null)}
                book={activeBook}
            />
        </div>
    );
}
