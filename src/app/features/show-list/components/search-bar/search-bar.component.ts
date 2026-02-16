import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { debounceTime, Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ShowService } from '../../../../core/services/show.service';
import { Person } from '../../../../core/models/show.model';

@Component({
  selector: 'app-search-bar',
  imports: [FormsModule, AutoComplete],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent {
  actorSelected = output<Person>();
  cleared = output<void>();

  readonly storedActor = input<Person | null>(null);
  readonly suggestions = signal<Person[]>([]);
  readonly selectedActor = computed(() => this.storedActor());

  private readonly showService = inject(ShowService);
  private readonly searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(400),
      switchMap((query) => this.showService.searchPeople(query)),
      takeUntilDestroyed(),
    ).subscribe((results) => {
      this.suggestions.set(results.map((r) => r.person));
    });
  }

  onComplete(event: AutoCompleteCompleteEvent): void {
    const query = event.query.trim();
    if (query.length > 0) {
      this.searchSubject.next(query);
    }
  }

  onSelect(event: AutoCompleteSelectEvent): void {
    this.actorSelected.emit(event.value as Person);
  }

  onActorChange(value: Person | null): void {
    if (value === null) {
      this.clear();
    }
  }

  clear(): void {
    this.suggestions.set([]);
    this.cleared.emit();
  }
}
