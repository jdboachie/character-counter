import { Component, input } from '@angular/core';
import { LetterDensity } from '../counter-state';

@Component({
  selector: 'app-letter-density-stat',
  imports: [],
  templateUrl: './letter-density-stat.html',
  styleUrl: './letter-density-stat.css',
})
export class LetterDensityStat {
  density = input.required<LetterDensity>();
}
