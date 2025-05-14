// /api/generateRecommendations.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { prompt } = req.body;

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          // eslint-disable-next-line no-undef
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://book-blog-rosy.vercel.app/", // Replace with your site
          "X-Title": "Book Blog", // Friendly site name for OpenRouter
        },
        body: JSON.stringify({
          model: "openai/gpt-4o", // Upgraded model
          messages: [
            {
              role: "system",
              content:
                "You're a helpful book recommendation assistant. Respond with a list of exactly 5 books. Each should include a title, author, and a one-sentence summary.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const output = data.choices?.[0]?.message?.content;

    if (!output) {
      return res.status(500).json({ error: "No valid response from AI." });
    }

    res.status(200).json({ result: output });
  } catch (err) {
    console.error("AI request failed:", err);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
}
