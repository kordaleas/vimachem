import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CastCredit,
  PersonSearchResult,
  Show,
} from '../models/show.model';

@Injectable({ providedIn: 'root' })
export class ShowService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  /** Paginated show list — TVMaze returns ~250 shows per page */
  getShows(page: number): Observable<Show[]> {
    return this.http.get<Show[]>(`${this.base}/shows?page=${page}`);
  }

  /** Single show detail */
  getShowById(id: number): Observable<Show> {
    return this.http.get<Show>(`${this.base}/shows/${id}`);
  }

  /** Search people by name */
  searchPeople(query: string): Observable<PersonSearchResult[]> {
    return this.http.get<PersonSearchResult[]>(
      `${this.base}/search/people?q=${encodeURIComponent(query)}`,
    );
  }

  /** Get cast credits for a person with embedded show and character */
  getPersonCastCredits(personId: number): Observable<CastCredit[]> {
    return this.http.get<CastCredit[]>(
      `${this.base}/people/${personId}/castcredits?embed[]=show&embed[]=character`,
    );
  }
}
