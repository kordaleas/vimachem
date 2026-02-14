import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'movies',
    pathMatch: 'full',
  },
  {
    path: 'movies',
    loadComponent: () =>
      import('./features/movie-list/movie-list.component').then((m) => m.MovieListComponent),
  },
  {
    path: 'movies/:id',
    loadComponent: () =>
      import('./features/movie-detail/movie-detail.component').then((m) => m.MovieDetailComponent),
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./features/favorites/favorites.component').then((m) => m.FavoritesComponent),
  },
  {
    path: '**',
    redirectTo: 'movies',
  },
];
