![example bluesky scraper banner](./assets/bsky-scraper.png)

# Resonate Bluesky Scraper

A _Bluesky Scraper_ powered by the Resonate TypeScript SDK. The scraper recursively fetches user profiles and their followers from the Bluesky social network.

## Behind the Scenes

The Scraper is implemented with Resonate's Durable Execution framework, Distributed Async Await. The scraper fetches a user's profile and followers, then spawns detached scrapes for each follower. On `yield* context.detached` each follower scrape becomes an independent durable promise that executes in the background. Note that we use the user's ID as the promise ID. This means we don't need to worry about duplicate scrapes: if the same user appears in multiple follower lists, all `context.detached` calls with that ID resolve to the same promise, guaranteeing that a user will only be scraped once.

```typescript
export function* scrape(
  context: Context,
  actor: string,
  depth: number,
): Generator<any, void, any> {
  const profile: ProfileData = yield* context.run(async () => {
    return await getProfile(actor);
  });

  if (depth > 0) {
    let cursor: string | undefined = undefined;

    do {
      const page: FollowersPage = yield* context.run(async () => {
        return await getFollowersPage(profile.did, cursor);
      });

      for (const follower of page.followers) {
        yield* context.detached(
          scrape,
          follower.did,
          depth - 1,
        );
      }

      cursor = page.cursor;
    } while (cursor !== undefined);
  }
}
```

## Setup Dependencies

### 1. Setup the Resonate Server

Install the [Resonate Server](https://github.com/resonatehq/resonate)

```bash
brew install resonatehq/tap/resonate
```

### 2. Setup the Scraper

Clone the repository

```bash
git clone https://github.com/resonatehq-examples/example-bluesky-scraper-ts.git
```

Install dependencies

```bash
npm install
```

## Running the Project

### 1. Start the Resonate Server

In Terminal #1, start the Resonate server in development mode listening on `http://localhost:8001`.

```bash
resonate dev
```

### 2. Build and Start the Worker

In Terminal #2, build and start the Resonate worker:

```bash
npm run build
npm start
```

### 3. Invoke a Scrape

In Terminal #3, start the scraper:

```bash
resonate invoke dominiktornow.bsky.social --func scrape --arg dominiktornow.bsky.social --arg 1
```

**Parameters:**

- `dominiktornow.bsky.social`: Unique ID for this scrape (using the handle)
- `--arg dominiktornow.bsky.social`: Bluesky handle to scrape
- `--arg 1`: Depth of recursion (0 = just this user, 1 = user + followers, etc.)

View all promises:

```bash
resonate promises search "*"
```

## Learn More

- [Resonate Documentation](https://docs.resonatehq.io)
- [Detached Execution Pattern](https://docs.resonatehq.io/concepts/detached)
- [TypeScript SDK Guide](https://docs.resonatehq.io/develop/typescript)
