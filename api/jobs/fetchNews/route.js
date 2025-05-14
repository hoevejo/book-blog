// app/api/jobs/fetchNews/route.js

import { NextResponse } from "next/server";
import RSSParser from "rss-parser";
import { db } from "@/lib/firebaseAdmin"; // your Firebase Admin SDK init

const parser = new RSSParser();

// Book news RSS feeds
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

export async function GET() {
  try {
    // 1. Clear existing articles
    const snapshot = await db.collection("news").get();
    const batchDelete = db.batch();
    snapshot.forEach((doc) => batchDelete.delete(doc.ref));
    await batchDelete.commit();

    // 2. Fetch new articles
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

    // 3. Store new articles
    const batchAdd = db.batch();
    for (const article of articles) {
      const id = encodeURIComponent(article.url); // unique ID
      const ref = db.collection("news").doc(id);
      batchAdd.set(ref, article, { merge: true });
    }

    await batchAdd.commit();

    return NextResponse.json({ success: true, count: articles.length });
  } catch (err) {
    console.error("❌ Fetch News Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
