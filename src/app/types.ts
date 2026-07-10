export interface FeedGroup {
	FeedID:string;
	FeedName:string;
	FeedUrl:string;
	Posts:Post[];
}

export interface Post {
  id: string;
  title: string;
  url: string;
  description: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface Feed {
  id:string;
	name:string;
	url:string;
  category: string;
  feed_followers_count: number;
}
