import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
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
  private readonly router = inject(Router);

  goBack(): void {
    this.router.navigate(['/movies']);
  }

  readonly editingShow = signal<Show | null>(null);
  readonly editDialogVisible = signal(false);

  onFavoriteToggled(id: number): void {
    this.store.toggleFavorite(id);
  }

  onDeleteRequested(id: number): void {
    this.store.deleteShow(id);
  }

  onEditRequested(show: Show): void {
    this.editingShow.set(show);
    this.editDialogVisible.set(true);
  }

  onEditSaved(changes: Partial<Show>): void {
    const show = this.editingShow();
    if (show) {
      this.store.updateShow(show.id, changes);
    }
    this.editDialogVisible.set(false);
    this.editingShow.set(null);
  }

  onEditClosed(): void {
    this.editDialogVisible.set(false);
    this.editingShow.set(null);
  }
}