import { computed, inject } from '@angular/core';
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
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { EMPTY, pipe, switchMap, tap } from 'rxjs';
import { Show } from '../../../core/models/show.model';
import { ShowService } from '../../../core/services/show.service';

const STORAGE_KEY = 'vm-show-list';
const BATCH_SIZE = 25;

interface ShowListState {
  shows: Show[];
  page: number;
  loading: boolean;
  searchQuery: string;
  hasMore: boolean;
  scrollPosition: number;
  displayLimit: number;
}

const initialState: ShowListState = {
  shows: [],
  page: 0,
  loading: false,
  searchQuery: '',
  hasMore: true,
  scrollPosition: 0,
  displayLimit: BATCH_SIZE,
};

export const ShowListStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    visibleShows: computed(() => store.shows().slice(0, store.displayLimit())),
    hasMoreVisible: computed(
      () => store.displayLimit() < store.shows().length || store.hasMore(),
    ),
  })),
  withMethods((store, showService = inject(ShowService)) => ({
    loadNextPage: rxMethod<void>(
      pipe(
        tap(() => {
          if (store.loading() || !store.hasMore()) return;
          patchState(store, { loading: true });
        }),
        switchMap(() => {
          if (!store.hasMore()) return EMPTY;
          const query = store.searchQuery();
          const page = store.page();

          const source$ = query
            ? showService.searchShows(query)
            : showService.getShows(page);

          return source$.pipe(
            tapResponse({
              next: (shows: Show[]) =>
                patchState(store, (state) => ({
                  shows: query ? shows : [...state.shows, ...shows],
                  page: query ? state.page : state.page + 1,
                  hasMore: query ? false : shows.length > 0,
                  loading: false,
                })),
              error: () => patchState(store, { loading: false }),
            }),
          );
        }),
      ),
    ),

    showMore(): void {
      patchState(store, (state) => ({
        displayLimit: state.displayLimit + BATCH_SIZE,
      }));
    },

    needsMoreData(): boolean {
      return store.displayLimit() >= store.shows().length && store.hasMore();
    },

    search(query: string): void {
      patchState(store, {
        searchQuery: query,
        shows: [],
        page: 0,
        hasMore: true,
        loading: false,
        displayLimit: BATCH_SIZE,
      });
    },

    updateShow(id: number, changes: Partial<Show>): void {
      patchState(store, (state) => ({
        shows: state.shows.map((s) => (s.id === id ? { ...s, ...changes } : s)),
      }));
    },

    deleteShow(id: number): void {
      patchState(store, (state) => ({
        shows: state.shows.filter((s) => s.id !== id),
      }));
    },

    saveScrollPosition(position: number): void {
      patchState(store, { scrollPosition: position });
    },

    reset(): void {
      patchState(store, initialState);
    },
  })),
  withHooks((store) => ({
    onInit() {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const { loading, displayLimit, ...parsed } =
            JSON.parse(saved) as ShowListState;
          patchState(store, parsed);
        } catch {
          /* ignore malformed data */
        }
      }

      effect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { loading, displayLimit, ...state } = getState(store);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      });
    },
  })),
);
