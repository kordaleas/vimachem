import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'shows',
    pathMatch: 'full',
  },
  {
    path: 'shows',
    loadComponent: () =>
      import('./features/show-list/show-list.component').then((m) => m.ShowListComponent),
  },
  {
    path: 'shows/:id',
    loadComponent: () =>
      import('./features/show-detail/show-detail.component').then((m) => m.ShowDetailComponent),
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./features/favorites/favorites.component').then((m) => m.FavoritesComponent),
  },
  {
    path: '**',
    redirectTo: 'shows',
  },
];
