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
  isActorSearch: boolean;
  hasMore: boolean;
  scrollPosition: number;
  displayLimit: number;
}

const initialState: ShowListState = {
  shows: [],
  page: 0,
  loading: false,
  isActorSearch: false,
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
          if (store.loading() || !store.hasMore() || store.isActorSearch()) return;
          patchState(store, { loading: true });
        }),
        switchMap(() => {
          if (!store.hasMore() || store.isActorSearch()) return EMPTY;
          return showService.getShows(store.page()).pipe(
            tapResponse({
              next: (shows: Show[]) =>
                patchState(store, (state) => ({
                  shows: [...state.shows, ...shows],
                  page: state.page + 1,
                  hasMore: shows.length > 0,
                  loading: false,
                })),
              error: () => patchState(store, { loading: false }),
            }),
          );
        }),
      ),
    ),

    loadShowsByActor: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { loading: true, shows: [], isActorSearch: true, hasMore: false, displayLimit: BATCH_SIZE })),
        switchMap((personId) =>
          showService.getPersonCastCredits(personId).pipe(
            tapResponse({
              next: (credits) => {
                const seen = new Set<number>();
                const shows: Show[] = [];
                for (const credit of credits) {
                  const show = credit._embedded.show;
                  if (!seen.has(show.id)) {
                    seen.add(show.id);
                    shows.push(show);
                  }
                }
                patchState(store, { shows, loading: false });
              },
              error: () => patchState(store, { loading: false }),
            }),
          ),
        ),
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

    clearSearch(): void {
      patchState(store, {
        shows: [],
        page: 0,
        hasMore: true,
        loading: false,
        isActorSearch: false,
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
          const { loading, displayLimit, isActorSearch, ...parsed } =
            JSON.parse(saved) as ShowListState;
          patchState(store, parsed);
        } catch {
          /* ignore malformed data */
        }
      }

      effect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { loading, displayLimit, isActorSearch, ...state } = getState(store);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      });
    },
  })),
);
