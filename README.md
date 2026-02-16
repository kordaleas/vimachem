# Vimachem - TV Show Browser

An Angular 21 TV show browser application built with NgRx SignalStore, PrimeNG, and the TVMaze API. Browse TV shows with infinite scrolling, search actor to retrieve their info and credits, manage favorites, and edit/delete entries -- all persisted across page refreshes via LocalStorage.

## How to Run

### Option 1: Run locally

#### Prerequisites

- Node.js 22+
- npm 11+

```bash
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

### Option 2: Run with Docker

```bash
docker build -t vimachem .
docker run -p 8080:80 vimachem
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### Running Tests

```bash
npm test
```

## Architecture Overview

### Tech Stack

| Technology | Purpose |
|---|---|
| Angular 21 | Framework (standalone components, zoneless change detection) |
| NgRx SignalStore | State management per feature domain |
| PrimeNG (Aura) | UI component library |
| RxJS | HTTP calls and reactive patterns |
| Karma / Jasmine | Unit testing |
| TVMaze API | Data source (`https://api.tvmaze.com`) |

### Project Structure

```
src/app/
  core/
    interceptors/       # errorInterceptor — catches HTTP errors, shows PrimeNG Toast
    models/             # Show, ShowSearchResult, Person, CastCredit interfaces
    services/           # ShowService — TVMaze API wrapper
  features/
    movie-list/
      components/       # ShowCard, ActorShowCard, SearchBar, EditDialog
      store/            # ShowListStore (shows, favorites, scroll, pagination)
      movie-list.component.ts
    movie-detail/
      movie-detail.component.ts
    favorites/
      favorites.component.ts
  app.config.ts         # Zoneless CD, router, HTTP interceptors, PrimeNG theme
  app.routes.ts         # Lazy-loaded routes: /movies, /movies/:id, /favorites
```

### Routing

All feature routes are lazy-loaded via `loadComponent`:

| Route | Component | Description |
|---|---|---|
| `/movies` | MovieListComponent | Infinite-scroll show list with search, edit, delete |
| `/movies/:id` | MovieDetailComponent | Show detail page |
| `/favorites` | FavoritesComponent | User's favorite shows |

### State Management

A single **ShowListStore** (NgRx SignalStore, `providedIn: 'root'`) manages all application state:

- **Shows list** — paginated data fetched from TVMaze (`GET /shows?page=N`)
- **Favorites** — stored as an `isFavorite` flag on each show; exposed via `favoriteShows` computed signal
- **Scroll position** — saved on navigation, restored on return
- **Actor search** — separate mode fetching cast credits from TVMaze people API

### Key Features

**Infinite Scroll** — Two-tier approach using `IntersectionObserver`. A display window (`displayLimit`) grows by 25 items at a time. When the display window catches up with fetched data, the next API page (~250 shows) is loaded automatically.

**Search** — Server-side actor search via the TVMaze people API that fetches cast credits and displays their shows.

**Edit & Delete** — Inline editing via a PrimeNG Dialog component; deletion with a PrimeNG ConfirmDialog. Both operations update the store and persist to LocalStorage.

**Favorites** — Toggle favorite status on any show. Favorites are accessible on a dedicated `/favorites` route and persist across sessions.

**Scroll Restoration** — Scroll position is captured on `NavigationStart` and restored via `afterNextRender` when navigating back from detail or favorites pages.

**LocalStorage Persistence** — The store's `withHooks` + `effect()` pattern writes state to LocalStorage (key: `vm-show-list`) on every change, excluding transient fields like loading state. On init, persisted data is restored so the user sees their previous session's data immediately.

**Error Handling** — A functional `HttpInterceptor` catches all `HttpErrorResponse` errors and displays them as PrimeNG Toast notifications with status code and message.

## Decisions and Trade-offs

### Single Store vs. Multiple Stores

Favorites are co-located in `ShowListStore` rather than a separate `FavoritesStore`. Since favorites are just a boolean flag on shows, a separate store would introduce unnecessary synchronization between two stores. The trade-off is a slightly larger store, but it avoids cross-store data consistency issues.

### Display Window (Virtual Scroll)

Instead of using a virtual scroll library, a simple `displayLimit` counter controls how many items render. This is lighter than a full virtual scroll implementation and works well with the card grid layout. The trade-off is that all rendered items remain in the DOM, but with batches of 25 cards this stays performant.

### Zoneless Change Detection

The app uses `provideZonelessChangeDetection()` instead of Zone.js. Combined with signals and OnPush components, this eliminates unnecessary change detection cycles and reduces bundle size. This is forward-looking as Angular moves toward a zoneless future.

### LocalStorage over IndexedDB

LocalStorage was chosen for persistence for simplicity — the data fits well within the ~5MB limit and the synchronous API simplifies store initialization. IndexedDB would be needed if the dataset grew significantly larger.

### Multi-stage Docker Build

The Dockerfile uses a two-stage build (Node for compilation, nginx for serving) to keep the production image minimal. The nginx config handles SPA routing with `try_files` fallback to `index.html` and sets long cache headers for static assets.