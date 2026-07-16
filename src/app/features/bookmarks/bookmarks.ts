import { Component, inject, computed } from '@angular/core';
import { BookmarkService } from '../../services/bookmark-service';
import { ArticleCardComponent, DisplayArticle } from '../posts/article-card/article-card';
import { formatTimestamp } from '../../utils/utils';

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [ArticleCardComponent],
  templateUrl: './bookmarks.html',
  styleUrl: './bookmarks.css',
})
export class Bookmarks {
  private bookmarkService = inject(BookmarkService);

  readonly displayBookmarks = computed<DisplayArticle[]>(() =>
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

  isArticleBookmarked(url: string): boolean {
    return this.bookmarkService.isArticleBookmarked(url);
  }

  openArticle(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  onBookmarkToggle(articleId: string): void {
    const article = this.displayBookmarks().find((a) => a.id === articleId);
    if (article) {
      this.bookmarkService.toggleBookmark(article);
    }
  }
}
