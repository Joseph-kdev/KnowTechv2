import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authService';
import { BookmarkService } from '../../services/bookmark-service';
import { Feeds } from '../../services/feeds';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  auth = inject(AuthService);
  bookmarkService = inject(BookmarkService);
  feedsService = inject(Feeds);
  router = inject(Router);

  user = this.auth._user;
  uid = this.auth._user()?.uid;

  followedFeedsCount = signal<number>(0);
  currentTheme = signal<string>('theme-slate');

  ngOnInit(): void {
    if (this.uid) {
      this.feedsService.getFeedsSubscribedTo(this.uid).subscribe({
        next: (feeds) => {
          this.followedFeedsCount.set(feeds ? feeds.length : 0);
        },
        error: (err) => {
          console.error('Error fetching followed feeds count', err);
        },
      });
    }

    const savedTheme = localStorage.getItem('knowtech_theme') || 'theme-slate';
    this.currentTheme.set(savedTheme);
  }

  setTheme(themeName: string): void {
    this.currentTheme.set(themeName);
    localStorage.setItem('knowtech_theme', themeName);

    document.documentElement.classList.remove(
      'theme-cyber',
      'theme-nordic',
      'theme-slate',
      'theme-sunset',
      'theme-ocean',
      'theme-amethyst',
    );
    if (themeName !== 'theme-slate') {
      document.documentElement.classList.add(themeName);
    }
  }

  getUserDisplayName(): string {
    const u = this.user();
    if (!u) return 'Guest User';
    if (u.displayName) return u.displayName;
    if (u.email) return u.email.split('@')[0];
    return 'User';
  }

  getUserInitials(): string {
    const name = this.getUserDisplayName();
    if (!name) return 'KT';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  onLogout(): void {
    this.auth.logout().subscribe({
      next: () => {
        this.router.navigate(['login']);
      },
      error: (err) => {
        console.error('Error logging out', err);
      },
    });
  }
}
