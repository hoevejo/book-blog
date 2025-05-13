import { useState, useRef, useEffect } from "react";
import {
    FaChevronDown,
    FaChevronRight,
    FaEdit,
    FaTrash,
} from "react-icons/fa";
import BookCard from "./PrivateBookCard";

export default function PrivateLibraryShelf({
    title,
    books = [],
    categoryId,
    isCustom = false,
    onBookClick,
    onRenameCategory,
    onDeleteCategory,
    onViewAll,
    isOpen: controlledOpen,
    onToggleOpen,
    onDragStart,
    onDropCategory,
    onRemoveBook,
}) {
    const [isOpen, setIsOpen] = useState(true);
    const [isDraggingOverHeader, setIsDraggingOverHeader] = useState(false);
    const [editingTitle, setEditingTitle] = useState(false);
    const [tempTitle, setTempTitle] = useState(title);
    const inputRef = useRef(null);

    const openState = controlledOpen !== undefined ? controlledOpen : isOpen;

    useEffect(() => {
        if (editingTitle && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingTitle]);

    const handleToggle = () => {
        if (onToggleOpen) {
            onToggleOpen();
        } else {
            setIsOpen((prev) => !prev);
        }
    };

    const handleDragOverHeader = (e) => {
        e.preventDefault();
        setIsDraggingOverHeader(true);
    };

    const handleDragLeaveHeader = () => {
        setIsDraggingOverHeader(false);
    };

    const handleDropOnHeader = (e) => {
        e.preventDefault();
        setIsDraggingOverHeader(false);
        if (onDropCategory) {
            onDropCategory(categoryId);
        }
    };

    return (
        <section className="mb-6">
            <div
                className={`flex justify-between items-center cursor-pointer px-4 py-2 rounded-lg shadow-sm group transition-colors ${isDraggingOverHeader
                    ? "bg-indigo-100 border border-indigo-400"
                    : "bg-white"
                    }`}
                onClick={handleToggle}
                onDragOver={handleDragOverHeader}
                onDragLeave={handleDragLeaveHeader}
                onDrop={handleDropOnHeader}
            >
                <div className="flex items-center gap-2">
                    {openState ? <FaChevronDown /> : <FaChevronRight />}
                    {editingTitle ? (
                        <div className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                value={tempTitle}
                                onChange={(e) => setTempTitle(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        if (
                                            tempTitle.trim() &&
                                            tempTitle.trim() !== title.trim()
                                        ) {
                                            onRenameCategory?.(
                                                categoryId,
                                                tempTitle.trim()
                                            );
                                        }
                                        setEditingTitle(false);
                                    }
                                }}
                                className="border px-2 py-1 rounded text-sm"
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (
                                        tempTitle.trim() &&
                                        tempTitle.trim() !== title.trim()
                                    ) {
                                        onRenameCategory?.(
                                            categoryId,
                                            tempTitle.trim()
                                        );
                                    }
                                    setEditingTitle(false);
                                }}
                                className="text-sm bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                            >
                                Save
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setTempTitle(title);
                                    setEditingTitle(false);
                                }}
                                className="text-sm bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <h3 className="text-lg font-semibold text-indigo-700">
                            {title}{" "}
                            <span className="text-gray-500">
                                ({books.length})
                            </span>
                        </h3>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewAll();
                        }}
                        className="text-sm text-indigo-600 hover:underline"
                    >
                        View All
                    </button>

                    {isCustom && !editingTitle && (
                        <div className="flex items-center gap-2 opacity-20 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingTitle(true);
                                }}
                                title="Rename Category"
                                className="text-indigo-600 hover:text-indigo-800 hover:scale-110 transition-transform"
                            >
                                <FaEdit />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteCategory(categoryId);
                                }}
                                title="Delete Category"
                                className="text-red-500 hover:text-red-700 hover:scale-110 transition-transform"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {openState && (
                <div className="overflow-x-auto mt-3">
                    <div className="flex gap-4 pb-2 px-2">
                        {books.map((book) => (
                            <BookCard
                                key={book.id}
                                book={book}
                                onClick={() => onBookClick(book)}
                                draggable
                                onDragStart={() => onDragStart?.(book.id, categoryId || null)}
                                onRemove={
                                    onRemoveBook
                                        ? () => onRemoveBook(book.id)
                                        : undefined
                                }
                                currentCategoryId={categoryId}
                            />
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
