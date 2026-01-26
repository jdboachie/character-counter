import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  imports: [],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css',
})
export class StatCard {
  title = input.required<string>();
  displayValue = input.required<string>();
  cardImageUrl = input.required<string>();
  backgroundColor = input.required<string>();
}
