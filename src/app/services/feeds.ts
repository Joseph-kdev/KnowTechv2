import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

@Service()
export class Feeds {
  private readonly serverUrl = "https://knowtech-go.vercel.app/api/"
  readonly http = inject(HttpClient)

  getFeedsSubscribedTo(): Observable<FeedGroup[]> {
    return this.http.get<FeedGroup[]>(`${this.serverUrl}/posts`)
  }
}
