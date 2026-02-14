import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-movie-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>Movie list – coming soon</p>`,
})
export class MovieListComponent {}
