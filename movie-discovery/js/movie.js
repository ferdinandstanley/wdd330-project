import { posterUrl } from "./api.js";
import { escapeHtml, isFavorite, toggleFavorite } from "./utils.js";

export function movieCard(movie, options = {}) {
  const title = escapeHtml(movie.title || movie.name || "Untitled");
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "N/A";
  const rating = Number.isFinite(movie.vote_average) ? movie.vote_average.toFixed(1) : "N/A";
  const image = posterUrl(movie.poster_path);
  const saved = isFavorite(movie.id);
  const compact = options.compact ? " movie-card--compact" : "";

  return `
    <article class="movie-card${compact}">
      <a href="details.html?id=${movie.id}" aria-label="View details for ${title}">
        <img class="movie-poster" src="${image}" alt="Poster for ${title}" loading="lazy">
      </a>
      <div class="movie-card-content">
        <h3 class="movie-title">${title}</h3>
        <div class="movie-meta"><span>${year}</span><span class="movie-rating">★ ${rating}</span></div>
        <div class="movie-actions">
          <a class="card-link" href="details.html?id=${movie.id}">Details</a>
          <button class="favorite-button ${saved ? "saved" : ""}" data-favorite-id="${movie.id}" aria-label="${saved ? "Remove" : "Add"} ${title} ${saved ? "from" : "to"} favorites">${saved ? "♥ Saved" : "♡ Save"}</button>
        </div>
      </div>
    </article>`;
}

export function bindFavoriteButtons(root = document) {
  root.querySelectorAll("[data-favorite-id]").forEach(button => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.favoriteId);
      const card = button.closest(".movie-card");
      const title = card?.querySelector(".movie-title")?.textContent || "Movie";
      const image = card?.querySelector(".movie-poster")?.getAttribute("src") || "";
      const year = card?.querySelector(".movie-meta span")?.textContent || "";
      const ratingText = card?.querySelector(".movie-rating")?.textContent?.replace("★", "").trim() || "0";
      toggleFavorite({ id, title, poster_path: image.includes("/w500") ? image.split("/w500")[1] : null, release_date: year.length === 4 ? `${year}-01-01` : "", vote_average: Number(ratingText) || 0 });
      const saved = isFavorite(id);
      button.classList.toggle("saved", saved);
      button.textContent = saved ? "♥ Saved" : "♡ Save";
      button.setAttribute("aria-label", `${saved ? "Remove" : "Add"} ${title} ${saved ? "from" : "to"} favorites`);
    });
  });
}
