import { useEffect, useState } from "react";
import Modal from "./Modal";
import Swal from "sweetalert2";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import Rating from "react-rating";
import Select from "react-select";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";

export default function BookEditModal({
    isOpen,
    onClose,
    book,
    userId,
    onSave,
    categories = {},
}) {
    const [status, setStatus] = useState("to-read");
    const [rating, setRating] = useState(0);
    const [selectedCategories, setSelectedCategories] = useState([]);

    useEffect(() => {
        if (book) {
            setStatus(book.status || "to-read");
            setRating(book.rating || 0);
            setSelectedCategories(book.categories || []);
        }
    }, [book]);

    if (!book) return null;

    const handleSave = async () => {
        const bookRef = doc(db, "users", userId, "books", book.id);
        await updateDoc(bookRef, {
            status,
            rating,
            categories: selectedCategories,
        });
        onSave();
        onClose();
    };

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: "Delete Book?",
            text: "This will permanently remove the book from your library.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#e3342f",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            const bookRef = doc(db, "users", userId, "books", book.id);
            await deleteDoc(bookRef);
            onSave();
            onClose();
        }
    };

    const categoryOptions = Object.entries(categories).map(([id, cat]) => ({
        value: id,
        label: cat.name,
    }));

    const selectedCategoryOptions = categoryOptions.filter((opt) =>
        selectedCategories.includes(opt.value)
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-4 space-y-4 max-w-md w-full">
                {/* Header */}
                <div className="flex gap-4 items-center">
                    {book.cover && (
                        <img
                            src={book.cover}
                            alt={book.title}
                            className="w-16 h-24 object-cover rounded shadow"
                        />
                    )}
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-gray-800">{book.title}</h2>
                        <p className="text-sm text-gray-600 italic">by {book.author}</p>
                    </div>
                </div>

                {/* Categories (moved above status) */}
                {categoryOptions.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Categories</label>
                        <Select
                            isMulti
                            options={categoryOptions}
                            value={selectedCategoryOptions}
                            onChange={(selected) =>
                                setSelectedCategories(selected.map((opt) => opt.value))
                            }
                            className="react-select-container"
                            classNamePrefix="react-select"
                            placeholder="Select categories..."
                        />
                    </div>
                )}

                {/* Status */}
                <div>
                    <label className="block text-sm font-medium mt-2">Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full border px-3 py-2 rounded-md"
                    >
                        <option value="to-read">To Read</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                {/* Rating (only if completed) */}
                {status === "completed" && (
                    <div>
                        <label className="block text-sm font-medium">Rating</label>
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
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-6">
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Save Changes
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                    </div>

                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </Modal>
    );
}
