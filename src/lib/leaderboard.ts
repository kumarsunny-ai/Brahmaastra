/* ─── Leaderboard Service ───
 * Local-first implementation using localStorage.
 * Structured for easy backend migration — replace these functions
 * with API calls when a backend is connected.
 */

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  date: string; // ISO string
}

const STORAGE_KEY = "gilliPanda_leaderboard";
const MAX_ENTRIES = 10;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Get all leaderboard entries, sorted by score descending */
export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const entries: LeaderboardEntry[] = JSON.parse(raw);
    return entries.sort((a, b) => b.score - a.score).slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

/** Check if a score qualifies for the leaderboard */
export function qualifiesForLeaderboard(score: number): boolean {
  if (score <= 0) return false;
  const entries = getLeaderboard();
  if (entries.length < MAX_ENTRIES) return true;
  return score > entries[entries.length - 1].score;
}

/** Add a new entry to the leaderboard. Returns the updated list. */
export function addLeaderboardEntry(playerName: string, score: number): LeaderboardEntry[] {
  const entries = getLeaderboard();
  const newEntry: LeaderboardEntry = {
    id: generateId(),
    playerName: playerName.trim() || "Anonymous",
    score,
    date: new Date().toISOString(),
  };
  entries.push(newEntry);
  entries.sort((a, b) => b.score - a.score);
  const trimmed = entries.slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  return trimmed;
}

/** Clear the entire leaderboard */
export function clearLeaderboard(): void {
  localStorage.removeItem(STORAGE_KEY);
}
