import { NextResponse } from "next/server";
import {
  buildFallbackBriefing,
  LENGTH_INSTRUCTIONS,
  parseBriefingResponse,
  type SourceArticle,
  VOICE_PROMPTS,
} from "@/lib/briefings";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const voice = profile?.voice || "professional";
    const summaryLength = profile?.summary_length || "medium";

    const { data: feeds, error: feedsError } = await supabase
      .from("feeds")
      .select("*")
      .eq("user_id", user.id);

    if (feedsError) {
      console.error("Database Error (Feeds):", feedsError.message);
    }

    const { data: bookmarks, error: bookmarksError } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .eq("processed", false);

    if (bookmarksError) {
      console.error("Database Error (Bookmarks):", bookmarksError.message);
    }

    const articles: SourceArticle[] = [];

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
              status: "active",
            })
            .eq("id", feed.id);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown feed error";
          console.error(`Status: Error fetching ${feed.url} -> ${message}`);

          await supabase
            .from("feeds")
            .update({
              status: "error",
              title: "Error: Could not reach feed",
            })
            .eq("id", feed.id);
        }
      }
    }

    if (bookmarks && bookmarks.length > 0) {
      for (const bookmark of bookmarks) {
        articles.push({
          title: bookmark.note || bookmark.url,
          content: bookmark.note || `Article from: ${bookmark.url}`,
          source: "Bookmarked",
          category: "Saved",
          url: bookmark.url,
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
          userId: user.id,
        },
      });
    }

    const articleList = articles
      .slice(0, 20)
      .map(
        (article, index) =>
          `[${index + 1}] Title: ${article.title}\nSource: ${article.source}\nCategory: ${article.category}\nContent: ${article.content.slice(0, 500)}\nURL: ${article.url}`
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

    const briefingContent =
      parseBriefingResponse(aiResponseText) ?? buildFallbackBriefing(articles);

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

    if (bookmarks && bookmarks.length > 0) {
      const bookmarkIds = bookmarks.map((bookmark) => bookmark.id);

      await supabase
        .from("bookmarks")
        .update({ processed: true })
        .in("id", bookmarkIds);
    }

    return NextResponse.json({
      message: "Briefing generated successfully.",
      items: briefingContent.length,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate briefing";

    console.error("API Error (Critical):", message);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
