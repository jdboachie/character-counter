import {
  Component,
  inject,
  signal,
  computed,
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
import { ThemeService, Theme } from './theme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Editor, StatCard, LetterDensityStat],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit, OnDestroy {
  private readonly counterState = inject(CounterState);
  private readonly themeService = inject(ThemeService);
  private statsSubscription: Subscription | null = null;
  private densitiesSubscription: Subscription | null = null;

  // Track current text to recalculate stats when options change
  private currentText = '';

  protected readonly title = signal('character-counter');
  protected readonly characterCount = signal('0');
  protected readonly wordCount = signal('0');
  protected readonly sentenceCount = signal('0');
  protected readonly letterDensities = signal<LetterDensity[]>([]);
  protected readonly showAllDensities = signal(false);
  protected readonly characterLimit = signal(300);

  protected readonly displayedDensities = computed(() => {
    const all = this.letterDensities();
    return this.showAllDensities() ? all : all.slice(0, 5);
  });

  protected readonly hasMoreDensities = computed(() => {
    return this.letterDensities().length > 5;
  });

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

  protected toggleShowMore(): void {
    this.showAllDensities.set(!this.showAllDensities());
  }

  // Handle theme toggle from Header component
  protected onThemeToggled(theme: Theme): void {
    this.themeService.setTheme(theme);
  }

  // Handle text changes from Editor component
  protected onTextChanged(text: string): void {
    this.currentText = text;
    this.counterState.updateStats(text);
  }

  // Handle exclude whitespace toggle from Editor component
  protected onExcludeWhitespaceChanged(exclude: boolean): void {
    this.counterState.setExcludeWhitespace(exclude);
    // Recalculate stats with current text when option changes
    this.counterState.updateStats(this.currentText);
  }

  // Handle character limit toggle from Editor component
  protected onCharacterLimitToggled(enabled: boolean): void {
    this.counterState.setUseCharacterLimit(enabled);
    // Recalculate stats with current text when option changes
    this.counterState.updateStats(this.currentText);
  }

  // Handle character limit value change from Editor component
  protected onCharacterLimitChanged(limit: number): void {
    this.characterLimit.set(limit);
    this.counterState.setCharacterLimit(limit);
  }
}
