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
}

/** Wrapper returned by TVMaze /search/shows endpoint */
export interface ShowSearchResult {
  score: number;
  show: Show;
}
