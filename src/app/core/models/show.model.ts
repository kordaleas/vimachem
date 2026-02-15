export interface ShowImage {
  medium: string;
  original: string;
}

export interface ShowRating {
  average: number | null;
}

export interface ShowNetwork {
  id: number;
  name: string;
}

export interface Show {
  id: number;
  name: string;
  type: string;
  language: string | null;
  genres: string[];
  status: string;
  runtime: number | null;
  premiered: string | null;
  ended: string | null;
  rating: ShowRating;
  image: ShowImage | null;
  summary: string | null;
  network: ShowNetwork | null;
  isFavorite?: boolean;
}

/** Wrapper returned by TVMaze /search/shows endpoint */
export interface ShowSearchResult {
  score: number;
  show: Show;
}

export interface Person {
  id: number;
  name: string;
  image: ShowImage | null;
}

/** Wrapper returned by TVMaze /search/people endpoint */
export interface PersonSearchResult {
  score: number;
  person: Person;
}

/** Cast credit returned by /people/:id/castcredits?embed[]=show&embed[]=character */
export interface CastCredit {
  _embedded: {
    show: Show;
    character: {
      id: number;
      name: string;
      image: ShowImage | null;
    };
  };
}
