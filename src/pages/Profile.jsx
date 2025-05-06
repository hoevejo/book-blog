// src/pages/Profile.jsx

import { useState } from "react";
import Modal from "../components/Modal";
import AddBookForm from "../components/AddBookForm";

export default function Profile() {
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">My Profile</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                    ➕ Add Book
                </button>
            </div>

            {/* Insert other profile content here */}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                <AddBookForm />
            </Modal>
        </div>
    );
}