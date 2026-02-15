import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Show } from '../../../../core/models/show.model';

@Component({
  selector: 'app-show-card',
  imports: [RouterLink, Button, Tag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './show-card.component.html',
  styleUrl: './show-card.component.scss',
})
export class ShowCardComponent {
  show = input.required<Show>();

  favoriteToggled = output<number>();
  editRequested = output<Show>();
  deleteRequested = output<number>();
}
