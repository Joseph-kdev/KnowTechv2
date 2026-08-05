import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { FeedGroup } from '../types';
import { serverUrl } from '../utils/utils';
import { Observable, of, tap } from 'rxjs';

interface CachedPosts {
  cachedAt: number;
  posts: FeedGroup[];
}

const POSTS_CACHE_KEY_PREFIX = 'posts_cache_';
const POSTS_CACHE_TTL_MS = 60 * 60 * 1000;

@Service()
export class PostService {
  readonly http = inject(HttpClient);

  getGroupedPosts(user_id: string): Observable<FeedGroup[]> {
    const cachedPosts = this.getCachedPosts(user_id);
    if (cachedPosts) {
      return of(cachedPosts);
    }

    return this.http
      .get<FeedGroup[]>(`${serverUrl}posts`, {
        params: { user_id },
      })
      .pipe(tap((posts) => this.cachePosts(user_id, posts)));
  }

  clearGroupedPostsCache(user_id: string): void {
    try {
      localStorage.removeItem(this.cacheKey(user_id));
    } catch {
      // Nothing else is required if browser storage is unavailable.
    }
  }

  private getCachedPosts(userId: string): FeedGroup[] | null {
    try {
      const cached = localStorage.getItem(this.cacheKey(userId));
      if (!cached) {
        return null;
      }

      const { cachedAt, posts }: CachedPosts = JSON.parse(cached);
      if (
        typeof cachedAt !== 'number' ||
        !Array.isArray(posts) ||
        Date.now() - cachedAt >= POSTS_CACHE_TTL_MS
      ) {
        this.clearGroupedPostsCache(userId);
        return null;
      }

      return posts;
    } catch {
      this.clearGroupedPostsCache(userId);
      return null;
    }
  }

  private cachePosts(userId: string, posts: FeedGroup[]): void {
    try {
      const cachedPosts: CachedPosts = { cachedAt: Date.now(), posts };
      localStorage.setItem(this.cacheKey(userId), JSON.stringify(cachedPosts));
    } catch {
      // Loading posts should still work when localStorage is unavailable or full.
    }
  }

  private cacheKey(userId: string): string {
    return `${POSTS_CACHE_KEY_PREFIX}${userId}`;
  }
}
