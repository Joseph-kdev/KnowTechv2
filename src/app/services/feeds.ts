import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Feed, FeedGroup } from '../types';
import { serverUrl } from '../utils/utils';

@Service()
export class Feeds {
  readonly http = inject(HttpClient)

  checkServerHealth() {
    return this.http.get(`${serverUrl}health`)
  }

  getFeedsSubscribedTo(user_id: string): Observable<Feed[]> {
    return this.http.get<Feed[]>(`${serverUrl}followed_feeds`, {
      params: {
        user_id: user_id
      }
    })
  }

  getAllFeeds(): Observable<Feed[]> {
    return this.http.get<Feed[]>(`${serverUrl}feeds`)
  }

  followAFeed(user_id: string, feed_id: string) {
    return this.http.post(`${serverUrl}follow_feeds`, {
      user_id,
      feed_id,
    })
  }

  unfollowAFeed(user_id: string, feed_id: string) {
    return this.http.post(`${serverUrl}unfollow_feeds`, {
      user_id,
      feed_id
    })
  }
}
