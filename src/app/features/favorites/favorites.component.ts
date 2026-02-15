import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { ShowListStore } from '../movie-list/store/show-list.store';
import { ShowCardComponent } from '../movie-list/components/show-card/show-card.component';
import { EditDialogComponent } from '../movie-list/components/edit-dialog/edit-dialog.component';
import { Show } from '../../core/models/show.model';

@Component({
  selector: 'app-favorites',
  imports: [ShowCardComponent, Button, RouterLink, EditDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss',
})
export class FavoritesComponent {
  readonly store = inject(ShowListStore);

  readonly editingShow = signal<Show | null>(null);
  readonly editDialogVisible = signal(false);

  removeFromFavorites(show: Show): void {
    this.store.removeFavorite(show.id);
    // Also remove from the regular shows list
    this.store.deleteShow(show.id);
  }

  onDeleteRequested(id: number): void {
    this.store.removeFavorite(id);
    // Also remove from the regular shows list
    this.store.deleteShow(id);
  }

  onEditRequested(show: Show): void {
    this.editingShow.set(show);
    this.editDialogVisible.set(true);
  }

  onEditSaved(changes: Partial<Show>): void {
    const show = this.editingShow();
    if (show) {
      // Update in both shows and favorites
      this.store.updateShow(show.id, changes);
      this.store.addFavorite({ ...show, ...changes });
    }
    this.editDialogVisible.set(false);
    this.editingShow.set(null);
  }

  onEditClosed(): void {
    this.editDialogVisible.set(false);
    this.editingShow.set(null);
  }
}