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
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
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
