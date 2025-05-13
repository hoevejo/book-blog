import React from "react";
import Swal from "sweetalert2";
import { useLocation } from "react-router-dom";

export default function PrivateBookCard({
    book,
    onClick,
    draggable = false,
    onDragStart,
    onRemove, // optional
    currentCategoryId, // optional — passed from PrivateLibraryShelf
}) {
    const { title, author, cover, rating, status } = book;
    const location = useLocation();

    const handleRemove = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onRemove) {
            onRemove(book.id);
        }
    };

    const showRemove =
        typeof onRemove === "function" &&
        (location.pathname.startsWith("/library") ||
            location.pathname.startsWith("/library/category"));

    return (
        <div
            onClick={(e) => {
                if (e.defaultPrevented) return;
                onClick?.();
            }}
            draggable={draggable}
            onDragStart={(e) => {
                e.stopPropagation();
                onDragStart?.(book.id, currentCategoryId || null);
            }}
            onDragEnd={() => {
                if (typeof window !== "undefined") {
                    const event = new CustomEvent("book-drag-end");
                    window.dispatchEvent(event);
                }
            }}
            className={`relative w-40 h-60 rounded-lg overflow-hidden shadow cursor-pointer group select-none ${draggable ? "hover:opacity-90 active:opacity-70" : ""}`}
            style={{
                backgroundImage: `url(${cover})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* Red X Button (optional) */}
            {showRemove && (
                <button
                    onClick={handleRemove}
                    className="absolute top-1 right-1 z-20 text-red-500 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow hover:text-red-700"
                    title="Remove"
                >
                    ❌
                </button>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/60 transition-all duration-200 pointer-events-none" />

            {/* Text Content */}
            <div className="absolute bottom-0 w-full p-2 z-10 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-sm rounded-md px-2 py-1 text-white text-sm">
                    <h3 className="font-semibold truncate">{title}</h3>
                    <p className="text-xs truncate">by {author}</p>
                    <p className="text-xs mt-1">Status: {status}</p>
                    {status === "completed" && rating && (
                        <p className="text-xs">Rating: {rating} / 5</p>
                    )}
                </div>
            </div>
        </div>
    );
}
