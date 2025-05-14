import { useState, useEffect } from "react";

const promptTypes = [
    { id: "new", label: "🆕 New Books" },
    { id: "theme", label: "🌟 Popular in a Theme" },
    { id: "similar", label: "📚 Similar to a Book/Series" },
    { id: "custom", label: "✍️ Custom Prompt" },
];

export default function DiscoveryPage() {
    const [selectedType, setSelectedType] = useState("new");
    const [userInput, setUserInput] = useState("");
    const [recommendations, setRecommendations] = useState([]);
    const [cachedPrompt, setCachedPrompt] = useState(null);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("discoveryCache"));
        if (stored && Date.now() - stored.timestamp < 24 * 60 * 60 * 1000) {
            setRecommendations(stored.results || []);
            setCachedPrompt(stored.promptSummary || "");
        }
    }, []);

    const handleGenerate = async () => {
        const promptText = buildPrompt(selectedType, userInput);

        try {
            const res = await fetch("/api/generateRecommendations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: promptText }),
            });

            const data = await res.json();

            if (!res.ok || !data.result) {
                throw new Error(data.error || "AI did not return a valid result.");
            }

            const parsed = parseAIResponse(data.result);
            const cache = {
                promptSummary: promptText,
                results: parsed,
                timestamp: Date.now(),
            };
            localStorage.setItem("discoveryCache", JSON.stringify(cache));
            setRecommendations(parsed);
            setCachedPrompt(promptText);
        } catch (err) {
            console.error("❌ Recommendation error:", err);
            alert("Something went wrong: " + err.message);
        }
    };

    const buildPrompt = (type, input) => {
        switch (type) {
            case "new":
                return "List 5 recently released books with title, author, and a short summary.";
            case "theme":
                return `Recommend 5 popular books in the theme "${input}".`;
            case "similar":
                return `What are 5 books similar to "${input}"?`;
            case "custom":
                return input;
            default:
                return "Recommend some books.";
        }
    };

    const parseAIResponse = (text) => {
        const lines = text.split("\n").filter((line) => line.trim());
        const books = [];

        for (let line of lines) {
            const match = line.match(/^\d+\.\s*(.*?)\s+by\s+(.*?)\s*[-–]\s*(.*)$/i);
            if (match) {
                books.push({
                    title: match[1].trim(),
                    author: match[2].trim(),
                    summary: match[3].trim(),
                });
            }
        }

        return books;
    };

    const needsInput =
        selectedType === "theme" ||
        selectedType === "similar" ||
        selectedType === "custom";

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-10 px-4">
            <div className="max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        📖 Discover Your Next Read
                    </h1>
                    <p className="text-gray-600">
                        Use our AI assistant to get personalized book recommendations based on your interests.
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {promptTypes.map((pt) => (
                            <button
                                key={pt.id}
                                className={`px-3 py-2 rounded border text-sm ${selectedType === pt.id
                                    ? "bg-indigo-600 text-white"
                                    : "bg-white text-gray-700 border-gray-300"
                                    }`}
                                onClick={() => {
                                    setSelectedType(pt.id);
                                    setUserInput("");
                                }}
                            >
                                {pt.label}
                            </button>
                        ))}
                    </div>

                    {needsInput && (
                        <input
                            type="text"
                            placeholder={
                                selectedType === "theme"
                                    ? "e.g. cozy fantasy"
                                    : selectedType === "similar"
                                        ? "e.g. Mistborn"
                                        : "Write anything you want..."
                            }
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            className="w-full border px-4 py-2 rounded"
                        />
                    )}

                    <button
                        onClick={handleGenerate}
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
                    >
                        Generate Recommendations
                    </button>
                </div>

                {cachedPrompt && (
                    <div className="text-sm text-gray-500 italic">
                        Showing cached results from your last prompt: "{cachedPrompt}"
                    </div>
                )}

                <div className="space-y-4">
                    {recommendations.map((rec, idx) => (
                        <div key={idx} className="bg-white border rounded-lg shadow p-4">
                            <h3 className="text-lg font-semibold text-gray-800">{rec.title}</h3>
                            <p className="text-sm text-gray-600 italic">by {rec.author}</p>
                            <p className="text-sm mt-2 text-gray-700">{rec.summary}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
