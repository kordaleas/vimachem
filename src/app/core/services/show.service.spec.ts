import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ShowService } from './show.service';
import { Show, PersonSearchResult, CastCredit } from '../models/show.model';

describe('ShowService', () => {
  let service: ShowService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ShowService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('getShows should call GET /shows?page=N', () => {
    const mockShows: Show[] = [
      { id: 1, name: 'Show 1', type: 'Scripted', language: 'English', genres: [], status: 'Running', 
        runtime: 60, premiered: null, ended: null, rating: { average: null }, image: null, 
        summary: null, network: null 
      },
    ];

    service.getShows(2).subscribe((shows) => {
      expect(shows).toEqual(mockShows);
    });

    const req = httpTesting.expectOne('https://api.tvmaze.com/shows?page=2');
    expect(req.request.method).toBe('GET');
    req.flush(mockShows);
  });

  it('getShowById should call GET /shows/:id', () => {
    const mockShow: Show = { 
      id: 42, name: 'Test Show', type: 'Scripted', language: 'English', 
      genres: ['Drama'], status: 'Ended', runtime: 30, premiered: '2020-01-01', 
      ended: '2021-01-01', rating: { average: 8.5 }, image: null, summary: 'A test show', network: null 
    };

    service.getShowById(42).subscribe((show) => {
      expect(show).toEqual(mockShow);
    });

    const req = httpTesting.expectOne('https://api.tvmaze.com/shows/42');
    expect(req.request.method).toBe('GET');
    req.flush(mockShow);
  });

  it('searchPeople should call GET /search/people with encoded query', () => {
    const mockResults: PersonSearchResult[] = [
      { score: 0.9, person: { id: 1, name: 'John Doe', image: null } },
    ];

    service.searchPeople('John Doe').subscribe((results) => {
      expect(results).toEqual(mockResults);
    });

    const req = httpTesting.expectOne('https://api.tvmaze.com/search/people?q=John%20Doe');
    expect(req.request.method).toBe('GET');
    req.flush(mockResults);
  });

  it('getPersonCastCredits should call correct URL with embed params', () => {
    const mockCredits: CastCredit[] = [];

    service.getPersonCastCredits(99).subscribe((credits) => {
      expect(credits).toEqual(mockCredits);
    });

    const req = httpTesting.expectOne(
      'https://api.tvmaze.com/people/99/castcredits?embed[]=show&embed[]=character',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockCredits);
  });
});
