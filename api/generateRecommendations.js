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
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://book-blog-rosy.vercel.app",
          "X-Title": "Book Blog",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo", // ✅ safer fallback model
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that gives 5 book recommendations. For each, respond in the format: Title by Author - One sentence summary.",
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
    console.log("💬 AI Response:", JSON.stringify(data, null, 2));

    const output = data?.choices?.[0]?.message?.content;

    if (!output) {
      return res.status(500).json({
        error: "No valid response from AI.",
        details: data,
      });
    }

    res.status(200).json({ result: output });
  } catch (err) {
    console.error("❌ API Error:", err);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
}
