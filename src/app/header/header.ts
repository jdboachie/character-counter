import { Component, inject, ChangeDetectionStrategy, computed, output } from '@angular/core';
import { ThemeService, Theme } from '../theme';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly themeService = inject(ThemeService);

  readonly themeToggled = output<Theme>();

  protected readonly logoSrc = computed(() =>
    this.themeService.isDark() ? './images/logo-dark-theme.svg' : './images/logo-light-theme.svg',
  );

  protected readonly themeIconSrc = computed(() =>
    this.themeService.isDark() ? './images/icon-sun.svg' : './images/icon-moon.svg',
  );

  protected readonly themeButtonLabel = computed(() =>
    this.themeService.isDark() ? 'Switch to light theme' : 'Switch to dark theme',
  );

  protected toggleTheme(): void {
    const newTheme: Theme = this.themeService.isDark() ? 'light' : 'dark';
    this.themeToggled.emit(newTheme);
  }
}
