import RSSParser from "rss-parser";

const parser = new RSSParser();

const feeds = [
  {
    url: "https://bookriot.com/feed/",
    source: "Book Riot",
    category: "general",
  },
  { url: "https://www.tor.com/feed/", source: "Tor.com", category: "releases" },
  {
    url: "https://www.theguardian.com/books/rss",
    source: "The Guardian",
    category: "awards",
  },
];

import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}
const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const snapshot = await db.collection("news").get();
    const batchDelete = db.batch();
    snapshot.forEach((doc) => batchDelete.delete(doc.ref));
    await batchDelete.commit();

    const articles = [];
    for (const feed of feeds) {
      const parsed = await parser.parseURL(feed.url);
      for (const item of parsed.items.slice(0, 4)) {
        articles.push({
          title: item.title,
          summary: item.contentSnippet || item.content || "",
          url: item.link,
          image: item.enclosure?.url || null,
          publishedAt: item.isoDate || new Date().toISOString(),
          source: feed.source,
          category: feed.category,
        });
      }
    }

    const batchAdd = db.batch();
    for (const article of articles) {
      const id = encodeURIComponent(article.url);
      const ref = db.collection("news").doc(id);
      batchAdd.set(ref, article, { merge: true });
    }

    await batchAdd.commit();

    res.status(200).json({ success: true, count: articles.length });
  } catch (err) {
    console.error("❌ Fetch News Error:", err);
    res.status(500).json({ error: err.message });
  }
}
