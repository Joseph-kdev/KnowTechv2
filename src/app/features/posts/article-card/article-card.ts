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
}

@Component({
  selector: 'app-article-card',
  standalone: true,
  templateUrl: './article-card.html',
})
export class ArticleCardComponent {
  @Input() article!: DisplayArticle;
  @Input() searchQuery = '';
  @Output() articleSelected = new EventEmitter<string>();

  selectArticle(): void {
    if (this.article?.url) {
      this.articleSelected.emit(this.article.url);
    }
  }

  getDisplayDescription(): string {
    const raw = this.article?.description?.trim() ?? '';
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
