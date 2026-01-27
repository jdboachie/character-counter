import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  imports: [],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCard {
  title = input.required<string>();
  displayValue = input.required<string>();
  cardImageUrl = input.required<string>();
  backgroundColor = input.required<string>();
}
