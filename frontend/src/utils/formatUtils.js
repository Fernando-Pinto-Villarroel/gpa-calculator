export const formatUtils = {
  formatGPA(gpa, decimals = 2) {
    return Number(gpa).toFixed(decimals);
  },

  formatPercentage(value, decimals = 0) {
    return `${Number(value).toFixed(decimals)}%`;
  },

  formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },

  formatFileName(prefix, extension = "json") {
    const date = new Date().toISOString().split("T")[0];
    return `${prefix}-${date}.${extension}`;
  },

  truncateText(text, maxLength = 50) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
  },

  capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  pluralize(count, singular, plural = null) {
    if (count === 1) return singular;
    return plural || `${singular}s`;
  },
};
