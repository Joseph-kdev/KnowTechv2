import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

@Service()
export class Feeds {
  private readonly serverUrl = "http://localhost:8000/api/"
  readonly http = inject(HttpClient)

  checkServerHealth() {
    return this.http.get(`${this.serverUrl}health`)
  }

  getFeedsSubscribedTo(): Observable<FeedGroup[]> {
    return this.http.get<FeedGroup[]>(`${this.serverUrl}posts`)
  }

  getAllFeeds(): Observable<Feed[]> {
    return this.http.get<Feed[]>(`${this.serverUrl}feeds`)
  }

  followAFeed(user_id: string, feed_id: string) {
    return this.http.post(`${this.serverUrl}follow_feeds`, {
      user_id,
      feed_id,
    })
  }

  unfollowAFeed(user_id: string, feed_id: string) {
    return this.http.post(`${this.serverUrl}unfollow_feeds`, {
      user_id,
      feed_id
    })
  }
}
