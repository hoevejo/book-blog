import { useEffect, useState } from "react";
import {
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
} from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { useUser } from "../hooks/useUsers";
import { FaTrash } from "react-icons/fa";

export default function CategoryManager({ selectedCategories = [], setSelectedCategories }) {
    const { userProfile } = useUser();
    const [categories, setCategories] = useState([]);
    const [newCatName, setNewCatName] = useState("");

    useEffect(() => {
        if (!userProfile) return;
        const fetchCategories = async () => {
            const snapshot = await getDocs(collection(db, "users", userProfile.uid, "categories"));
            const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setCategories(list);
        };
        fetchCategories();
    }, [userProfile]);

    const toggleCategory = (id) => {
        if (selectedCategories.includes(id)) {
            setSelectedCategories(selectedCategories.filter((cat) => cat !== id));
        } else {
            setSelectedCategories([...selectedCategories, id]);
        }
    };

    const handleAddCategory = async () => {
        if (!newCatName.trim()) return;
        const newId = newCatName.toLowerCase().replace(/\s+/g, "-");
        const ref = doc(db, "users", userProfile.uid, "categories", newId);
        await setDoc(ref, { name: newCatName, bookIds: [] });
        setCategories([...categories, { id: newId, name: newCatName, bookIds: [] }]);
        setNewCatName("");
    };

    const handleDelete = async (id) => {
        const confirm = window.confirm("Delete this category?");
        if (!confirm) return;
        await deleteDoc(doc(db, "users", userProfile.uid, "categories", id));
        setCategories(categories.filter((cat) => cat.id !== id));
        setSelectedCategories(selectedCategories.filter((cat) => cat !== id));
    };

    return (
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold text-gray-700 mb-1">Assign Categories</h4>
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => {
                        const isSelected = selectedCategories.includes(cat.id);
                        return (
                            <button
                                key={cat.id}
                                onClick={() => toggleCategory(cat.id)}
                                className={`px-3 py-1 rounded-full text-sm border ${isSelected
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-100 text-gray-700"
                                    }`}
                            >
                                {cat.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex gap-2 items-center">
                <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="New category"
                    className="px-3 py-2 border rounded-md w-full"
                />
                <button
                    onClick={handleAddCategory}
                    className="bg-indigo-600 text-white px-3 py-2 rounded-md"
                >
                    Add
                </button>
            </div>

            <div>
                <h5 className="text-sm text-gray-500 mt-2">Manage Categories</h5>
                <ul className="text-sm text-gray-600 space-y-1 mt-1">
                    {categories.map((cat) => (
                        <li key={cat.id} className="flex justify-between items-center">
                            {cat.name}
                            <button
                                onClick={() => handleDelete(cat.id)}
                                className="text-red-500 hover:text-red-700"
                                title="Delete"
                            >
                                <FaTrash size={14} />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
