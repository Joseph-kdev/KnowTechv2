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

type Feed = {
  id:string;
	name:string;
	url:string;
  category: string;
  feed_followers_count: number;
}
