import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';

@Service()
export class PostService {
  private readonly serverUrl = 'http://localhost:8000/api/';
  readonly http = inject(HttpClient);

  getGroupedPosts(user_id: string) {
    return this.http.get<FeedGroup[]>(`${this.serverUrl}posts`, {
      params: {
        user_id: user_id
      }
    });
  }
}
