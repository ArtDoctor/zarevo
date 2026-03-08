# Zarevo

Idea validation tool. Validate startup ideas with basic or advanced AI-powered analysis.

## Tech stack

- SvelteKit 2 + Svelte 5
- Tailwind CSS 4
- PocketBase (auth + data)
- Vite 7

## Prerequisites

- [Bun](https://bun.sh/)

## Setup

1. Install dependencies:

```sh
bun install
```

2. Copy `.env.example` to `.env` and set:

- `PB_URL` / `PUBLIC_PB_URL` – PocketBase instance URL
- `PUBLIC_BACKEND_URL` – Backend API URL

## Developing

```sh
bun run dev

# or start the server and open the app in a new browser tab
bun run dev -- --open
```

## Building

```sh
bun run build
```

Preview the production build:

```sh
bun run preview
```

## Testing

E2E tests with Playwright:

```sh
bun run test
```

## Deployment

Deployed automatically to https://zarevo.yazero.io when changes are pushed to `main`.