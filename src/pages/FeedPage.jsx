import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";; // Adjust this if your firebase config is elsewhere

export default function FeedPage() {
    const [articles, setArticles] = useState([]);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const q = query(collection(db, "news"), orderBy("publishedAt", "desc"));
                const snapshot = await getDocs(q);
                const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setArticles(items);
            } catch (err) {
                console.error("Failed to fetch news:", err);
            }
        };

        fetchNews();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white px-4 py-10">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold text-gray-800">📚 Book News Feed</h1>
                <p className="text-gray-600">
                    Latest updates from the book world — new releases, awards, and more.
                </p>

                {articles.length === 0 ? (
                    <p className="text-gray-500 italic">No news articles found.</p>
                ) : (
                    <div className="space-y-6">
                        {articles.map((article) => (
                            <div
                                key={article.id}
                                className="bg-white rounded-xl shadow p-5 flex flex-col sm:flex-row gap-4"
                            >
                                {article.image && (
                                    <img
                                        src={article.image}
                                        alt=""
                                        className="w-full sm:w-48 h-32 object-cover rounded-md"
                                    />
                                )}
                                <div className="flex-1">
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        {article.title}
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                                        {article.summary}
                                    </p>
                                    <div className="flex justify-between items-center mt-4">
                                        <span className="text-xs text-gray-400 italic">
                                            {article.source} •{" "}
                                            {new Date(article.publishedAt).toLocaleDateString()}
                                        </span>
                                        <a
                                            href={article.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 underline"
                                        >
                                            Read More
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
