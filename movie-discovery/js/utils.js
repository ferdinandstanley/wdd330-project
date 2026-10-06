export function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

export function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

export function formatDate(dateString) {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function formatRuntime(minutes) {
  if (!minutes) return "Runtime unavailable";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours ? `${hours}h ${mins}m` : `${mins}m`;
}

export function getFavorites() {
  try { return JSON.parse(localStorage.getItem("movieDiscoverFavorites")) || []; }
  catch { return []; }
}

export function saveFavorites(favorites) {
  localStorage.setItem("movieDiscoverFavorites", JSON.stringify(favorites));
}

export function toggleFavorite(movie) {
  const favorites = getFavorites();
  const index = favorites.findIndex(item => item.id === movie.id);
  if (index >= 0) favorites.splice(index, 1);
  else favorites.push(movie);
  saveFavorites(favorites);
  return favorites;
}

export function isFavorite(id) {
  return getFavorites().some(movie => movie.id === id);
}

export function posterFallback(path) {
  return path || "assets/poster-placeholder.svg";
}
