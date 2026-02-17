import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ShowDetailComponent } from './show-detail.component';
import { ShowService } from '../../core/services/show.service';
import { ShowListStore } from '../show-list/store/show-list.store';
import { Show } from '../../core/models/show.model';

function mockShow(overrides: Partial<Show> = {}): Show {
  return {
    id: 42,
    name: 'Test Show',
    type: 'Scripted',
    language: 'English',
    genres: ['Drama'],
    status: 'Running',
    runtime: 60,
    premiered: '2020-01-01',
    ended: null,
    rating: { average: 8.0 },
    image: null,
    summary: '<p>A <b>test</b> show.</p>',
    network: { id: 1, name: 'HBO' },
    ...overrides,
  };
}

describe('ShowDetailComponent', () => {
  let showServiceSpy: jasmine.SpyObj<ShowService>;
  let locationSpy: jasmine.SpyObj<Location>;

  function configure(routeId: string) {
    showServiceSpy = jasmine.createSpyObj('ShowService', ['getShowById', 'getShows', 'searchPeople', 'getPersonCastCredits']);
    showServiceSpy.getShows.and.returnValue(of([]));
    showServiceSpy.getShowById.and.returnValue(of(mockShow()));
    locationSpy = jasmine.createSpyObj('Location', ['back']);

    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [ShowDetailComponent, NoopAnimationsModule],
      providers: [
        { provide: ShowService, useValue: showServiceSpy },
        { provide: Location, useValue: locationSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: new Map([['id', routeId]]) } },
        },
      ],
    });
  }

  function seedStore(shows: Show[]) {
    const store = TestBed.inject(ShowListStore);
    showServiceSpy.getShows.and.returnValue(of(shows));
    store.loadNextPage();
  }

  function createComponent() {
    const fixture = TestBed.createComponent(ShowDetailComponent);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('should render show details when found in store', () => {
    configure('42');
    seedStore([mockShow({ id: 42, name: 'Store Show' })]);
    const fixture = createComponent();

    expect(fixture.nativeElement.querySelector('.detail-title')?.textContent).toContain('Store Show');
    expect(showServiceSpy.getShowById).not.toHaveBeenCalled();
  });

  it('should fetch from API when show not in store', () => {
    configure('99');
    showServiceSpy.getShowById.and.returnValue(of(mockShow({ id: 99, name: 'API Show' })));
    const fixture = createComponent();

    expect(showServiceSpy.getShowById).toHaveBeenCalledWith(99);
    expect(fixture.nativeElement.querySelector('.detail-title')?.textContent).toContain('API Show');
  });

  it('should show error on API failure', () => {
    configure('99');
    showServiceSpy.getShowById.and.returnValue(throwError(() => new Error('fail')));
    const fixture = createComponent();

    expect(fixture.nativeElement.querySelector('.detail-error p')?.textContent).toContain('Failed to load');
  });

  it('should render network, premiered, runtime, and rating', () => {
    configure('42');
    seedStore([mockShow({ 
      id: 42, network: { id: 1, name: 'HBO' }, premiered: '2020-01-01', 
      runtime: 60, rating: { average: 8.5 } })]);
    const fixture = createComponent();
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('HBO');
    expect(text).toContain('2020-01-01');
    expect(text).toContain('60 min');
    expect(text).toContain('8.5');
  });

  it('stripHtml should remove HTML tags', () => {
    configure('42');
    seedStore([mockShow({ id: 42 })]);
    const fixture = createComponent();

    expect(fixture.componentInstance.stripHtml('<p>Hello <b>World</b></p>')).toBe('Hello World');
    expect(fixture.componentInstance.stripHtml(null)).toBe('');
  });

  it('goBack should call location.back', () => {
    configure('42');
    seedStore([mockShow({ id: 42 })]);
    const fixture = createComponent();

    fixture.componentInstance.goBack();
    expect(locationSpy.back).toHaveBeenCalled();
  });
});
