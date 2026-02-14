import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Show, ShowSearchResult } from '../models/show.model';

@Injectable({ providedIn: 'root' })
export class ShowService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  /** Paginated show list — TVMaze returns ~250 shows per page */
  getShows(page: number): Observable<Show[]> {
    return this.http.get<Show[]>(`${this.base}/shows?page=${page}`);
  }

  /** Full-text search — returns all matches (not paginated) */
  searchShows(query: string): Observable<Show[]> {
    return this.http
      .get<ShowSearchResult[]>(`${this.base}/search/shows?q=${encodeURIComponent(query)}`)
      .pipe(map((results) => results.map((r) => r.show)));
  }

  /** Single show detail */
  getShowById(id: number): Observable<Show> {
    return this.http.get<Show>(`${this.base}/shows/${id}`);
  }
}
