import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-movie-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>Movie detail – coming soon</p>`,
})
export class MovieDetailComponent {}
