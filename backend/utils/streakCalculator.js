const calculateStreaks = (texts) => {
  if (!texts || texts.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Extract unique dates from texts (normalize to YYYY-MM-DD, ignore time)
  const uniqueDates = [
    ...new Set(
      texts.map((t) => {
        const d = new Date(t.created_at);
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
      })
    )
  ].sort(); // ascending order

  // Calculate longest streak
  let longestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1]);
    const curr = new Date(uniqueDates[i]);
    const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 1;
    }
  }

  // Calculate current streak (must include today or yesterday)
  const today = new Date();
  const todayStr = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, '0')}-${String(today.getUTCDate()).padStart(2, '0')}`;

  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = `${yesterday.getUTCFullYear()}-${String(yesterday.getUTCMonth() + 1).padStart(2, '0')}-${String(yesterday.getUTCDate()).padStart(2, '0')}`;

  const lastDate = uniqueDates[uniqueDates.length - 1];

  // If last activity was not today or yesterday, streak is broken
  if (lastDate !== todayStr && lastDate !== yesterdayStr) {
    return { currentStreak: 0, longestStreak };
  }

  // Count backwards from last date
  let currentStreak = 1;
  for (let i = uniqueDates.length - 2; i >= 0; i--) {
    const curr = new Date(uniqueDates[i + 1]);
    const prev = new Date(uniqueDates[i]);
    const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  return { currentStreak, longestStreak };
};

module.exports = { calculateStreaks };