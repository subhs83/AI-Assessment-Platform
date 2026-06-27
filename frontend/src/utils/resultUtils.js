export const getPerformanceTheme = (percentage) => {
  if (percentage >= 90) {
    return {
      text: "text-amber-500",
      ring: "#f59e0b",
      label: "🏆 Outstanding Performance",
    };
  }

  if (percentage >= 75) {
    return {
      text: "text-green-600",
      ring: "#16a34a",
      label: "🎉 Excellent Performance",
    };
  }

  if (percentage >= 50) {
    return {
      text: "text-blue-600",
      ring: "#2563eb",
      label: "👍 Good Performance",
    };
  }

  return {
    text: "text-red-600",
    ring: "#dc2626",
    label: "📘 Keep Practicing",
  };
};

export const getAchievementText = (percentage, percentile) => {
  if (percentage >= 90) {
    return `🏆 Outstanding! You performed better than ${percentile}% of participants.`;
  }

  if (percentage >= 75) {
    return `🎉 Excellent! You performed better than ${percentile}% of participants.`;
  }

  if (percentage >= 50) {
    return `👍 Good! You performed better than ${percentile}% of participants.`;
  }

  return `📘 Keep Practicing! You performed better than ${percentile}% of participants.`;
};