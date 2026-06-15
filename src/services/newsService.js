const NEWS_API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY;

function normalizeArticleACB(article, index) {
  return {
    id: index,
    area: article.source?.name ?? "News",
    severity: "News",
    title: article.title ?? "",
    summary: article.description ?? "",
    publishedAt: article.publishedAt
      ? new Date(article.publishedAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
    url: article.url ?? null,
  };
}

export async function fetchNewsACB(query) {
  const url =
    "https://newsapi.org/v2/everything?" +
    new URLSearchParams({
      q: query,
      sortBy: "publishedAt",
      pageSize: 10,
      language: "en",
      apiKey: NEWS_API_KEY,
    });

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch news");
  }

  const data = await response.json();
  return (data.articles ?? []).map(normalizeArticleACB);
}
