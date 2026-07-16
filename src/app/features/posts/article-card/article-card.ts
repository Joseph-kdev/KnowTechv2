import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface DisplayArticle {
  id: string;
  badge: string;
  headline: string;
  timestamp: string;
  url: string;
  imageUrl: string | null;
  description?: string;
  publishedAt?: string;
  feedId?: string;
}

@Component({
  selector: 'app-article-card',
  standalone: true,
  templateUrl: './article-card.html',
})
export class ArticleCardComponent {
  @Input() article!: DisplayArticle;
  @Input() searchQuery = '';
  @Input() isBookmarked = false;
  @Output() articleSelected = new EventEmitter<string>();
  @Output() bookmarkToggled = new EventEmitter<string>();

  selectArticle(): void {
    if (this.article?.url) {
      this.articleSelected.emit(this.article.url);
    }
  }

  toggleBookmark(event: MouseEvent): void {
    event.stopPropagation();
    this.bookmarkToggled.emit(this.article.id);
  }

  getDisplayDescription(): string {
    const raw = this.article?.description?.trim() ?? '' as string;
    if (!raw) {
      return '';
    }

    const withoutTags = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return withoutTags.length > 140 ? `${withoutTags.slice(0, 137)}...` : withoutTags;
  }

  highlightText(text: string, query: string): string {
    if (!query || !text) {
      return text;
    }

    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    return text.replace(regex, (match) => `<mark class="bg-yellow-200 px-0.5">${match}</mark>`);
  }
}
