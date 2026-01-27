import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'character-counter-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly themeSignal = signal<Theme>(this.getInitialTheme());

  readonly theme = this.themeSignal.asReadonly();
  readonly isDark = () => this.themeSignal() === 'dark';

  constructor() {
    effect(() => {
      const theme = this.themeSignal();
      this.applyTheme(theme);
      this.persistTheme(theme);
    });
  }

  toggleTheme(): void {
    this.themeSignal.set(this.isDark() ? 'light' : 'dark');
  }

  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
  }

  private getInitialTheme(): Theme {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;

    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  private applyTheme(theme: Theme): void {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  private persistTheme(theme: Theme): void {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
}
