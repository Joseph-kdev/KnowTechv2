import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { FeedGroup } from '../types';
import { serverUrl } from '../utils/utils';

@Service()
export class PostService {
  readonly http = inject(HttpClient);

  getGroupedPosts(user_id: string) {
    return this.http.get<FeedGroup[]>(`${serverUrl}posts`, {
      params: {
        user_id: user_id
      }
    });
  }
}
