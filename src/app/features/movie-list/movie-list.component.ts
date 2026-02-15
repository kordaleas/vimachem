import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Button } from 'primeng/button';
import { ShowListStore } from './store/show-list.store';
import { FavoritesStore } from '../favorites/store/favorites.store';
import { ShowCardComponent } from './components/show-card/show-card.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { EditDialogComponent } from './components/edit-dialog/edit-dialog.component';
import { Person, Show } from '../../core/models/show.model';

@Component({
  selector: 'app-movie-list',
  imports: [ShowCardComponent, SearchBarComponent, EditDialogComponent, ConfirmDialog, ProgressSpinner, Button],
  providers: [ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.scss',
})
export class MovieListComponent implements OnInit, OnDestroy {
  readonly store = inject(ShowListStore);
  readonly favStore = inject(FavoritesStore);

  private readonly confirmationService = inject(ConfirmationService);
  private readonly sentinelRef = viewChild<ElementRef<HTMLDivElement>>('sentinel');
  private observer: IntersectionObserver | null = null;

  readonly editingShow = signal<Show | null>(null);
  readonly editDialogVisible = signal(false);

  constructor() {
    afterNextRender(() => {
      const saved = this.store.scrollPosition();
      if (saved > 0) {
        window.scrollTo({ top: saved, behavior: 'instant' });
      }
      this.setupInfiniteScroll();
    });
  }

  ngOnInit(): void {
    if (this.store.shows().length === 0) {
      this.store.loadNextPage();
    }
  }

  private setupInfiniteScroll(): void {
    const el = this.sentinelRef()?.nativeElement;
    if (!el) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.store.loading()) {
          this.store.showMore();
          if (this.store.needsMoreData()) {
            this.store.loadNextPage();
          }
        }
      },
      { rootMargin: '200px' },
    );
    this.observer.observe(el);
  }

  onActorSelected(person: Person): void {
    this.store.loadShowsByActor({ personId: person.id, person });
  }

  onSearchCleared(): void {
    this.store.clearSearch();
    // If no shows were restored, load from API
    if (this.store.shows().length === 0) {
      this.store.loadNextPage();
    }
  }

  onFavoriteToggled(show: Show): void {
    this.favStore.toggleFavorite(show);
  }

  onEditRequested(show: Show): void {
    this.editingShow.set(show);
    this.editDialogVisible.set(true);
  }

  onEditSaved(changes: Partial<Show>): void {
    const show = this.editingShow();
    if (show) this.store.updateShow(show.id, changes);
    this.editDialogVisible.set(false);
    this.editingShow.set(null);
  }

  onEditClosed(): void {
    this.editDialogVisible.set(false);
    this.editingShow.set(null);
  }

  onDeleteRequested(id: number): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to remove this show?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.store.deleteShow(id),
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.store.saveScrollPosition(window.scrollY);
  }
}
