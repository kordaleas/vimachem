import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ShowService } from '../../core/services/show.service';
import { ShowListStore } from '../movie-list/store/show-list.store';
import { Show } from '../../core/models/show.model';

@Component({
  selector: 'app-movie-detail',
  imports: [Button, Tag, ProgressSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './movie-detail.component.html',
  styleUrl: './movie-detail.component.scss',
})
export class MovieDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly showService = inject(ShowService);
  private readonly location = inject(Location);
  readonly showListStore = inject(ShowListStore);

  readonly show = signal<Show | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const localShow = this.showListStore.shows().find((s) => s.id === id);
    if (localShow) {
      this.show.set(localShow);
      this.loading.set(false);
      return;
    }
    this.showService.getShowById(id).subscribe({
      next: (s) => { this.show.set(s); this.loading.set(false); },
      error: () => { this.error.set('Failed to load show details.'); this.loading.set(false); },
    });
  }

  goBack(): void {
    this.location.back();
  }

  stripHtml(html: string | null): string {
    return html ? html.replace(/<[^>]*>/g, '') : '';
  }
}
