import { Context } from "@resonatehq/sdk";
import {
  getProfile,
  getFollowersPage,
  type ProfileData,
  type FollowersPage,
} from "./bluesky/client.js";

export function* scrape(
  context: Context,
  actor: string,
  depth: number,
): Generator<any, void, any> {
  // Fetch profile
  const profile: ProfileData = yield* context.run(async (context: Context) => {
    return await getProfile(actor);
  });
  // Store profile in database
  yield* context.run((context: Context) => {
    console.log(`@${profile.handle}`);
  });
  // Iterate through followers page by page
  if (depth > 0) {
    let cursor: string | undefined = undefined;
    do {
      // Fetch one page of followers
      const page: FollowersPage = yield* context.run(async () => {
        return await getFollowersPage(profile.did, cursor);
      });
      // Schedule scrapes for this page's followers
      for (const follower of page.followers) {
        yield* context.detached(scrape, follower.did, depth - 1);
      }
      // advance
      cursor = page.cursor;
    } while (cursor !== undefined);
  }
}
