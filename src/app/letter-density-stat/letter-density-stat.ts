import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { LetterDensity } from '../counter-state';

@Component({
  selector: 'app-letter-density-stat',
  imports: [],
  templateUrl: './letter-density-stat.html',
  styleUrl: './letter-density-stat.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LetterDensityStat {
  density = input.required<LetterDensity>();
}
