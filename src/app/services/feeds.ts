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

}
