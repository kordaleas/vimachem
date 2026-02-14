import { effect } from '@angular/core';
import {
  getState,
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { computed } from '@angular/core';
import { Show } from '../../../core/models/show.model';

const STORAGE_KEY = 'vm-favorites';

interface FavoritesState {
  favorites: Show[];
}

const initialState: FavoritesState = {
  favorites: [],
};

export const FavoritesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    favoriteIds: computed(() => new Set(store.favorites().map((s) => s.id))),
    count: computed(() => store.favorites().length),
  })),
  withMethods((store) => ({
    addFavorite(show: Show): void {
      if (store.favoriteIds().has(show.id)) return;
      patchState(store, (state) => ({ favorites: [...state.favorites, show] }));
    },

    removeFavorite(id: number): void {
      patchState(store, (state) => ({
        favorites: state.favorites.filter((s) => s.id !== id),
      }));
    },

    isFavorite(id: number): boolean {
      return store.favoriteIds().has(id);
    },

    toggleFavorite(show: Show): void {
      if (store.favoriteIds().has(show.id)) {
        patchState(store, (state) => ({
          favorites: state.favorites.filter((s) => s.id !== show.id),
        }));
      } else {
        patchState(store, (state) => ({ favorites: [...state.favorites, show] }));
      }
    },
  })),
  withHooks((store) => ({
    onInit() {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          patchState(store, JSON.parse(saved) as FavoritesState);
        } catch {
          /* ignore malformed data */
        }
      }

      effect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(getState(store)));
      });
    },
  })),
);
