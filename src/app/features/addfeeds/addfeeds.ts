import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Feeds } from '../../services/feeds';
import { AuthService } from '../../services/authService';
import { PostService } from '../../services/postService';
import { finalize } from 'rxjs';
import { Feed } from '../../types';

@Component({
  selector: 'app-addfeeds',
  imports: [FormsModule],
  templateUrl: './addfeeds.html',
  styleUrl: './addfeeds.css',
})
export class Addfeeds implements OnInit {
  private feedsService = inject(Feeds);
  private authService = inject(AuthService);
  private postService = inject(PostService);

  readonly feedsAvailable = signal<Feed[]>([]);
  readonly followedFeedIds = signal<Set<string>>(new Set());
  readonly searchQuery = signal<string>('');
  readonly isLoading = signal<boolean>(false);
  readonly isError = signal<string | null>(null);
  uid = this.authService._user()?.uid;

  // Filter feeds based on search query (case-insensitive search on name, category, or URL)
  readonly filteredFeeds = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const feeds = this.feedsAvailable();
    if (!query) return feeds;
    return feeds.filter(
      (f) =>
        f.name?.toLowerCase().includes(query) ||
        f.category?.toLowerCase().includes(query) ||
        f.url?.toLowerCase().includes(query),
    );
  });

  ngOnInit() {
    this.loadFeeds();
    this.loadFollowedFeeds();
  }

  loadFeeds() {
    this.isLoading.set(true);
    this.isError.set(null);

    this.feedsService
      .getAllFeeds()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (feeds) => {
          this.feedsAvailable.set(feeds);
        },
        error: (err) => {
          this.isError.set(err.error?.message ?? 'Error: Feeds not found.');
        },
      });
  }

  loadFollowedFeeds() {
    // Cross-reference user's followed feeds by fetching subscriptions
    this.feedsService.getFeedsSubscribedTo(this.uid as string).subscribe({
      next: (subscribedGroups) => {
        const ids = new Set(subscribedGroups.map((group) => group.id));
        this.followedFeedIds.set(ids);
        localStorage.setItem('followed_feed_ids', JSON.stringify([...ids]));
      },
      error: (err) => {
        console.error('Error loading followed feeds, using local storage fallback', err);
        const local = localStorage.getItem('followed_feed_ids');
        if (local) {
          try {
            this.followedFeedIds.set(new Set(JSON.parse(local)));
          } catch (e) {
            console.error('Failed to parse local followed feeds', e);
          }
        }
      },
    });
  }

  toggleFollow(feed: Feed) {
    const uid = this.authService._user()?.uid;
    if (!uid) {
      console.warn(
        'User UID is not available from Firebase Auth. Defaulting to local preview toggle.',
      );
      this.toggleLocalFollow(feed.id);
      return;
    }

    // Subscription changes alter the posts endpoint's result, so force its next
    // visit to fetch a fresh feed rather than using the one-hour cache.
    this.postService.clearGroupedPostsCache(uid);

    const isFollowing = this.followedFeedIds().has(feed.id);
    if (isFollowing) {
      // Optimistic update
      this.removeFollowId(feed.id);
      this.updateFeedFollowercount(feed.id, -1)
      this.feedsService.unfollowAFeed(uid, feed.id).subscribe({
        error: (err) => {
          console.error('Failed to unfollow feed on server, reverting state', err);
          this.addFollowId(feed.id);
        },
      });
    } else {
      // Optimistic update
      this.addFollowId(feed.id);
      this.updateFeedFollowercount(feed.id, +1)
      this.feedsService.followAFeed(uid, feed.id).subscribe({
        error: (err) => {
          console.error('Failed to follow feed on server, reverting state', err);
          this.removeFollowId(feed.id);
        },
      });
    }
  }

  private updateFeedFollowercount(feedId: string, delta: number) {
    const currentFeeds = this.feedsAvailable()
    const updatedFeeds = currentFeeds.map(f => 
      f.id === feedId
        ? { ...f, feed_followers_count: (f.feed_followers_count ?? 0) + delta}
        : f
    )
    this.feedsAvailable.set(updatedFeeds)
  }

  private toggleLocalFollow(id: string) {
    const next = new Set(this.followedFeedIds());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.followedFeedIds.set(next);
    localStorage.setItem('followed_feed_ids', JSON.stringify([...next]));
  }

  private addFollowId(id: string) {
    const next = new Set(this.followedFeedIds());
    next.add(id);
    this.followedFeedIds.set(next);
    localStorage.setItem('followed_feed_ids', JSON.stringify([...next]));
  }

  private removeFollowId(id: string) {
    const next = new Set(this.followedFeedIds());
    next.delete(id);
    this.followedFeedIds.set(next);
    localStorage.setItem('followed_feed_ids', JSON.stringify([...next]));
  }

  getCategoryClass(category: string | undefined | null): string {
    const cat = (category ?? 'general').toLowerCase();
    if (
      cat.includes('tech') ||
      cat.includes('science') ||
      cat.includes('dev') ||
      cat.includes('code')
    ) {
      return 'bg-blue-50 text-blue-700 border border-blue-100/80';
    }
    if (
      cat.includes('news') ||
      cat.includes('world') ||
      cat.includes('global') ||
      cat.includes('politics')
    ) {
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100/80';
    }
    if (cat.includes('business') || cat.includes('finance') || cat.includes('money')) {
      return 'bg-amber-50 text-amber-700 border border-amber-100/80';
    }
    if (
      cat.includes('design') ||
      cat.includes('art') ||
      cat.includes('culture') ||
      cat.includes('lifestyle')
    ) {
      return 'bg-pink-50 text-pink-700 border border-pink-100/80';
    }
    return 'bg-gray-50 text-gray-700 border border-gray-100';
  }

  getCategoryGradient(category: string | undefined | null): string {
    const cat = (category ?? 'general').toLowerCase();
    if (
      cat.includes('tech') ||
      cat.includes('science') ||
      cat.includes('dev') ||
      cat.includes('code')
    ) {
      return 'from-blue-500 to-indigo-600';
    }
    if (
      cat.includes('news') ||
      cat.includes('world') ||
      cat.includes('global') ||
      cat.includes('politics')
    ) {
      return 'from-emerald-500 to-teal-600';
    }
    if (cat.includes('business') || cat.includes('finance') || cat.includes('money')) {
      return 'from-amber-500 to-orange-600';
    }
    if (
      cat.includes('design') ||
      cat.includes('art') ||
      cat.includes('culture') ||
      cat.includes('lifestyle')
    ) {
      return 'from-pink-500 to-rose-600';
    }
    return 'from-gray-500 to-slate-600';
  }
}
