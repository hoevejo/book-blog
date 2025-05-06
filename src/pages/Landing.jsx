// LandingPage.jsx
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { FaStar, FaFeatherAlt, FaBookReader, FaRobot } from "react-icons/fa";
import React from "react";
export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="w-full min-h-screen bg-gradient-to-b from-amber-50 to-white text-gray-800">
            {/* Hero Section */}
            <section className="px-6 py-20 text-center max-w-4xl mx-auto">
                <Motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl md:text-6xl font-serif font-bold mb-4"
                >
                    Discover, Review, and Share the Books You Love
                </Motion.h1>
                <Motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-lg md:text-xl mb-8"
                >
                    Book Blog is your cozy space to keep track of your reads, find new favorites, and connect through stories.
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

            {/* Features Section */}
            <section className="px-6 py-16 bg-white">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
                    <FeatureCard
                        icon={<FaFeatherAlt className="text-3xl text-rose-500" />}
                        title="Add and Review Books"
                        text="Easily track what you're reading and share your thoughts with rich reviews and star ratings."
                    />
                    <FeatureCard
                        icon={<FaRobot className="text-3xl text-green-500" />}
                        title="Smart Recommendations"
                        text="Tell us what you like, and our AI assistant will recommend titles tailored to your tastes."
                    />
                    <FeatureCard
                        icon={<FaBookReader className="text-3xl text-indigo-600" />}
                        title="Explore Book Feeds"
                        text="See what others are reading, upvote reviews, and find hidden gems shared by the community."
                    />
                    <FeatureCard
                        icon={<FaStar className="text-3xl text-yellow-500" />}
                        title="Personal Collections"
                        text="Organize to-read lists, maintain journals, and create a reading legacy you can reflect on."
                    />
                </div>
            </section>

            {/* Preview Feed Section */}
            <section className="px-6 py-12 bg-amber-50 text-center">
                <h2 className="text-2xl font-bold mb-6">A Peek Into Book Blog</h2>
                <div className="flex flex-wrap justify-center gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="w-60 h-80 bg-white border border-gray-200 rounded-lg shadow p-4 text-left relative overflow-hidden"
                        >
                            <div className="h-40 bg-gray-100 rounded mb-4 animate-pulse" />
                            <p className="font-semibold">Example Book Title {i}</p>
                            <p className="text-sm text-gray-500 mb-2">Author Name</p>
                            <p className="text-xs text-gray-400 italic">Sign in to see more</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Final Call to Action */}
            <section className="px-6 py-16 text-center">
                <h3 className="text-3xl font-serif font-bold mb-4">Ready to join the cozy reading community?</h3>
                <p className="mb-6">Sign in to start adding books, writing reviews, and exploring new reads with ease.</p>
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
