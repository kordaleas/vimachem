import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ShowListStore } from './show-list.store';
import { ShowService } from '../../../core/services/show.service';
import { Show, CastCredit } from '../../../core/models/show.model';

function mockShow(overrides: Partial<Show> = {}): Show {
  return {
    id: 1,
    name: 'Test Show',
    type: 'Scripted',
    language: 'English',
    genres: ['Drama'],
    status: 'Running',
    runtime: 60,
    premiered: '2020-01-01',
    ended: null,
    rating: { average: 7.5 },
    image: null,
    summary: 'A test show',
    network: null,
    isFavorite: false,
    ...overrides,
  };
}

describe('ShowListStore', () => {
  let store: InstanceType<typeof ShowListStore>;
  let showServiceSpy: jasmine.SpyObj<ShowService>;

  beforeEach(() => {
    localStorage.clear();

    showServiceSpy = jasmine.createSpyObj('ShowService', [
      'getShows',
      'getShowById',
      'searchPeople',
      'getPersonCastCredits',
    ]);
    showServiceSpy.getShows.and.returnValue(of([]));

    TestBed.configureTestingModule({
      providers: [{ provide: ShowService, useValue: showServiceSpy }],
    });

    store = TestBed.inject(ShowListStore);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('toggleFavorite', () => {
    it('should mark a show as favorite', () => {
      // Seed shows via loadNextPage
      const shows = [mockShow({ id: 1 }), mockShow({ id: 2 })];
      showServiceSpy.getShows.and.returnValue(of(shows));
      store.loadNextPage();

      store.toggleFavorite(1);

      expect(store.favoriteShows().length).toBe(1);
      expect(store.favoriteShows()[0].id).toBe(1);
      expect(store.favoriteCount()).toBe(1);
    });

    it('should unfavorite when toggled twice', () => {
      const shows = [mockShow({ id: 1 })];
      showServiceSpy.getShows.and.returnValue(of(shows));
      store.loadNextPage();

      store.toggleFavorite(1);
      store.toggleFavorite(1);

      expect(store.favoriteShows().length).toBe(0);
      expect(store.favoriteCount()).toBe(0);
    });
  });

  describe('updateShow', () => {
    it('should merge partial changes into the correct show', () => {
      const shows = [mockShow({ id: 1, name: 'Original' }), mockShow({ id: 2, name: 'Other' })];
      showServiceSpy.getShows.and.returnValue(of(shows));
      store.loadNextPage();

      store.updateShow(1, { name: 'Updated' });

      expect(store.shows().find((s) => s.id === 1)?.name).toBe('Updated');
      expect(store.shows().find((s) => s.id === 2)?.name).toBe('Other');
    });
  });

  describe('deleteShow', () => {
    it('should remove the show from the list', () => {
      const shows = [mockShow({ id: 1 }), mockShow({ id: 2 })];
      showServiceSpy.getShows.and.returnValue(of(shows));
      store.loadNextPage();

      store.deleteShow(1);

      expect(store.shows().length).toBe(1);
      expect(store.shows()[0].id).toBe(2);
    });
  });

  describe('showMore', () => {
    it('should increment displayLimit by 25', () => {
      const initialLimit = store.displayLimit();
      store.showMore();
      expect(store.displayLimit()).toBe(initialLimit + 25);
    });
  });

  describe('visibleShows', () => {
    it('should return shows up to displayLimit', () => {
      const shows = Array.from({ length: 50 }, (_, i) => mockShow({ id: i + 1, name: `Show ${i + 1}` }));
      showServiceSpy.getShows.and.returnValue(of(shows));
      store.loadNextPage();

      // Default displayLimit is 25
      expect(store.visibleShows().length).toBe(25);

      store.showMore();
      expect(store.visibleShows().length).toBe(50);
    });
  });

  describe('needsMoreData', () => {
    it('should return true when displayLimit >= shows.length and hasMore', () => {
      const shows = Array.from({ length: 10 }, (_, i) => mockShow({ id: i + 1 }));
      showServiceSpy.getShows.and.returnValue(of(shows));
      store.loadNextPage();

      // displayLimit=25 >= 10 shows, hasMore=true (shows.length > 0)
      expect(store.needsMoreData()).toBeTrue();
    });

    it('should return false during actor search', () => {
      const shows = Array.from({ length: 10 }, (_, i) => mockShow({ id: i + 1 }));
      showServiceSpy.getShows.and.returnValue(of(shows));
      store.loadNextPage();

      // Simulate actor search
      const credits: CastCredit[] = [];
      showServiceSpy.getPersonCastCredits.and.returnValue(of(credits));
      store.loadShowsByActor({ personId: 1, person: { id: 1, name: 'Actor', image: null } });

      expect(store.needsMoreData()).toBeFalse();
    });
  });

  describe('clearSearch', () => {
    it('should reset actor search state', () => {
      showServiceSpy.getPersonCastCredits.and.returnValue(of([]));
      store.loadShowsByActor({ personId: 1, person: { id: 1, name: 'Actor', image: null } });

      store.clearSearch();

      expect(store.isActorSearch()).toBeFalse();
      expect(store.selectedActor()).toBeNull();
      expect(store.actorShows().length).toBe(0);
    });
  });

  describe('saveScrollPosition', () => {
    it('should store the scroll position', () => {
      store.saveScrollPosition(500);
      expect(store.scrollPosition()).toBe(500);
    });
  });

  describe('reset', () => {
    it('should return to initial state', () => {
      const shows = [mockShow({ id: 1 })];
      showServiceSpy.getShows.and.returnValue(of(shows));
      store.loadNextPage();
      store.toggleFavorite(1);

      store.reset();

      expect(store.shows().length).toBe(0);
      expect(store.favoriteCount()).toBe(0);
      expect(store.scrollPosition()).toBe(0);
    });
  });

  describe('localStorage persistence', () => {
    it('should rehydrate shows from localStorage on init', () => {
      const savedState = {
        shows: [mockShow({ id: 99, name: 'Persisted Show' })],
        page: 3,
        hasMore: true,
        scrollPosition: 200,
      };
      localStorage.setItem('vm-show-list', JSON.stringify(savedState));

      // Re-create the store to trigger onInit
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: ShowService, useValue: showServiceSpy }],
      });
      const freshStore = TestBed.inject(ShowListStore);

      expect(freshStore.shows().length).toBe(1);
      expect(freshStore.shows()[0].name).toBe('Persisted Show');
      expect(freshStore.scrollPosition()).toBe(200);
    });

    it('should not crash on malformed localStorage data', () => {
      localStorage.setItem('vm-show-list', '{invalid json!!!');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: ShowService, useValue: showServiceSpy }],
      });
      const freshStore = TestBed.inject(ShowListStore);

      expect(freshStore.shows().length).toBe(0);
    });
  });

  describe('loadNextPage', () => {
    it('should fetch shows and append to state', () => {
      const page0Shows = [mockShow({ id: 1 }), mockShow({ id: 2 })];
      showServiceSpy.getShows.and.returnValue(of(page0Shows));

      store.loadNextPage();

      expect(showServiceSpy.getShows).toHaveBeenCalledWith(0);
      expect(store.shows().length).toBe(2);
      expect(store.page()).toBe(1);
    });

    it('should set hasMore to false when API returns empty array', () => {
      showServiceSpy.getShows.and.returnValue(of([]));

      store.loadNextPage();

      expect(store.hasMore()).toBeFalse();
    });
  });

  describe('loadShowsByActor', () => {
    it('should deduplicate shows from cast credits', () => {
      const show1 = mockShow({ id: 10, name: 'Show A' });
      const show2 = mockShow({ id: 20, name: 'Show B' });
      const credits: CastCredit[] = [
        { _embedded: { show: show1, character: { id: 1, name: 'Char1', image: null } } },
        { _embedded: { show: show1, character: { id: 2, name: 'Char2', image: null } } }, // duplicate show
        { _embedded: { show: show2, character: { id: 3, name: 'Char3', image: null } } },
      ];
      showServiceSpy.getPersonCastCredits.and.returnValue(of(credits));

      store.loadShowsByActor({ personId: 5, person: { id: 5, name: 'Actor', image: null } });

      expect(store.actorShows().length).toBe(2);
      expect(store.isActorSearch()).toBeTrue();
      expect(store.selectedActor()?.name).toBe('Actor');
    });
  });
});
