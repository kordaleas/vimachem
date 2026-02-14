import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  output,
  viewChild,
} from '@angular/core';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { debounceTime, distinctUntilChanged, fromEvent, map, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  imports: [InputText, Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search-bar">
      <span class="search-icon pi pi-search" aria-hidden="true"></span>
      <input
        #searchInput
        type="text"
        pInputText
        placeholder="Search shows…"
        class="search-input"
        aria-label="Search shows"
      />
      <p-button
        icon="pi pi-times"
        severity="secondary"
        [rounded]="true"
        [text]="true"
        size="small"
        ariaLabel="Clear search"
        (onClick)="clear()"
      />
    </div>
  `,
  styles: [`
    .search-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--p-surface-card);
      border: 1px solid var(--p-surface-border);
      border-radius: var(--p-border-radius-xl, 24px);
      padding: 0.25rem 0.5rem 0.25rem 1rem;
      max-width: 480px;
      width: 100%;
    }

    .search-icon {
      color: var(--p-text-color-secondary);
      font-size: 0.875rem;
    }

    .search-input {
      flex: 1;
      border: none !important;
      background: transparent !important;
      box-shadow: none !important;
      padding: 0 !important;
      outline: none;
    }
  `],
})
export class SearchBarComponent implements AfterViewInit, OnDestroy {
  searched = output<string>();

  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');
  private readonly destroy$ = new Subject<void>();

  ngAfterViewInit(): void {
    fromEvent<InputEvent>(this.inputRef().nativeElement, 'input').pipe(
      map((e) => (e.target as HTMLInputElement).value.trim()),
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe((query) => this.searched.emit(query));
  }

  clear(): void {
    this.inputRef().nativeElement.value = '';
    this.searched.emit('');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
