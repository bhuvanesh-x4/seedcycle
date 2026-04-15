export const POINTS = {
  LISTING_CREATE: 10,
  EXCHANGE_APPROVE: 30,
  FEED_POST: 5
};

export function computeBadges(user) {
  const badges = [];

  if (user.points >= 200) {
    badges.push({ key: "TOP_CONTRIBUTOR", label: "Top Contributor" });
  }
  if ((user.exchangesCompleted || 0) >= 5) {
    badges.push({ key: "SEED_GIVER", label: "Seed Giver" });
  }

  // Ensure unique by key (keep existing earnedAt when possible)
  const existing = new Map((user.badges || []).map(b => [b.key, b]));
  const merged = badges.map(b => existing.get(b.key) || { ...b, earnedAt: new Date() });
  return merged;
}
