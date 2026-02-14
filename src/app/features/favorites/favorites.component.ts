import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-favorites',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>Favorites – coming soon</p>`,
})
export class FavoritesComponent {}
