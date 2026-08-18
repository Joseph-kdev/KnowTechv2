import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/authService';
import { PostService } from '../../services/postService';
import { BookmarkService } from '../../services/bookmark-service';
import { finalize } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ArticleCardComponent, type DisplayArticle } from './article-card/article-card';
import { extractFirstImg, formatTimestamp, getPostTimestampValue } from '../../utils/utils';
import { FeedGroup } from '../../types';
import { NgxSpinnerComponent, NgxSpinnerService } from 'ngx-spinner';

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

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [FormsModule, ArticleCardComponent, NgxSpinnerComponent],
  templateUrl: './posts.html',
  styleUrl: './posts.css',
})
export class Posts implements OnInit {
  private readonly spinnerName = 'posts';

  auth = inject(AuthService);
  postService = inject(PostService);
  bookmarkService = inject(BookmarkService);
  spinner = inject(NgxSpinnerService);
  uid = this.auth._user()?.uid;

  readonly feedsExpanded = signal(true);
  readonly selectedFeedId = signal<string | null>(null);
  readonly allFeeds = signal<DisplayFeed[]>([]);
  readonly allPosts = signal<DisplayArticle[]>([]);
  filteredPosts = signal<DisplayArticle[]>([]);
  readonly groupedPosts = signal<FeedGroup[]>([]);
  readonly isLoading = signal(false);
  readonly isError = signal(false);
  readonly searchQuery = signal<string>('');

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.isLoading.set(true);
    this.spinner.show(this.spinnerName);
    this.postService
      .getGroupedPosts(this.uid as string)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
          this.spinner.hide(this.spinnerName);
        }),
      )
      .subscribe({
        next: (response: FeedGroup[]) => {
          console.log(response)
          this.processFeedData(response);
        },
        error: (err: any) => {
          console.log(err);
          this.isError.set(err.error.message ?? 'Error fetching posts from feeds');
        },
      });
  }

  processFeedData(feeds: FeedGroup[]) {
    this.groupedPosts.set(feeds);
    const displayFeeds = feeds.map((feed) => ({
      id: feed.feed_id,
      name: feed.feed_name,
      totalPosts: feed.posts.length,
    }));
    this.allFeeds.set(displayFeeds);
    const allPosts: DisplayArticle[] = feeds
      .flatMap((feed) =>
        feed.posts.map((post) => ({
          id: post.id,
          badge: feed.feed_name,
          headline: post.title,
          timestamp: formatTimestamp(post.published_at),
          url: post.url,
          imageUrl: extractFirstImg(post.description),
          description: post.description,
          publishedAt: post.published_at,
          feedId: feed.feed_id,
          feedName: feed.feed_name
        })),
      )
      .sort((a, b) => getPostTimestampValue(b.publishedAt) - getPostTimestampValue(a.publishedAt));

    this.allPosts.set(allPosts);

    this.applyFilters();
    this.selectedFeedId.set(null);
  }

  applyFilters(): void {
    let posts = this.allPosts();

    // Apply feed filter
    if (this.selectedFeedId() !== null) {
      const selectedFeed = this.allFeeds().find((f) => f.id === this.selectedFeedId());
      if (selectedFeed) {
        const feed = this.groupedPosts().find((f) => f.feed_id === selectedFeed.id);
        if (feed) {
          const displayArticles = feed.posts
            .map((post) => ({
              id: post.id,
              badge: feed.feed_name,
              headline: post.title,
              timestamp: formatTimestamp(post.published_at),
              url: post.url,
              imageUrl: extractFirstImg(post.description),
              description: post.description,
              publishedAt: post.published_at,
              feedId: feed.feed_id,
            }))
            .sort((a, b) => getPostTimestampValue(b.publishedAt) - getPostTimestampValue(a.publishedAt));
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

  onBookmarkToggle(articleId: string): void {
    const article = this.allPosts().find((post) => post.id === articleId);
    if (!article) {
      return;
    }

    this.bookmarkService.toggleBookmark(article);
  }

  isArticleBookmarked(url: string): boolean {
    return this.bookmarkService.isArticleBookmarked(url);
  }

  highlightText(text: string, query: string): string {
    if (!query || !text) return text;

    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    return text.replace(regex, (match) => `<mark class="bg-yellow-200 px-0.5">${match}</mark>`);
  }
}
