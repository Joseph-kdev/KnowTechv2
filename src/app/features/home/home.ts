import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Feeds } from '../../services/feeds';
import { AuthService } from '../../services/authService';
import { PostService } from '../../services/postService';
import { BookmarkService } from '../../services/bookmark-service';
import { ArticleCardComponent, DisplayArticle } from '../posts/article-card/article-card';
import { finalize } from 'rxjs';
import { extractFirstImg, formatTimestamp, getPostTimestampValue } from '../../utils/utils';
import { CommonModule } from '@angular/common';
import { FeedGroup } from '../../types';

interface FeedSuggestion {
  name: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, ArticleCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  postService = inject(PostService);
  auth = inject(AuthService);
  uid = this.auth._user()?.uid;

  readonly isLoading = signal(false);
  readonly isError = signal(false);
  readonly allPosts = signal<DisplayArticle[]>([]);

  readonly recommendedFeeds: FeedSuggestion[] = [
    { name: 'Ars Artica' },
    { name: 'TechCrunch' },
    { name: 'The Verge' },
    { name: 'Reuters' },
  ];

  feedService = inject(Feeds);
  bookmarkService = inject(BookmarkService);

  readonly bookmarkedArticles = computed<DisplayArticle[]>(() =>
    this.bookmarkService.bookmarks().map((bookmark) => ({
      id: bookmark.id,
      badge: bookmark.feed_name || 'Bookmark',
      headline: bookmark.title,
      timestamp: formatTimestamp(bookmark.published_at),
      url: bookmark.url,
      imageUrl: null,
      description: bookmark.description,
      publishedAt: bookmark.published_at,
      feedId: bookmark.feed_id,
    })),
  );

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts() {
    this.isLoading.set(true);
    this.postService
      .getGroupedPosts(this.uid as string)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (response: FeedGroup[]) => {
          this.processFeedData(response);
        },
        error: (err: any) => {
          this.isError.set(err.error.message ?? 'Error fetching news feed posts');
        },
      });
  }

  processFeedData(feeds: FeedGroup[]) {
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
        })),
      )
      .sort((a, b) => getPostTimestampValue(b.publishedAt) - getPostTimestampValue(a.publishedAt));

    this.allPosts.set(allPosts);
  }

  openArticle(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  isArticleBookmarked(url: string): boolean {
    return this.bookmarkService.isArticleBookmarked(url);
  }

  onBookmarkToggle(articleId: string): void {
    let article = this.allPosts().find((p) => p.id === articleId);
    if (!article) {
      article = this.bookmarkedArticles().find((b) => b.id === articleId);
    }
    if (!article) {
      return;
    }

    this.bookmarkService.toggleBookmark(article);
  }
}
