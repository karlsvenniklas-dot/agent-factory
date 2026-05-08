// Fuzzy matching av gissningar mot låttitel + artister.
// Returnerar ett föreslaget poäng (0/1/2) som värden kan acceptera eller åsidosätta.

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // diakritiska tecken
    .replace(/\(.*?\)/g, " ") // ta bort parentes-innehåll
    .replace(/\[.*?\]/g, " ")
    .replace(/\b(feat|featuring|ft|with|prod|remastered|remaster|version|edit|radio|extended|live|acoustic|deluxe|mono|stereo)\b.*$/gi, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ") // ta bort skiljetecken
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) dp[j] = j;
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[b.length];
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const max = Math.max(a.length, b.length);
  if (max === 0) return 1;
  return 1 - levenshtein(a, b) / max;
}

export interface ScoreSuggestion {
  points: 0 | 1 | 2;
  matchedTitle: boolean;
  matchedArtist: boolean;
  reason: string;
}

export function suggestScore(
  guess: string,
  trackName: string,
  artists: string[],
): ScoreSuggestion {
  const g = normalize(guess);
  if (!g) return { points: 0, matchedTitle: false, matchedArtist: false, reason: "Tomt" };

  const title = normalize(trackName);
  const titleSim = similarity(g, title);
  const titleContains = title.includes(g) || g.includes(title);

  const artistSims = artists.map((a) => {
    const n = normalize(a);
    return { name: a, sim: similarity(g, n), contains: n.includes(g) || g.includes(n) };
  });
  const bestArtist = artistSims.reduce(
    (acc, cur) => (cur.sim > acc.sim ? cur : acc),
    { name: "", sim: 0, contains: false },
  );

  const matchedTitle = titleSim >= 0.8 || titleContains;
  const matchedArtist = bestArtist.sim >= 0.8 || bestArtist.contains;

  if (matchedTitle && matchedArtist) {
    return {
      points: 2,
      matchedTitle: true,
      matchedArtist: true,
      reason: "Titel + artist",
    };
  }
  if (matchedTitle) {
    return {
      points: 2,
      matchedTitle: true,
      matchedArtist: false,
      reason: "Rätt titel",
    };
  }
  if (matchedArtist) {
    return {
      points: 1,
      matchedTitle: false,
      matchedArtist: true,
      reason: `Rätt artist (${bestArtist.name})`,
    };
  }

  // Nära men inte i mål
  if (titleSim >= 0.6) {
    return {
      points: 1,
      matchedTitle: false,
      matchedArtist: false,
      reason: `Nära titeln (${Math.round(titleSim * 100)}%)`,
    };
  }
  if (bestArtist.sim >= 0.6) {
    return {
      points: 0,
      matchedTitle: false,
      matchedArtist: false,
      reason: `Nära artist men inte titel`,
    };
  }
  return { points: 0, matchedTitle: false, matchedArtist: false, reason: "Ingen träff" };
}
