import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/authService';
import { Router } from '@angular/router';
import { catchError, finalize, switchMap } from 'rxjs';

export interface FeedItem {
  id: number;
  source: string;
  sourceColor: string;
  sourceBg: string;
  title: string;
  time: string;
  tag: string;
  tagColor: string;
  read: boolean;
  entering: boolean;
}

const FEED_POOL: Omit<FeedItem, 'id' | 'entering'>[] = [
  {
    source: 'Hacker News',
    sourceColor: '#FF6600',
    sourceBg: '#FFF1E6',
    title: 'GPT-5 changes everything about developer workflows',
    time: 'just now',
    tag: 'AI',
    tagColor: 'bg-purple-100 text-purple-700',
    read: false,
  },
  {
    source: 'TechCrunch',
    sourceColor: '#00A650',
    sourceBg: '#E6F7EF',
    title: 'Open-source tools that dominated 2025',
    time: 'just now',
    tag: 'Open Source',
    tagColor: 'bg-green-100 text-green-700',
    read: false,
  },
  {
    source: 'The Verge',
    sourceColor: '#FF3B30',
    sourceBg: '#FFF0F0',
    title: 'The best mechanical keyboards for developers in 2026',
    time: 'just now',
    tag: 'Hardware',
    tagColor: 'bg-orange-100 text-orange-700',
    read: false,
  },
  {
    source: 'Ars Technica',
    sourceColor: '#F24545',
    sourceBg: '#FFF0F0',
    title: 'Inside the chip that could replace the GPU',
    time: 'just now',
    tag: 'Hardware',
    tagColor: 'bg-red-100 text-red-700',
    read: false,
  },
  {
    source: 'Hacker News',
    sourceColor: '#FF6600',
    sourceBg: '#FFF1E6',
    title: 'Show HN: I built a local-first notes app in Go',
    time: 'just now',
    tag: 'Show HN',
    tagColor: 'bg-yellow-100 text-yellow-700',
    read: false,
  },
  {
    source: 'TechCrunch',
    sourceColor: '#00A650',
    sourceBg: '#E6F7EF',
    title: "Y Combinator's W26 batch: the startups to watch",
    time: 'just now',
    tag: 'Startups',
    tagColor: 'bg-emerald-100 text-emerald-700',
    read: false,
  },
  {
    source: 'The Verge',
    sourceColor: '#FF3B30',
    sourceBg: '#FFF0F0',
    title: "Apple's next iPhone may ditch the notch entirely",
    time: 'just now',
    tag: 'Apple',
    tagColor: 'bg-gray-100 text-gray-600',
    read: false,
  },
  {
    source: 'Ars Technica',
    sourceColor: '#F24545',
    sourceBg: '#FFF0F0',
    title: 'Linux 7.0 kernel brings major memory improvements',
    time: 'just now',
    tag: 'Linux',
    tagColor: 'bg-blue-100 text-blue-700',
    read: false,
  },
  {
    source: 'Hacker News',
    sourceColor: '#FF6600',
    sourceBg: '#FFF1E6',
    title: 'Why most databases get time zones wrong',
    time: 'just now',
    tag: 'Databases',
    tagColor: 'bg-indigo-100 text-indigo-700',
    read: false,
  },
  {
    source: 'TechCrunch',
    sourceColor: '#00A650',
    sourceBg: '#E6F7EF',
    title: 'Stripe launches embedded finance for African markets',
    time: 'just now',
    tag: 'Fintech',
    tagColor: 'bg-teal-100 text-teal-700',
    read: false,
  },
  {
    source: 'The Verge',
    sourceColor: '#FF3B30',
    sourceBg: '#FFF0F0',
    title: 'The electric car you can actually afford in 2026',
    time: 'just now',
    tag: 'EVs',
    tagColor: 'bg-lime-100 text-lime-700',
    read: false,
  },
  {
    source: 'Ars Technica',
    sourceColor: '#F24545',
    sourceBg: '#FFF0F0',
    title: 'JWST reveals new details about early galaxy formation',
    time: 'just now',
    tag: 'Science',
    tagColor: 'bg-cyan-100 text-cyan-700',
    read: false,
  },
];

const MAX_VISIBLE = 4;
const INTERVAL_MS = 2400;

@Component({
  selector: 'login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
})
export class Login implements OnInit, OnDestroy {
  email = signal('');
  password = signal('');
  showPassword = signal(false);
  isLoading = signal(false);

  authService = inject(AuthService);
  router = inject(Router);

  visibleItems = signal<FeedItem[]>([]);

  private poolIndex = 0;
  private idCounter = 0;
  private timer: ReturnType<typeof setInterval> | null = null;

  feedSources = [
    { name: 'Hacker News', abbr: 'HN', color: '#FF6600', bg: '#FFF1E6' },
    { name: 'TechCrunch', abbr: 'TC', color: '#00A650', bg: '#E6F7EF' },
    { name: 'The Verge', abbr: 'TV', color: '#FF3B30', bg: '#FFF0F0' },
    { name: 'Ars Technica', abbr: 'AT', color: '#F24545', bg: '#FFF0F0' },
  ];

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate([''], { replaceUrl: true });
      return;
    }
    // Seed initial cards without animation
    for (let i = 0; i < MAX_VISIBLE; i++) {
      this.pushItem(false);
    }
    // Start streaming
    this.timer = setInterval(() => this.streamNext(), INTERVAL_MS);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private pushItem(entering: boolean) {
    const raw = FEED_POOL[this.poolIndex % FEED_POOL.length];
    this.poolIndex++;
    const item: FeedItem = { ...raw, id: this.idCounter++, entering, read: false };
    this.visibleItems.update((list) => [item, ...list].slice(0, MAX_VISIBLE));

    // Remove the entering flag after animation completes
    if (entering) {
      setTimeout(() => {
        this.visibleItems.update((list) =>
          list.map((i) => (i.id === item.id ? { ...i, entering: false } : i)),
        );
      }, 500);
    }
  }

  streamNext() {
    this.pushItem(true);
  }

  togglePassword() {
    this.showPassword.update((v) => !v);
  }

  onLogin() {
    this.isLoading.set(true);
    this.authService.login(this.email(), this.password())
      .pipe(
        finalize(() => {
          this.isLoading.set(false)
        })
      ).subscribe({
        next: () => {

          this.router.navigate([""], { replaceUrl: true})
        },
        error: (error) => {
          console.log("Auth error", error)
        }
      })
  }

  googleSignIn() {
    this.authService.loginWithGoogle()
       .subscribe({
        next: () => {

          this.router.navigate([""], { replaceUrl: true})
        },
        error: (error) => {
          console.log("Auth error", error)
        }
      })
  }

  trackById(_: number, item: FeedItem) {
    return item.id;
  }
}
