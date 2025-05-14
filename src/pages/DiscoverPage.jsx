import { useState, useEffect } from "react";

const promptTypes = [
    { id: "new", label: "🆕 New Books" },
    { id: "theme", label: "🌟 Popular in a Theme" },
    { id: "similar", label: "📚 Similar to a Book/Series" },
    { id: "custom", label: "✍️ Custom Prompt" },
];

const HISTORY_KEY = "discoveryHistory";

export default function DiscoveryPage() {
    const [selectedType, setSelectedType] = useState("new");
    const [userInput, setUserInput] = useState("");
    const [recommendations, setRecommendations] = useState([]);
    const [customRawOutput, setCustomRawOutput] = useState(null);
    const [cachedPrompt, setCachedPrompt] = useState(null);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        const recentHistory = cleanOldHistory();
        setHistory(recentHistory);

        if (recentHistory.length && Date.now() - recentHistory[0].timestamp < 24 * 60 * 60 * 1000) {
            setCachedPrompt(recentHistory[0].promptSummary);
            setRecommendations(recentHistory[0].results || []);
            setCustomRawOutput(recentHistory[0].type === "custom" ? recentHistory[0].raw : null);
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

            const resultEntry = {
                promptSummary: promptText,
                type: selectedType,
                raw: data.result,
                results: selectedType === "custom" ? null : parseAIResponse(data.result),
                timestamp: Date.now(),
            };

            const newHistory = [resultEntry, ...history].slice(0, 10);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
            setHistory(newHistory);

            setCachedPrompt(promptText);
            setRecommendations(resultEntry.results || []);
            setCustomRawOutput(selectedType === "custom" ? data.result : null);
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
    const cleanOldHistory = () => {
        const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
        const cutoff = Date.now() - 36 * 60 * 60 * 1000; // 36 hours in ms
        const filtered = history.filter(entry => entry.timestamp >= cutoff);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
        return filtered;
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

                    <button
                        onClick={() => setShowHistory((prev) => !prev)}
                        className="text-indigo-600 underline text-sm"
                    >
                        {showHistory ? "Hide Prompt History" : "Show Prompt History"}
                    </button>
                </div>

                {cachedPrompt && (
                    <div className="text-sm text-gray-500 italic">
                        Showing results for: "{cachedPrompt}"
                    </div>
                )}

                {showHistory && (
                    <div className="space-y-4 mt-4">
                        {history.map((entry, idx) => (
                            <div
                                key={idx}
                                className="p-4 border rounded bg-white cursor-pointer hover:bg-gray-50"
                                onClick={() => {
                                    setCachedPrompt(entry.promptSummary);
                                    setRecommendations(entry.results || []);
                                    setCustomRawOutput(entry.type === "custom" ? entry.raw : null);
                                }}
                            >
                                <p className="text-sm text-gray-700 mb-1 font-medium">
                                    {entry.promptSummary}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {new Date(entry.timestamp).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="space-y-4">
                    {customRawOutput ? (
                        <pre className="whitespace-pre-wrap bg-white border rounded-lg shadow p-4 text-sm text-gray-800">
                            {customRawOutput}
                        </pre>
                    ) : (
                        recommendations.map((rec, idx) => (
                            <div key={idx} className="bg-white border rounded-lg shadow p-4">
                                <h3 className="text-lg font-semibold text-gray-800">{rec.title}</h3>
                                <p className="text-sm text-gray-600 italic">by {rec.author}</p>
                                <p className="text-sm mt-2 text-gray-700">{rec.summary}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
