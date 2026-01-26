import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, debounceTime, distinctUntilChanged } from 'rxjs';

export interface CharacterStats {
  characterCount: number;
  wordCount: number;
  sentenceCount: number;
  readTime: number;
}

export interface CharacterLimitState {
  isOverLimit: boolean;
  limit: number;
}

export interface LetterDensity {
  letter: string;
  count: number;
  percent: number;
}

@Injectable({
  providedIn: 'root',
})
export class CounterState {
  private readonly WPM = 200;
  private readonly DEFAULT_CHARACTER_LIMIT = 300;
  private characterStatsSubject = new BehaviorSubject<CharacterStats>({
    characterCount: 0,
    wordCount: 0,
    sentenceCount: 0,
    readTime: 0,
  });

  private characterLimitStateSubject = new BehaviorSubject<CharacterLimitState>({
    isOverLimit: false,
    limit: this.DEFAULT_CHARACTER_LIMIT,
  });

  private letterDensitiesSubject = new BehaviorSubject<LetterDensity[]>([]);
  private shouldExcludeWhitespace = false;
  private shouldUseCharacterLimit = false;
  private characterLimit = this.DEFAULT_CHARACTER_LIMIT;
  public readonly characterStats$: Observable<CharacterStats> =
    this.characterStatsSubject.asObservable();

  public readonly characterLimitState$: Observable<CharacterLimitState> =
    this.characterLimitStateSubject.asObservable();

  public readonly letterDensities$: Observable<LetterDensity[]> =
    this.letterDensitiesSubject.asObservable();

  constructor() {}

  setExcludeWhitespace(shouldExclude: boolean): void {
    this.shouldExcludeWhitespace = shouldExclude;
  }

  setCharacterLimit(limit: number): void {
    this.characterLimit = limit;
    const currentStats = this.characterStatsSubject.value;
    this.characterLimitStateSubject.next({
      isOverLimit:
        currentStats.characterCount > this.characterLimit && this.shouldUseCharacterLimit,
      limit: this.characterLimit,
    });
  }

  setUseCharacterLimit(shouldUse: boolean): void {
    this.shouldUseCharacterLimit = shouldUse;
  }

  private getCharacterCounts(text: string): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const char of text.toUpperCase()) {
      if (/[A-Z]/.test(char)) {
        counts[char] = (counts[char] || 0) + 1;
      }
    }
    return counts;
  }

  private calculateLetterDensities(text: string): void {
    const counts = this.getCharacterCounts(text);
    const totalLetters = Object.values(counts).reduce((a, b) => a + b, 0);

    if (totalLetters === 0) {
      this.letterDensitiesSubject.next([]);
      return;
    }

    const densities = Object.entries(counts)
      .map(([letter, count]) => ({
        letter,
        count,
        percent: (count / totalLetters) * 100,
      }))
      .sort((a, b) => b.percent - a.percent);

    this.letterDensitiesSubject.next(densities);
  }

  private calculateCharacterCount(text: string): number {
    if (this.shouldExcludeWhitespace) {
      return text.replace(/\s/g, '').length;
    }
    return text.length;
  }

  updateStats(text: string): void {
    const characterCount = this.calculateCharacterCount(text);
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const sentenceCount = text.trim().split(/[.!?]/).filter(Boolean).length;
    const readTime = wordCount / this.WPM;
    this.characterStatsSubject.next({
      characterCount,
      wordCount,
      sentenceCount,
      readTime,
    });
    const isOverLimit = characterCount > this.characterLimit && this.shouldUseCharacterLimit;

    this.characterLimitStateSubject.next({
      isOverLimit,
      limit: this.characterLimit,
    });
    this.calculateLetterDensities(text);
  }

  isCharacterLimitReached(text: string): boolean {
    if (!this.shouldUseCharacterLimit) {
      return false;
    }

    const currentCount = this.shouldExcludeWhitespace
      ? text.replace(/\s/g, '').length
      : text.length;

    return currentCount >= this.characterLimit;
  }

  getCharacterLimit(): number {
    return this.characterLimit;
  }

  isCharacterLimitEnabled(): boolean {
    return this.shouldUseCharacterLimit;
  }

  getDefaultCharacterLimit(): number {
    return this.DEFAULT_CHARACTER_LIMIT;
  }
}
