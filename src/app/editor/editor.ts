import {
  Component,
  inject,
  signal,
  output,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  input,
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
export class Editor implements OnInit, OnDestroy, OnChanges {
  private readonly counterState = inject(CounterState);
  private readonly subscriptions: Subscription[] = [];
  private debounceTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly initialCharacterLimit = input<number>(300);

  readonly textChanged = output<string>();
  readonly excludeWhitespaceChanged = output<boolean>();
  readonly characterLimitToggled = output<boolean>();
  readonly characterLimitChanged = output<number>();

  protected readonly text = signal('');
  protected readonly excludeWhitespace = signal(false);
  protected readonly useCharacterLimit = signal(false);
  protected readonly characterLimit = signal(300);
  protected readonly isOverLimit = signal(false);
  protected readonly readTime = signal('0 minutes');

  ngOnInit(): void {
    this.characterLimit.set(this.initialCharacterLimit());

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialCharacterLimit'] && !changes['initialCharacterLimit'].firstChange) {
      const newLimit = changes['initialCharacterLimit'].currentValue;
      this.characterLimit.set(newLimit);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
  }

  protected onTextInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    const newText = target.value;
    this.text.set(newText);

    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      // Emit to parent - parent handles service updates
      this.textChanged.emit(newText);
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
    const isChecked = target.checked;
    this.excludeWhitespace.set(isChecked);

    // Emit to parent - parent handles service updates
    this.excludeWhitespaceChanged.emit(isChecked);
  }

  protected onCharacterLimitToggleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;
    this.useCharacterLimit.set(isChecked);

    // Emit to parent - parent handles service updates
    this.characterLimitToggled.emit(isChecked);
  }

  protected onCharacterLimitInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const limit = parseInt(target.value, 10) || 0;
    this.characterLimit.set(limit);

    // Emit to parent - parent handles service updates
    this.characterLimitChanged.emit(limit);
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
