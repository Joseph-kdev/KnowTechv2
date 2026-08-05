import { Service, signal } from '@angular/core';

const ALL_THEMES = [
  'theme-slate',
  'theme-cyber',
  'theme-nordic',
  'theme-sunset',
  'theme-ocean',
  'theme-amethyst',
] as const;

export type Theme = (typeof ALL_THEMES)[number];

@Service()
export class ThemeService {
  readonly currentTheme = signal<Theme>('theme-slate');

  constructor() {
    const saved = localStorage.getItem('knowtech_theme') as Theme | null;
    if (saved && ALL_THEMES.includes(saved as any)) {
      this.currentTheme.set(saved);
    }
  }

  init(): void {
    this.applyTheme(this.currentTheme());
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    localStorage.setItem('knowtech_theme', theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.classList.remove(...ALL_THEMES);
    if (theme !== 'theme-slate') {
      document.documentElement.classList.add(theme);
    }
  }
}
