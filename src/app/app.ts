import {
  Component,
  inject,
  signal,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { Editor } from './editor/editor';
import { Header } from './header/header';
import { StatCard } from './stat-card/stat-card';
import { LetterDensityStat } from './letter-density-stat/letter-density-stat';
import { CounterState, LetterDensity } from './counter-state';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Editor, StatCard, LetterDensityStat],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit, OnDestroy {
  private readonly counterState = inject(CounterState);
  private statsSubscription: Subscription | null = null;
  private densitiesSubscription: Subscription | null = null;

  protected readonly title = signal('character-counter');
  protected readonly characterCount = signal('0');
  protected readonly wordCount = signal('0');
  protected readonly sentenceCount = signal('0');
  protected readonly letterDensities = signal<LetterDensity[]>([]);
  protected readonly showAllDensities = signal(false);

  ngOnInit(): void {
    this.statsSubscription = this.counterState.characterStats$.subscribe((stats) => {
      this.characterCount.set(stats.characterCount.toString());
      this.wordCount.set(stats.wordCount.toString());
      this.sentenceCount.set(stats.sentenceCount.toString());
    });

    this.densitiesSubscription = this.counterState.letterDensities$.subscribe((densities) => {
      this.letterDensities.set(densities);
    });
  }

  ngOnDestroy(): void {
    if (this.statsSubscription) {
      this.statsSubscription.unsubscribe();
    }
    if (this.densitiesSubscription) {
      this.densitiesSubscription.unsubscribe();
    }
  }

  protected get displayedDensities(): LetterDensity[] {
    const all = this.letterDensities();
    return this.showAllDensities() ? all : all.slice(0, 5);
  }

  protected get hasMoreDensities(): boolean {
    return this.letterDensities().length > 5;
  }

  protected toggleShowMore(): void {
    this.showAllDensities.set(!this.showAllDensities());
  }
}
