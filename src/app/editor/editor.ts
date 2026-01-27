import {
  Component,
  inject,
  signal,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { CounterState } from '../counter-state';

@Component({
  selector: 'app-editor',
  imports: [],
  templateUrl: './editor.html',
  styleUrl: './editor.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Editor implements OnInit, OnDestroy {
  private readonly counterState = inject(CounterState);
  private readonly subscriptions: Subscription[] = [];
  private debounceTimeout: ReturnType<typeof setTimeout> | null = null;

  protected readonly text = signal('');
  protected readonly excludeWhitespace = signal(false);
  protected readonly useCharacterLimit = signal(false);
  protected readonly characterLimit = signal(this.counterState.getDefaultCharacterLimit());
  protected readonly isOverLimit = signal(false);
  protected readonly readTime = signal('0 minutes');

  ngOnInit(): void {
    this.subscriptions.push(
      this.counterState.characterLimitState$.subscribe((state) => {
        this.isOverLimit.set(state.isOverLimit);
      }),
    );

    this.subscriptions.push(
      this.counterState.characterStats$.subscribe((stats) => {
        this.readTime.set(this.formatReadTime(stats.readTime));
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
  }

  protected onTextInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.text.set(target.value);

    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      this.counterState.updateStats(this.text());
    }, 100);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Tab',
    ];

    if (
      this.counterState.isCharacterLimitReached(this.text()) &&
      !allowedKeys.includes(event.key)
    ) {
      event.preventDefault();
    }
  }

  protected onExcludeWhitespaceChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.excludeWhitespace.set(target.checked);
    this.counterState.setExcludeWhitespace(target.checked);
    this.counterState.updateStats(this.text());
  }

  protected onCharacterLimitToggleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.useCharacterLimit.set(target.checked);
    this.counterState.setUseCharacterLimit(target.checked);
    this.counterState.updateStats(this.text());
  }

  protected onCharacterLimitInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const limit = parseInt(target.value, 10) || 0;
    this.characterLimit.set(limit);
    this.counterState.setCharacterLimit(limit);
  }

  private formatReadTime(readTime: number): string {
    if (readTime === 0) {
      return '0 minutes';
    }
    if (readTime < 1) {
      return '< 1 minute';
    }
    return `${readTime.toFixed(2)} minutes`;
  }
}
