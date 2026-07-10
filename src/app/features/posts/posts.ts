import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/authService';
import { PostService } from '../../services/postService';
import { finalize, timestamp } from 'rxjs';
import { FormsModule } from '@angular/forms';

interface Feed {
  feed_id: string;
  feed_name: string;
  feed_url: string;
  posts: Post[];
}

interface Post {
  id: string;
  title: string;
  url: string;
  description: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

interface DisplayFeed {
  id: string; // feed_id
  name: string; // feed_name
  totalPosts: number; // count of posts
}

interface DisplayArticle {
  id: string;
  badge: string; // feed name
  headline: string; // post title
  timestamp: string; // formatted published_at
  url: string;
  imageUrl: string | null;
}

@Component({
  selector: 'app-posts',
  imports: [FormsModule],
  templateUrl: './posts.html',
  styleUrl: './posts.css',
})
export class Posts implements OnInit {
  auth = inject(AuthService);
  postService = inject(PostService);
  uid = this.auth._user()?.uid;

  readonly feedsExpanded = signal(true);
  readonly selectedFeedId = signal<string | null>(null);
  readonly allFeeds = signal<DisplayFeed[]>([]);
  readonly allPosts = signal<DisplayArticle[]>([]);
  filteredPosts = signal<DisplayArticle[]>([]);
  readonly groupedPosts = signal<Feed[]>([]);
  readonly isLoading = signal(false);
  readonly isError = signal(false);
  readonly searchQuery = signal<string>('');

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.isLoading.set(true);
    this.postService
      .getGroupedPosts(this.uid as string)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (response: Feed[]) => {
          console.log(response);
          this.processFeedData(response);
        },
        error: (err: any) => {
          console.log(err);
          this.isError.set(err.error.message ?? 'Error fetching posts from feeds');
        },
      });
  }

  processFeedData(feeds: Feed[]) {
    this.groupedPosts.set(feeds);
    const displayFeeds = feeds.map((feed) => ({
      id: feed.feed_id,
      name: feed.feed_name,
      totalPosts: feed.posts.length,
    }));
    this.allFeeds.set(displayFeeds);
    const allPosts: DisplayArticle[] = feeds.flatMap((feed) =>
      feed.posts.map((post) => ({
        id: post.id,
        badge: feed.feed_name,
        headline: post.title,
        timestamp: this.formatTimestamp(post.published_at),
        url: post.url,
        imageUrl: this.extractFirstImg(post.description),
      })),
    );

    this.allPosts.set(allPosts);

    this.applyFilters();
    this.selectedFeedId.set(null);
  }

  extractFirstImg(html: string): string | null {
    if (!html) return null;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const imgElement = tempDiv.querySelector('img');
    if (imgElement && imgElement.src) {
      return imgElement.src;
    }

    // If no img tag, try to find image URL in the content
    // This handles cases where images might be embedded as markdown or plain URLs
    const imgRegex = /<img[^>]+src="([^">]+)"/i;
    const match = html.match(imgRegex);
    if (match && match[1]) {
      return match[1];
    }

    // Try to find plain image URLs (http...jpg, png, gif, webp)
    const urlRegex = /https?:\/\/[^\s'"]+\.(jpg|jpeg|png|gif|webp)/i;
    const urlMatch = html.match(urlRegex);
    if (urlMatch) {
      return urlMatch[0];
    }

    return null;
  }

  formatTimestamp(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 48) return 'Yesterday';
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    return date.toLocaleDateString();
  }

  applyFilters(): void {
    let posts = this.allPosts();

    // Apply feed filter
    if (this.selectedFeedId() !== null) {
      const selectedFeed = this.allFeeds().find((f) => f.id === this.selectedFeedId());
      if (selectedFeed) {
        const feed = this.groupedPosts().find((f) => f.feed_id === selectedFeed.id);
        if (feed) {
          const displayArticles = feed.posts.map((post) => ({
            id: post.id,
            badge: feed.feed_name,
            headline: post.title,
            timestamp: this.formatTimestamp(post.published_at),
            url: post.url,
            imageUrl: this.extractFirstImg(post.description),
          }));
          posts = displayArticles;
        }
      }
    }

    // Apply search filter
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      posts = posts.filter(
        (post) =>
          post.headline.toLowerCase().includes(query) || post.badge.toLowerCase().includes(query),
      );
    }

    this.filteredPosts.set(posts);
  }

  onQueryChange() {
    this.applyFilters();
  }

  // Handle feed selection
  selectFeed(feedId: string | null): void {
    this.selectedFeedId.set(feedId);
    this.applyFilters(); // Re-apply filters with new feed selection
  }

  toggleFeeds(): void {
    this.feedsExpanded.update((v) => !v);
  }

  getSelectedFeedName(): string {
    if (this.selectedFeedId() === null) return 'All Feeds';
    const feed = this.allFeeds().find((f) => f.id === this.selectedFeedId());
    return feed ? feed.name : 'All Feeds';
  }

  openArticle(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  highlightText(text: string, query: string): string {
    if (!query || !text) return text;

    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    return text.replace(regex, (match) => `<mark class="bg-yellow-200 px-0.5">${match}</mark>`);
  }
}
