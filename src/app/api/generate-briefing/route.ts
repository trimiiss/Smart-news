import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface Article {
  title: string;
  content: string;
  source: string;
  category: string;
  url: string;
}

const VOICE_PROMPTS: Record<string, string> = {
  casual:
    "Write in a casual, friendly tone — like you're texting a smart friend. Use contractions, simple language, and feel free to add a bit of humor.",
  professional:
    "Write in a clear, professional tone. Be direct, well-structured, and informative. Avoid slang.",
  witty:
    "Write with wit and personality. Use clever observations, analogies, and a touch of humor while keeping the information accurate.",
  tldr:
    "Be ultra-concise. Use bullet points. Each summary should be 1-2 lines max. No fluff, just the key takeaway.",
};

const LENGTH_INSTRUCTIONS: Record<string, string> = {
  short: "Keep each summary to 1-2 sentences.",
  medium: "Write 3-4 sentence summaries.",
  long: "Write a full paragraph summary with analysis.",
};

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const voice = profile?.voice || "professional";
    const summaryLength = profile?.summary_length || "medium";

    // Fetch user's feeds
    const { data: feeds, error: feedsError } = await supabase
      .from("feeds")
      .select("*")
      .eq("user_id", user.id);
    
    if (feedsError) console.error("Database Error (Feeds):", feedsError.message);

    // Fetch user's unprocessed bookmarks
    const { data: bookmarks, error: bookmarksError } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id);

    if (bookmarksError) console.error("Database Error (Bookmarks):", bookmarksError.message);

    // Collect content from RSS feeds
    const articles: Article[] = [];

    if (feeds && feeds.length > 0) {
      const Parser = (await import("rss-parser")).default;
      const parser = new Parser({
        timeout: 10000,
        headers: {
          "User-Agent": "SmartNewsCurator/1.0",
        },
      });

      for (const feed of feeds) {
        try {
          const parsed = await parser.parseURL(feed.url);
          const items = (parsed.items || []).slice(0, 5);

          for (const item of items) {
            articles.push({
              title: item.title || "Untitled",
              content: item.contentSnippet || item.content || "",
              source: parsed.title || feed.title || feed.url,
              category: feed.category || "General",
              url: item.link || "",
            });
          }

          await supabase
            .from("feeds")
            .update({ 
              last_fetched: new Date().toISOString(), 
              status: "active" 
            })
            .eq("id", feed.id);
        } catch (err: any) {
          // Only log actual failures to the terminal
          console.error(`Status: Error fetching ${feed.url} -> ${err.message}`);
          await supabase
            .from("feeds")
            .update({ 
              status: "error",
              title: `Error: Could not reach feed`
            })
            .eq("id", feed.id);
        }
      }
    }

    if (bookmarks && bookmarks.length > 0) {
      for (const bm of bookmarks) {
        articles.push({
          title: bm.note || bm.url,
          content: bm.note || `Article from: ${bm.url}`,
          source: "Bookmarked",
          category: "Saved",
          url: bm.url,
        });
      }
    }

    if (articles.length === 0) {
      return NextResponse.json({ 
        message: "No content to summarize", 
        items: 0,
        debug: {
          feedsCount: feeds?.length || 0,
          bookmarksCount: bookmarks?.length || 0,
          userId: user.id
        }
      });
    }

    const articleList = articles
      .slice(0, 20)
      .map(
        (a, i) =>
          `[${i + 1}] Title: ${a.title}\nSource: ${a.source}\nCategory: ${a.category}\nContent: ${a.content.slice(0, 500)}\nURL: ${a.url}`
      )
      .join("\n\n");

    const systemPromptText = `You are a personal news curator AI. Your job is to create a daily news briefing.

${VOICE_PROMPTS[voice] || VOICE_PROMPTS.professional}
${LENGTH_INSTRUCTIONS[summaryLength] || LENGTH_INSTRUCTIONS.medium}

Summarize articles. Return a JSON array where each item has:
- "title": a headline
- "summary": the summary
- "source": the source name
- "category": the category
- "url": the original URL

Return ONLY the JSON array, no other text.`;

    const { generateText } = await import("ai");
    const { groq } = await import("@ai-sdk/groq");

    const combinedPrompt = `${systemPromptText}\n\nToday's headlines to summarize:\n\n${articleList}`;

    const { text: aiResponseText } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: combinedPrompt,
    });

    console.log("Groq AI response received, length:", aiResponseText.length);

    // Parse JSON
    let briefingContent: any[] = [];
    try {
      const jsonMatch = aiResponseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
          briefingContent = JSON.parse(jsonMatch[0]);
      } else {
          briefingContent = JSON.parse(aiResponseText);
      }
    } catch (err) {
      console.error("JSON Parsing Error:", err, "Response was:", aiResponseText);
      briefingContent = articles.slice(0, 10).map(a => ({
        title: a.title,
        summary: a.content.slice(0, 200),
        source: a.source,
        category: a.category,
        url: a.url
      }));
    }

    // Store in Supabase
    const today = new Date().toISOString().split("T")[0];
    const { error: upsertError } = await supabase.from("briefings").upsert(
      {
        user_id: user.id,
        date: today,
        content: briefingContent,
      },
      { onConflict: "user_id,date" }
    );

    if (upsertError) {
      console.error("Database Error (Storage):", upsertError.message);
      throw new Error(`Database error: ${upsertError.message}`);
    }

    // Mark bookmarks as processed
    if (bookmarks && bookmarks.length > 0) {
      const bookmarkIds = bookmarks.map((b) => b.id);
      await supabase
        .from("bookmarks")
        .update({ processed: true })
        .in("id", bookmarkIds);
    }

    return NextResponse.json({
      message: "Briefing generated successfully",
      items: briefingContent.length,
    });
  } catch (error: any) {
    console.error("API Error (Critical):", error.message);
    return NextResponse.json(
      { error: error?.message || "Failed to generate briefing" },
      { status: 500 }
    );
  }
}
