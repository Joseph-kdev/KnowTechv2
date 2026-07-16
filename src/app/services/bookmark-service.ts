import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Service, signal } from '@angular/core';
import { Subscription, tap } from 'rxjs';
import { serverUrl } from '../utils/utils';
import { AuthService } from './authService';
import { DisplayArticle } from '../features/posts/article-card/article-card';

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description: string;
  user_id: string;
  feed_id: string;
  feed_name: string;
  published_at: string;
}

@Service()
export class BookmarkService {
  readonly http = inject(HttpClient);
  readonly auth = inject(AuthService);

  readonly bookmarks = signal<Bookmark[]>([]);
  private activeBookmarkLoad?: Subscription;

  readonly bookmarkedIds = computed(() => new Set(this.bookmarks().map((bookmark) => bookmark.id)));
  readonly bookmarkedUrls = computed(() => new Set(this.bookmarks().map((bookmark) => bookmark.url)));

  isBookmarked = computed(() => {
    const urls = this.bookmarkedUrls();
    return (articleUrl: string) => urls.has(articleUrl);
  });

  bookmarkedIdArray = computed(() => Array.from(this.bookmarkedIds()));
  bookmarkedUrlsArray = computed(() => Array.from(this.bookmarkedUrls()));

  constructor() {
    const stored = localStorage.getItem('bookmarks_data');
    if (stored) {
      try {
        this.bookmarks.set(JSON.parse(stored) as Bookmark[]);
      } catch {
        this.bookmarks.set([]);
      }
    }

    effect(() => {
      const bookmarks = this.bookmarks();
      localStorage.setItem('bookmarks_data', JSON.stringify(bookmarks));
    });

    effect(() => {
      const uid = this.auth._user()?.uid;
      if (uid) {
        this.loadBookmarksFromAPI(uid);
      }
    });
  }

  AddBookmark({
    title,
    url,
    description,
    user_id,
    feed_id,
    feed_name,
    published_at,
  }: Omit<Bookmark, 'id'>) {
    if (!user_id) {
      throw new Error('User not authenticated');
    }

    return this.http
      .post<Bookmark>(`${serverUrl}bookmarks`, {
        title,
        url,
        description,
        user_id,
        feed_id,
        feed_name,
        published_at,
      })
      .pipe(
        tap((bookmark) => {
          this.addBookmarkToState(bookmark);
        }),
      );
  }

  GetBookmarks(user_id: string) {
    return this.http.get<Bookmark[]>(`${serverUrl}bookmarks`, {
      params: {
        user_id: user_id,
      },
    });
  }

  RemoveBookmark(user_id: string, id: string) {
    return this.http
      .post<{ success: boolean }>(`${serverUrl}remove-bookmarks`, {
        user_id: user_id,
        id: id,
      })
      .pipe(
        tap(() => {
          this.removeBookmarkFromState(id);
        }),
      );
  }

  initialize() {
    const uid = this.auth._user()?.uid;
    if (uid) {
      this.loadBookmarksFromAPI(uid);
    }
  }

  loadBookmarksFromAPI(user_id: string) {
    this.activeBookmarkLoad?.unsubscribe();
    this.activeBookmarkLoad = this.GetBookmarks(user_id).subscribe({
      next: (response: Bookmark[]) => {
        const bookmarks = response || [];
        this.bookmarks.set(bookmarks);
      },
      error: (err: Error) => {
        console.log('Error loading bookmarks', err);
      },
    });
  }

  toggleBookmark(article: DisplayArticle): void {
    const currentUserId = this.auth._user()?.uid;
    if (!currentUserId || !article?.url) {
      return;
    }

    if (this.isArticleBookmarked(article.url)) {
      const bookmark = this.bookmarks().find((b) => b.url === article.url);
      if (bookmark) {
        this.RemoveBookmark(currentUserId, bookmark.id).subscribe();
      }
    } else {
      this.AddBookmark({
        title: article.headline,
        url: article.url,
        description: article.description ?? '',
        user_id: currentUserId,
        feed_id: article.feedId ?? '',
        feed_name: article.badge ?? '',
        published_at: article.publishedAt ?? '',
      }).subscribe();
    }
  }

  private addBookmarkToState(bookmark: Bookmark): void {
    const currentBookmarks = this.bookmarks();
    this.bookmarks.set([...currentBookmarks.filter((item) => item.id !== bookmark.id), bookmark]);
  }

  private removeBookmarkFromState(id: string): void {
    const currentBookmarks = this.bookmarks();
    this.bookmarks.set(currentBookmarks.filter((bookmark) => bookmark.id !== id));
  }

  isArticleBookmarked(url: string): boolean {
    return this.bookmarkedUrls().has(url);
  }

  syncBookmarks(userId: string): void {
    this.loadBookmarksFromAPI(userId);
  }
}
