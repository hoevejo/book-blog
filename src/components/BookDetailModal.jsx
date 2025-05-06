// BookDetailModal.jsx
import { motion as Motion, AnimatePresence } from "framer-motion";
import ReactDOM from "react-dom";

export default function BookDetailModal({ isOpen, onClose, book }) {
    if (!isOpen || !book) return null;

    return ReactDOM.createPortal(
        <AnimatePresence>
            <Motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <Motion.div
                    className="bg-white w-full max-w-4xl h-[80vh] rounded-lg shadow-lg flex overflow-hidden"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 120 }}
                >
                    {/* Left Panel: Book Info */}
                    <div className="w-1/2 p-6 bg-gray-100 overflow-y-auto">
                        {book.cover && (
                            <img
                                src={book.cover}
                                alt={book.title}
                                className="w-full h-64 object-cover rounded mb-4"
                            />
                        )}
                        <h2 className="text-2xl font-bold mb-1">{book.title}</h2>
                        <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                        <p className="text-sm text-gray-800">{book.summary}</p>
                    </div>

                    {/* Right Panel: Review & Rating */}
                    <div className="w-1/2 p-6 overflow-y-auto">
                        {book.rating && (
                            <p className="text-lg font-semibold mb-2">Rating: {book.rating} / 5</p>
                        )}
                        {book.review && (
                            <>
                                <h3 className="text-md font-medium mb-1">Review</h3>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{book.review}</p>
                            </>
                        )}

                        {book.displayName && (
                            <div className="mt-6 flex items-center gap-2">
                                <img
                                    src={book.profilePicture || "/default-avatar.png"}
                                    alt={book.displayName}
                                    className="w-8 h-8 rounded-full border"
                                />
                                <span className="text-sm">{book.displayName}</span>
                            </div>
                        )}
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black p-2 rounded-full"
                    >
                        ✕
                    </button>
                </Motion.div>
            </Motion.div>
        </AnimatePresence>,
        document.body
    );
}
