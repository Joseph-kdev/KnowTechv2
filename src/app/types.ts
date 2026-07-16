export interface FeedGroup {
	feed_id:string;
	feed_name:string;
	feed_url:string;
	posts:Post[];
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
