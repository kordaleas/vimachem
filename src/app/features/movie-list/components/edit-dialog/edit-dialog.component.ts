import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Show } from '../../../../core/models/show.model';

@Component({
  selector: 'app-edit-dialog',
  imports: [Dialog, Button, InputText, Textarea, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './edit-dialog.component.html',
  styleUrl: './edit-dialog.component.scss',
})
export class EditDialogComponent {
  show = input<Show | null>(null);
  visible = input<boolean>(false);

  saved = output<Partial<Show>>();
  closed = output<void>();

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    summary: [''],
    genres: [''],
  });

  constructor() {
    effect(() => {
      const s = this.show();
      if (s) {
        this.form.patchValue({
          name: s.name,
          summary: this.stripHtml(s.summary),
          genres: s.genres.join(', '),
        });
      }
    });
  }

  save(): void {
    if (this.form.invalid) return;
    const { name, summary, genres } = this.form.getRawValue();
    this.saved.emit({
      name: name!,
      summary: summary || null,
      genres: genres ? genres.split(',').map((g) => g.trim()).filter(Boolean) : [],
    });
  }

  close(): void {
    this.form.reset();
    this.closed.emit();
  }

  private stripHtml(html: string | null): string {
    return html ? html.replace(/<[^>]*>/g, '') : '';
  }
}
