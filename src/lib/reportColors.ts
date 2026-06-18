/**
 * Shared 4-tier performance color utility aligned with PI buckets:
 *   Mastery ≥75  →  emerald
 *   Stable  ≥50  →  teal
 *   Reinforcement ≥35  →  amber
 *   At Risk <35  →  red
 */

export type PerformanceColors = {
  bg: string;       // solid bg (e.g. for circles)
  text: string;     // foreground text
  light: string;    // light bg surface
  badge: string;    // badge style
  border: string;   // left-border accent
};

export function getPerformanceColor(percentage: number): PerformanceColors {
  if (percentage >= 75) return {
    bg: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
    light: "bg-emerald-50 dark:bg-emerald-950/30",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    border: "border-l-emerald-500",
  };
  if (percentage >= 50) return {
    bg: "bg-teal-500",
    text: "text-teal-700 dark:text-teal-400",
    light: "bg-teal-50 dark:bg-teal-950/30",
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
    border: "border-l-teal-500",
  };
  if (percentage >= 35) return {
    bg: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400",
    light: "bg-amber-50 dark:bg-amber-950/30",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    border: "border-l-amber-500",
  };
  return {
    bg: "bg-red-500",
    text: "text-red-700 dark:text-red-400",
    light: "bg-red-50 dark:bg-red-950/30",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    border: "border-l-red-500",
  };
}

/** Maps a status label to its corresponding color tier */
export function getStatusColor(status: "strong" | "moderate" | "weak"): PerformanceColors {
  if (status === "strong") return getPerformanceColor(75);
  if (status === "moderate") return getPerformanceColor(50);
  return getPerformanceColor(0);
}

/**
 * Topic-heatmap colour on the topic status scale (strong ≥65 / moderate ≥40 / weak).
 * Distinct from getPerformanceColor (PI band scale 75/50/35) so a topic's colour
 * always matches its strong/moderate/weak label.
 */
export function getTopicColor(status: "strong" | "moderate" | "weak"): PerformanceColors {
  if (status === "strong") return getPerformanceColor(75);  // emerald
  if (status === "moderate") return getPerformanceColor(35); // amber
  return getPerformanceColor(0);                             // red
}

/** Neutral grey treatment for topics with no attempts (avgSuccessRate === null). */
export const NEUTRAL_TOPIC_COLORS: PerformanceColors = {
  bg: "bg-gray-400",
  text: "text-gray-500 dark:text-gray-400",
  light: "bg-gray-50 dark:bg-gray-900/30",
  badge: "bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400",
  border: "border-l-gray-300",
};
