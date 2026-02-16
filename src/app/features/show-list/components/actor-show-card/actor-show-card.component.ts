import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Tag } from 'primeng/tag';
import { Show } from '../../../../core/models/show.model';

@Component({
  selector: 'app-actor-show-card',
  imports: [Tag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './actor-show-card.component.html',
  styleUrl: './actor-show-card.component.scss',
})
export class ActorShowCardComponent {
  show = input.required<Show>();
}
