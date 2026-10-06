# Movie Discover

A responsive Movie Discovery & Recommendation web app built with **HTML, CSS, and vanilla JavaScript** for WDD330 Web Development II.

## APIs

1. **TMDB API** – movie search, trending/popular movies, genres, ratings, posters, details, and cast.
2. **YouTube Data API v3** – official movie trailer search.

OpenWeatherMap is not used.

## Features

- Search movies by title
- Trending movies
- Popular movies
- Genre filtering
- Sorting by popularity, title, rating, and release date
- Movie details
- YouTube trailer search and embedded trailer
- Favorite movies with localStorage
- Responsive mobile/desktop navigation
- Loading and error states
- CSS animations
- Semantic HTML and accessibility-friendly controls

## Setup

1. Copy the project folder into VS Code.
2. Copy `js/config.example.js` to `js/config.js`.
3. Open `js/config.js` and replace the two placeholder values with your TMDB and YouTube API keys.
4. Use the VS Code Live Server extension or another local web server.
5. Open `index.html` through the local server, not directly as a `file://` URL.

## API key note

The browser must receive the API keys to call the APIs directly, so deployed browser code can expose them. Restrict the keys in their provider dashboards and do not use privileged server-side credentials. The included GitHub Pages workflow keeps the keys out of the Git repository by reading GitHub Actions secrets.

## GitHub Pages

The included `.github/workflows/pages.yml` deploys the site automatically when you push to `main`.

In your GitHub repository, add these Actions secrets:

- `TMDB_API_KEY`
- `YOUTUBE_API_KEY`

Then enable GitHub Pages using **GitHub Actions** as the source. The workflow creates `js/config.js` during deployment.

## Credits

Movie data and images are provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.
