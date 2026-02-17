import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FavoritesComponent } from './favorites.component';
import { ShowListStore } from '../show-list/store/show-list.store';
import { ShowService } from '../../core/services/show.service';
import { Show } from '../../core/models/show.model';

function mockShow(overrides: Partial<Show> = {}): Show {
  return {
    id: 1,
    name: 'Favorite Show',
    type: 'Scripted',
    language: 'English',
    genres: ['Drama'],
    status: 'Running',
    runtime: 60,
    premiered: '2020-01-01',
    ended: null,
    rating: { average: 8.0 },
    image: null,
    summary: null,
    network: null,
    isFavorite: true,
    ...overrides,
  };
}

describe('FavoritesComponent', () => {
  let showServiceSpy: jasmine.SpyObj<ShowService>;

  function setup(storeShows: Show[] = []) {
    showServiceSpy = jasmine.createSpyObj('ShowService', ['getShows', 'getShowById', 'searchPeople', 'getPersonCastCredits']);
    showServiceSpy.getShows.and.returnValue(of([]));

    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [FavoritesComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: ShowService, useValue: showServiceSpy },
      ],
    });

    if (storeShows.length > 0) {
      const store = TestBed.inject(ShowListStore);
      showServiceSpy.getShows.and.returnValue(of(storeShows));
      store.loadNextPage();
    }

    const fixture = TestBed.createComponent(FavoritesComponent);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('should show empty state when no favorites', () => {
    const fixture = setup();
    const el = fixture.nativeElement;

    expect(el.querySelector('.empty-state')).toBeTruthy();
    expect(el.textContent).toContain('You have no favorites yet');
  });

  it('should show Browse Shows button in empty state', () => {
    const fixture = setup();
    const el = fixture.nativeElement;
    const btn = el.querySelector('.empty-state p-button');
    expect(btn).toBeTruthy();
  });

  it('should render show cards when favorites exist', () => {
    const shows = [
      mockShow({ id: 1, isFavorite: true }),
      mockShow({ id: 2, isFavorite: true }),
      mockShow({ id: 3, isFavorite: false }),
    ];
    const fixture = setup(shows);
    const cards = fixture.nativeElement.querySelectorAll('app-show-card');
    expect(cards.length).toBe(2); // only favorites
  });

  it('should display correct count text', () => {
    const fixture = setup([mockShow({ id: 1, isFavorite: true })]);
    expect(fixture.nativeElement.querySelector('.count')?.textContent).toContain('1 show');
  });

  it('should display plural count for multiple favorites', () => {
    const shows = [
      mockShow({ id: 1, isFavorite: true }),
      mockShow({ id: 2, isFavorite: true }),
    ];
    const fixture = setup(shows);
    expect(fixture.nativeElement.querySelector('.count')?.textContent).toContain('2 shows');
  });

  it('goBack should navigate to /shows', () => {
    const fixture = setup();
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture.componentInstance.goBack();

    expect(router.navigate).toHaveBeenCalledWith(['/shows']);
  });
});
