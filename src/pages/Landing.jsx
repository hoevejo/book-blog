import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { FaStar, FaFeatherAlt, FaBookOpen, FaRobot } from "react-icons/fa";
import PrivateBookCard from "../components/PrivateBookCard";
import dummyBooks from "../data/dummyBooks"; // assume this is a local array of 4 dummy book objects

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="w-full min-h-screen bg-gradient-to-b from-amber-50 to-white text-gray-800">
            {/* Hero */}
            <section className="px-6 py-20 text-center max-w-4xl mx-auto">
                <Motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl md:text-6xl font-serif font-bold mb-4"
                >
                    Your Cozy Digital Library
                </Motion.h1>
                <Motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-lg md:text-xl mb-8"
                >
                    A peaceful space to track your books, journals, goals, and personal reading journey — all in one place.
                </Motion.p>
                <Motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/auth")}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-full shadow hover:bg-indigo-700 transition"
                >
                    Get Started
                </Motion.button>
            </section>

            {/* Features */}
            <section className="px-6 py-16 bg-white">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
                    <FeatureCard
                        icon={<FaBookOpen className="text-3xl text-indigo-500" />}
                        title="Track Your Books"
                        text="Add books, mark progress, and organize your reading status with ease."
                    />
                    <FeatureCard
                        icon={<FaStar className="text-3xl text-yellow-500" />}
                        title="Rate and Reflect"
                        text="Use star ratings and journals to remember what you loved (or didn’t)."
                    />
                    <FeatureCard
                        icon={<FaRobot className="text-3xl text-green-500" />}
                        title="AI-Powered Suggestions"
                        text="Let our assistant help you discover your next favorite book."
                    />
                    <FeatureCard
                        icon={<FaFeatherAlt className="text-3xl text-rose-500" />}
                        title="Journaling and Goals"
                        text="Privately document your thoughts and set reading goals that matter to you."
                    />
                </div>
            </section>

            {/* Preview Your Library */}
            <section className="px-6 py-12 bg-amber-50 text-center">
                <h2 className="text-2xl font-bold mb-6">Start Building Your Library</h2>
                <div className="flex flex-wrap justify-center gap-4">
                    {dummyBooks.map((book, index) => (
                        <div key={index} className="scale-90 hover:scale-100 transition">
                            <PrivateBookCard book={book} onClick={() => { }} />
                        </div>
                    ))}
                </div>
                <p className="text-sm text-gray-500 mt-4 italic">
                    Sign in to start adding your own books
                </p>
            </section>

            {/* Final CTA */}
            <section className="px-6 py-16 text-center">
                <h3 className="text-3xl font-serif font-bold mb-4">Build your peaceful reading sanctuary</h3>
                <p className="mb-6">Log your journey, explore new reads, and grow your digital bookshelf — at your own pace.</p>
                <button
                    onClick={() => navigate("/auth")}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-full hover:bg-indigo-700 shadow"
                >
                    Join Now
                </button>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, text }) {
    return (
        <div className="bg-amber-50 p-6 rounded-lg shadow hover:shadow-md transition">
            <div className="mb-4">{icon}</div>
            <h4 className="text-xl font-semibold mb-2">{title}</h4>
            <p className="text-sm text-gray-600">{text}</p>
        </div>
    );
}
