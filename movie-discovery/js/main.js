import { getTrending, getPopular, searchMovies, getGenres, getMovieDetails, searchYouTubeTrailer, posterUrl } from "./api.js";
import { getParam, getFavorites, toggleFavorite, isFavorite, formatDate, formatRuntime, escapeHtml } from "./utils.js";
import { renderMovies, showError, setStatus } from "./ui.js";
import { initNavigation } from "./navigation.js";

document.querySelectorAll("[data-year]").forEach(element => { element.textContent = new Date().getFullYear(); });
initNavigation();

const page = document.body.dataset.page;

if (page === "home") initHome();
if (page === "movies") initMovies();
if (page === "details") initDetails();
if (page === "favorites") initFavorites();

function handleError(container, error) {
  console.error(error);
  showError(container, error);
}

async function initHome() {
  const trendingGrid = document.querySelector("#trending-grid");
  const popularGrid = document.querySelector("#popular-grid");
  try {
    const [trending, popular] = await Promise.all([getTrending(), getPopular()]);
    renderMovies(trendingGrid, trending.results.slice(0, 6));
    renderMovies(popularGrid, popular.results.slice(0, 9));
  } catch (error) {
    handleError(trendingGrid, error);
    handleError(popularGrid, error);
  }

  document.querySelector("#home-search-form")?.addEventListener("submit", event => {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get("query")?.trim();
    if (query) window.location.href = `movies.html?search=${encodeURIComponent(query)}`;
  });
}

async function initMovies() {
  const grid = document.querySelector("#movies-grid");
  const status = document.querySelector("#browse-status");
  const title = document.querySelector("#browse-title");
  const genreSelect = document.querySelector("#genre-select");
  const sortSelect = document.querySelector("#sort-select");
  const searchForm = document.querySelector("#browse-search-form");
  const searchInput = document.querySelector("#browse-search");
  const pagination = document.querySelector("#pagination");

  try {
    const genreData = await getGenres();
    genreSelect.innerHTML += genreData.genres.map(genre => `<option value="${genre.id}">${escapeHtml(genre.name)}</option>`).join("");
  } catch (error) {
    console.error(error);
  }

  const params = new URLSearchParams(window.location.search);
  let currentPage = Number(params.get("page")) || 1;
  let searchQuery = params.get("search") || "";
  let mode = params.get("mode") || "";
  let genre = params.get("genre") || "all";

  searchInput.value = searchQuery;
  genreSelect.value = genre;

  async function loadMovies() {
    grid.innerHTML = `<div class="loading">Loading movies...</div>`;
    setStatus(status, "Loading movie results...");
    try {
      let data;
      if (searchQuery) {
        title.textContent = `Search Results for "${searchQuery}"`;
        data = await searchMovies(searchQuery, currentPage);
      } else if (mode === "trending") {
        title.textContent = "Trending Movies";
        data = await getTrending();
      } else {
        title.textContent = genre !== "all" ? `${genreSelect.options[genreSelect.selectedIndex]?.text || "Genre"} Movies` : "Explore Movies";
        data = await getPopular(currentPage, sortSelect.value, genre);
      }
      renderMovies(grid, data.results || []);
      setStatus(status, `${data.total_results ?? data.results?.length ?? 0} results found.`);
      renderPagination(data.total_pages || 1, currentPage, pagination, page => {
        currentPage = page;
        loadMovies();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    } catch (error) {
      handleError(grid, error);
      setStatus(status, "");
    }
  }

  searchForm.addEventListener("submit", event => {
    event.preventDefault();
    searchQuery = searchInput.value.trim();
    currentPage = 1;
    mode = "";
    loadMovies();
  });
  genreSelect.addEventListener("change", () => { genre = genreSelect.value; searchQuery = ""; currentPage = 1; loadMovies(); });
  sortSelect.addEventListener("change", () => { if (!searchQuery && mode !== "trending") { currentPage = 1; loadMovies(); } });

  loadMovies();
}

function renderPagination(totalPages, currentPage, container, onPage) {
  container.innerHTML = "";
  if (totalPages <= 1) return;
  const maxPage = Math.min(totalPages, 500);
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(maxPage, currentPage + 2);
  for (let page = start; page <= end; page += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = page;
    if (page === currentPage) button.setAttribute("aria-current", "page");
    button.addEventListener("click", () => onPage(page));
    container.append(button);
  }
}

async function initDetails() {
  const id = getParam("id");
  const status = document.querySelector("#details-status");
  const article = document.querySelector("#movie-details");
  if (!id) {
    setStatus(status, "No movie was selected.");
    return;
  }

  try {
    const movie = await getMovieDetails(id);
    setStatus(status, "");
    document.title = `${movie.title} | Movie Discover`;
    article.innerHTML = buildDetails(movie);
    bindDetails(movie);
    await loadTrailer(movie.title);
  } catch (error) {
    handleError(article, error);
    setStatus(status, "");
  }
}

function buildDetails(movie) {
  const title = escapeHtml(movie.title);
  const genres = (movie.genres || []).map(g => g.name).join(" • ");
  const saved = isFavorite(movie.id);
  const backdrop = movie.backdrop_path ? posterUrl(movie.backdrop_path, "original") : "";
  return `
    <section class="details-hero" style="background-image:url('${backdrop}')">
      <div class="details-overlay"></div>
      <div class="container details-content">
        <img class="details-poster" src="${posterUrl(movie.poster_path, "w500")}" alt="Poster for ${title}">
        <div class="details-info">
          <p class="eyebrow">${genres || "MOVIE"}</p>
          <h1>${title}</h1>
          <p class="details-tagline">${escapeHtml(movie.tagline || "")}</p>
          <div class="detail-stats">
            <span class="stat">${movie.release_date?.slice(0,4) || "N/A"}</span>
            <span class="stat">★ ${Number(movie.vote_average || 0).toFixed(1)}</span>
            <span class="stat">${formatRuntime(movie.runtime)}</span>
          </div>
          <p class="details-overview">${escapeHtml(movie.overview || "No overview is available.")}</p>
          <div class="detail-buttons">
            <button id="detail-favorite" class="primary-action" type="button">${saved ? "♥ Remove Favorite" : "♡ Add to Favorites"}</button>
            <a href="#trailer">Watch Trailer</a>
          </div>
        </div>
      </div>
    </section>
    <section class="details-section container">
      <div class="section-heading"><h2>Trailer</h2><span id="trailer-status" class="status"></span></div>
      <div id="trailer"></div>
    </section>
    <section class="details-section container">
      <div class="section-heading"><h2>Cast</h2></div>
      <div class="cast-grid">
        ${(movie.credits?.cast || []).slice(0, 6).map(person => `
          <div class="cast-card">
            <img src="${person.profile_path ? posterUrl(person.profile_path, "w185") : "assets/poster-placeholder.svg"}" alt="Photo of ${escapeHtml(person.name)}" loading="lazy">
            <p><strong>${escapeHtml(person.name)}</strong><br><span>${escapeHtml(person.character || "")}</span></p>
          </div>`).join("")}
      </div>
    </section>
    <section class="details-section container">
      <h2>Movie Information</h2>
      <p class="status">Release date: ${formatDate(movie.release_date)} · Original language: ${escapeHtml((movie.original_language || "").toUpperCase())} · Vote count: ${movie.vote_count || 0}</p>
    </section>`;
}

function bindDetails(movie) {
  const button = document.querySelector("#detail-favorite");
  button?.addEventListener("click", () => {
    toggleFavorite({ id: movie.id, title: movie.title, poster_path: movie.poster_path, release_date: movie.release_date, vote_average: movie.vote_average });
    const saved = isFavorite(movie.id);
    button.textContent = saved ? "♥ Remove Favorite" : "♡ Add to Favorites";
  });
}

async function loadTrailer(title) {
  const trailer = document.querySelector("#trailer");
  const status = document.querySelector("#trailer-status");
  try {
    const result = await searchYouTubeTrailer(title);
    if (!result) {
      setStatus(status, "No embeddable trailer found.");
      trailer.innerHTML = `<p class="empty">Try searching YouTube for the movie title and "official trailer."</p>`;
      return;
    }
    const videoId = result.id.videoId;
    trailer.innerHTML = `<iframe class="trailer-frame" src="https://www.youtube.com/embed/${encodeURIComponent(videoId)}" title="${escapeHtml(result.snippet.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
    setStatus(status, "");
  } catch (error) {
    setStatus(status, "Trailer unavailable.");
    console.error(error);
  }
}

function initFavorites() {
  const grid = document.querySelector("#favorites-grid");
  const favorites = getFavorites();
  renderMovies(grid, favorites, "You have not saved any favorites yet.");
}
