// PublicProfile.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";

export default function PublicProfile() {
    const { uid } = useParams();
    const [userInfo, setUserInfo] = useState(null);
    const [publicBooks, setPublicBooks] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) setUserInfo(userDoc.data());

            const booksQuery = query(
                collection(db, `users/${uid}/books`),
                where("isPublic", "==", true)
            );
            const bookSnap = await getDocs(booksQuery);
            const books = bookSnap.docs.map(doc => doc.data());
            setPublicBooks(books);
        };

        fetchData();
    }, [uid]);

    const countByStatus = (status) =>
        publicBooks.filter(b => b.status === status).length;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            {userInfo && (
                <div className="mb-6 text-center">
                    <img
                        src={userInfo.profilePicture}
                        alt={userInfo.displayName}
                        className="w-20 h-20 rounded-full mx-auto mb-2 border"
                    />
                    <h1 className="text-xl font-semibold">{userInfo.displayName}</h1>
                </div>
            )}

            <div className="bg-white p-4 rounded shadow mb-6">
                <h2 className="text-lg font-semibold mb-3">Library Overview</h2>
                <ul className="space-y-1 text-sm">
                    <li>Total Public Books: {publicBooks.length}</li>
                    <li>To Read: {countByStatus("to-read")}</li>
                    <li>In Progress: {countByStatus("in-progress")}</li>
                    <li>Completed: {countByStatus("completed")}</li>
                </ul>
                <Link
                    to={`/library/${uid}`}
                    className="inline-block mt-4 text-indigo-600 hover:underline text-sm"
                >
                    See Full Library →
                </Link>
            </div>

            <div className="bg-white p-4 rounded shadow">
                <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
                {publicBooks.length > 0 ? (
                    <div className="space-y-2">
                        {publicBooks.slice(0, 3).map((book, idx) => (
                            <div key={idx} className="border rounded p-2">
                                <strong>{book.title}</strong> by {book.author}
                                <p className="text-xs text-gray-500 italic">
                                    {book.status.replace("-", " ")}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">No public books shared yet.</p>
                )}
            </div>
        </div>
    );
}
