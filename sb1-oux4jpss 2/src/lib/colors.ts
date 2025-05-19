// Base colors for predefined categories
export const baseColors = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#a4de6c",
  "#d0ed57", "#ff9e9d", "#6c757d", "#ff6b6b", "#4ecdc4", "#45b7d1",
  "#96ceb4", "#ffeead", "#d4a5a5"
];

// Additional colors for custom categories
export const fallbackColors = [
  "#ff9f43", "#6ab04c", "#eb4d4b", "#4834d4", "#1dd1a1",
  "#feca57", "#54a0ff", "#00d2d3", "#ff5e57", "#576574"
];

// Get category colors
export const getCategoryColors = (customCategoriesCount: number): string[] => [
  ...baseColors,
  ...fallbackColors.slice(0, customCategoriesCount)
];