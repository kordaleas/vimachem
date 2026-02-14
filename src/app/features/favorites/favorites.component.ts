import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { FavoritesStore } from './store/favorites.store';
import { ShowCardComponent } from '../movie-list/components/show-card/show-card.component';
import { Show } from '../../core/models/show.model';

@Component({
  selector: 'app-favorites',
  imports: [ShowCardComponent, Button, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss',
})
export class FavoritesComponent {
  readonly store = inject(FavoritesStore);

  removeFromFavorites(show: Show): void {
    this.store.removeFavorite(show.id);
  }
}
