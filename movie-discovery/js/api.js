import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_URL, YOUTUBE_API_KEY, YOUTUBE_BASE_URL } from "./config.js";

function checkKey(key, service) {
  if (!key || key.includes("PASTE_YOUR")) {
    throw new Error(`Add your ${service} API key in js/config.js before using the app.`);
  }
}

async function request(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}). Please try again.`);
  }
  return response.json();
}

export async function getTrending() {
  checkKey(TMDB_API_KEY, "TMDB");
  return request(`${TMDB_BASE_URL}/trending/movie/week?api_key=${encodeURIComponent(TMDB_API_KEY)}`);
}

export async function getPopular(page = 1, sort = "popularity.desc", genre = "all") {
  checkKey(TMDB_API_KEY, "TMDB");
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: "en-US",
    sort_by: sort,
    page: String(page),
    include_adult: "false"
  });
  if (genre !== "all") params.set("with_genres", genre);
  return request(`${TMDB_BASE_URL}/discover/movie?${params}`);
}

export async function searchMovies(query, page = 1) {
  checkKey(TMDB_API_KEY, "TMDB");
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: "en-US",
    query,
    page: String(page),
    include_adult: "false"
  });
  return request(`${TMDB_BASE_URL}/search/movie?${params}`);
}

export async function getGenres() {
  checkKey(TMDB_API_KEY, "TMDB");
  return request(`${TMDB_BASE_URL}/genre/movie/list?api_key=${encodeURIComponent(TMDB_API_KEY)}&language=en-US`);
}

export async function getMovieDetails(id) {
  checkKey(TMDB_API_KEY, "TMDB");
  const params = new URLSearchParams({ api_key: TMDB_API_KEY, language: "en-US", append_to_response: "credits" });
  return request(`${TMDB_BASE_URL}/movie/${id}?${params}`);
}

export async function searchYouTubeTrailer(movieTitle) {
  checkKey(YOUTUBE_API_KEY, "YouTube");
  const params = new URLSearchParams({
    part: "snippet",
    q: `${movieTitle} official trailer`,
    type: "video",
    maxResults: "5",
    videoEmbeddable: "true",
    key: YOUTUBE_API_KEY
  });
  const data = await request(`${YOUTUBE_BASE_URL}/search?${params}`);
  return data.items?.find(item => /official trailer/i.test(item.snippet.title)) || data.items?.[0] || null;
}

export function posterUrl(path, size = "w500") {
  return path ? `${TMDB_IMAGE_URL}${size}${path}` : "assets/poster-placeholder.svg";
}
