export const serverUrl = "http://localhost:8000/api/"

export function extractFirstImg(html: string): string | null {
  if (!html) return null;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const imgElement = tempDiv.querySelector('img');
  if (imgElement && imgElement.src) {
    return imgElement.src;
  }

  // If no img tag, try to find image URL in the content
  // This handles cases where images might be embedded as markdown or plain URLs
  const imgRegex = /<img[^>]+src="([^">]+)"/i;
  const match = html.match(imgRegex);
  if (match && match[1]) {
    return match[1];
  }

  // Try to find plain image URLs (http...jpg, png, gif, webp)
  const urlRegex = /https?:\/\/[^\s'"]+\.(jpg|jpeg|png|gif|webp)/i;
  const urlMatch = html.match(urlRegex);
  if (urlMatch) {
    return urlMatch[0];
  }

  return null;
}

export function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h`;
  if (diffInHours < 48) return 'Yesterday';
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
  return date.toLocaleDateString();
}

export function getPostTimestampValue(dateString?: string): number {
  if (!dateString) return 0;

  const parsed = Date.parse(dateString);
  return Number.isNaN(parsed) ? 0 : parsed;
}
