// BookCard.jsx
import React from "react";

export default function BookCard({ book, onClick }) {
    const {
        title,
        author,
        cover,
        rating,
        displayName,
        profilePicture
    } = book;

    return (
        <div
            onClick={onClick}
            className="relative w-40 h-60 rounded-lg overflow-hidden shadow cursor-pointer group"
            style={{ backgroundImage: `url(${cover})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-200" />

            {/* Content */}
            <div className="absolute bottom-0 p-2 text-white text-sm w-full z-10">
                <h3 className="font-semibold truncate">{title}</h3>
                <p className="text-xs truncate">by {author}</p>
                {rating && (
                    <p className="text-xs mt-1">Rating: {rating} / 5</p>
                )}
                {displayName && (
                    <div className="flex items-center gap-1 mt-1">
                        <img
                            src={profilePicture || "/default-avatar.png"}
                            alt={displayName}
                            className="w-5 h-5 rounded-full border"
                        />
                        <span className="text-xs truncate">{displayName}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
