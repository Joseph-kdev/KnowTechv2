import { Component } from '@angular/core';

interface Article {
  badge: string;
  headline: string;
  timestamp: string;
}

interface FeedSuggestion {
  name: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
})
export class Home {
  readonly newsfeedArticles: Article[] = Array(4).fill({
    badge: 'WSJ world',
    headline: 'Sanofi Probed by EU Over Flu Vaccine Marketing',
    timestamp: '4h',
  });

  readonly bookmarkedArticles: Article[] = Array(4).fill({
    badge: 'WSJ world',
    headline: 'Sanofi Probed by EU Over Flu Vaccine Marketing',
    timestamp: '4h',
  });

  readonly recommendedFeeds: FeedSuggestion[] = [
    { name: 'Ars Artica' },
    { name: 'TechCrunch' },
    { name: 'The Verge' },
    { name: 'Reuters' },
  ];
}
