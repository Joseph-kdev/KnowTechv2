interface FeedGroup {
	FeedID:string;
	FeedName:string;
	FeedUrl:string;
	Posts:RSSItem[];
}

type RSSItem = {
  title: string;
  description: string;
  url: string;
  pubDate: string;
}
