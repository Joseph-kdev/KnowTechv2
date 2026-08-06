# KnowTech v2

KnowTech v2 is a modern Angular-based news reading application designed to feel like a personalized content hub rather than a generic feed. The app combines authentication, curated feed discovery, article bookmarking, and theme customization into a single portfolio-friendly experience.

## What the app does

The current implementation includes:

- User authentication with email/password and Google sign-in through Firebase Auth.
- Protected routes so authenticated users can access the main app experience.
- A home feed that loads grouped posts from a backend API and presents them in a card-style layout.
- Feed discovery and subscription management, including searching available feeds and following or unfollowing them.
- Bookmarking support so users can save articles for later viewing.
- Multiple visual themes that can be selected from the profile area.

## Tech stack

- Angular 22
- TypeScript
- Tailwind CSS
- Angular Fire and Firebase Authentication
- RxJS
- REST API integration for posts, feeds, and bookmarks
- Vitest for unit testing

## Live preview

[Live Preview](https://your-live-preview-url.example)

## Local setup

### Prerequisites

- Node.js 20 or newer
- npm 10 or newer

### Installation

```bash
git clone <your-repo-url>
cd knowtechv2
npm install
```

### Run locally

```bash
npm start
```

Then open http://localhost:4200/ in your browser.

### Backend requirement

The frontend expects a compatible backend API to power the posts, feeds, and bookmarks experience. The backend is at this repo:[knowtech-go](https://github.com/Joseph-kdev/knowtech-go) and is written in Go.

### Build for production

```bash
npm run build
```

## Project structure

The application is organized around feature-based Angular components and services:

- [src/app/features](src/app/features) contains the main screens such as authentication, home, bookmarks, feed management, and profile.
- [src/app/services](src/app/services) contains the API and state services for auth, posts, bookmarks, and feeds.
