import { movieCard, bindFavoriteButtons } from "./movie.js";
import { escapeHtml } from "./utils.js";

export function renderMovies(container, movies, emptyMessage = "No movies found.") {
  if (!movies?.length) {
    container.innerHTML = `<p class="empty">${escapeHtml(emptyMessage)}</p>`;
    return;
  }
  container.innerHTML = movies.map(movie => movieCard(movie)).join("");
  bindFavoriteButtons(container);
}

export function showError(container, error) {
  container.innerHTML = `<div class="error" role="alert">${escapeHtml(error.message || "Something went wrong.")}</div>`;
}

export function setStatus(element, message) {
  if (element) element.textContent = message;
}
